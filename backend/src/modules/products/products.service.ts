import { AppError } from "@/shared/errors/AppError";
import { buildMeta, parsePagination } from "@/shared/utils/pagination";
import { productsRepository } from "./products.repository";
import { BulkCreateResult, BulkProductRowInput, CreateProductInput, UpdateProductInput } from "./products.schema";
import { Request } from 'express';
import { ProductFilters } from "./products.types";
import { withTransaction } from "@/config/database";
import { env } from "@/config/env";

// Converts a product name into a URL-friendly slug
// "Running sheos - Men's" -> "running-shoes-mens"
const slugify = (name: string): string => 
    name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // e.g. "running shoes - men's!" -> "running shoes - mens"
                                      // it just strips out the apostrophe and exclamation mark,
                                      // leaving letters, numbers, spaces, and the hyphen untouched
        .trim()                       // Removes leading and trailing spaces e.g. " running shoes " -> "running shoes"
        .replace(/\s+/g, '-');        // replace spaces with hyphens (\s+ = one or more whitespace chars)

const skuify = (productName: string): string => {
    const sku = slugify(productName).slice(0, 10).toUpperCase()
        .replace(/-/g, '');
    return `SKU-${sku}`;
}

// How many rows to insert per database round-trip
// For the bulk multiple insertion of products
const CHUNK_SIZE = 200;

export const productsService = {

    async listProducts(filters: ProductFilters, req: Request) {
        const pagination = parsePagination(req);
        const { rows, total } = await productsRepository.findMany(filters, pagination);
        return { products: rows, meta: buildMeta(total, pagination) };
    },

    async getBySlug(slug: string) {
        const product = await productsRepository.findBySlug(slug);
        if (!product) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
        return product;
    },

    async getById(id: string) {
        const product = await productsRepository.findByIdWithCategory(id);
        if (!product) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
        return product;
    },

    async getCategories() {
        return productsRepository.findCategories();
    },

    async getUniqueValue(params: {
        field: 'slug' | 'sku',
        table: 'products' | 'categories',
        providedValue?: string | undefined,
        name: string;
    }): Promise<string> {
        const base = params.providedValue?.trim() 
            || (params.field === 'slug' ? slugify(params.name) : skuify(params.name));
        
        let candidate = base;
        let suffix = 2;

        while (await productsRepository.valueExists(params.table, params.field, candidate)) {
            candidate = `${base}-${suffix}`;
            suffix++;
        }

        return candidate;
    },

    async getOrCreateCategory(name: string) {
        const displayName = name.trim().replace(/\s+/g, ' ');
        const normalized = displayName.toLowerCase();

        const existing = await productsRepository.findCategoryByName(normalized);
        if (existing) return existing;
        
        return productsRepository.createCategory(displayName, await this.getUniqueValue({field: 'slug', table: 'categories', name: displayName,}));
    },

    async searchCategories(query: string) {
        const trimmed = query.trim();
        if (trimmed.length === 0) return [];
        return productsRepository.searchCategories(trimmed);
    },

    async create(input: CreateProductInput) {
        const slug = await this.getUniqueValue({name: input.productName, table: 'products', field: 'slug'});
        return productsRepository.create({ ...input, slug });
    },

    async update(id: string, input: UpdateProductInput) {
        const existing = await productsRepository.findById(id);
        if (!existing) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');

        // regenerate slug only if name changed
        const slug = input.productName ? slugify(input.productName) : undefined;
        return productsRepository.update(id, { ...input, ...(slug ? { slug } : {}) });
    },

    async delete(id: string) {
        const existing = await productsRepository.findById(id);
        if (!existing) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
        await productsRepository.softDelete(id);
    },

    async bulkCreate(rows: BulkProductRowInput[]): Promise<BulkCreateResult[]> {
        
        // Ony pass real category names
        const categoryNames = rows
            .map((r) => r.categoryName)
            .filter((name): name is string => Boolean(name));

        const nameToId = await productsRepository.resolveCategoriesByName(categoryNames);

        // Attach the resolved categoryId onto each row
        const withCategoryId = rows.map((r) => ({
            ...r,
            categoryId: r.categoryName ? nameToId.get(r.categoryName.trim().toLowerCase()) : undefined,
            slug: r.slug?.trim() || slugify(r.productName),
            sku: r.sku?.trim() || skuify(r.productName),
        }));

        const results: BulkCreateResult[] = [];

        // Walk through the rows in chunks of CHUNK_SIZE not one a time
        for (let start = 0; start < withCategoryId.length; start += CHUNK_SIZE) {
            const chunk = withCategoryId.slice(start, start + CHUNK_SIZE);

            // Reject rows with no categoryId
            const validChunk = chunk.filter((p) => {
                if (!p.categoryId) {
                    results.push({
                        row: withCategoryId.indexOf(p),
                        success: false,
                        error: 'CATEGORY_IS_REQUIRED'
                    });
                    return false;
                }
                return true;
            }) as (BulkProductRowInput & { categoryId: string })[];
            
            if (validChunk.length === 0) continue; // whole chunk had no valid rows

            try {
                const inserted = await withTransaction((client) =>
                    productsRepository.bulkInsertProducts(validChunk, client)
                );

                inserted.forEach((row, i) => {
                    results.push({
                        row: start + i,
                        success: true,
                        productId: row.id,
                    });
                });
            } catch {
                // Something in this chunk failed
                for (let i = 0; i < validChunk.length; i++) {
                    const row = validChunk[i];

                    try {
                        const [inserted] = await withTransaction(((client) => 
                            productsRepository.bulkInsertProducts([row], client)
                        ));

                        results.push({
                            row: start + i,
                            success: true,
                            productId: inserted.id
                        });
                    } catch (rowErr) {
                        const pgCode = (rowErr as { code?: string}).code;
                        const constraint = (rowErr as {constraint?: string}).constraint;

                        // 23505 unique violation from DB
                        if (pgCode === '23505' && constraint?.includes('slug')) {
                            row.slug = await productsService.getUniqueValue({ field: 'slug', table: 'products', providedValue: row.slug, name: row.productName });
                        } else if (pgCode === '23505' && constraint?.includes('sku')) {
                            row.sku = await productsService.getUniqueValue({ field: 'sku', table: 'products', providedValue: row.sku, name: row.productName });
                        } else {
                            results.push({
                                row: start + i,
                                success: false,
                                error: env.NODE_ENV === 'development' ? rowErr instanceof Error ? rowErr.message : 'UNKNOWN_ERROR' : `ERROR_IN_COLUMNS_WHILE_INSERTING::${row.productName}`,
                            });
                            continue; // skip the retry below
                        }

                        // Retry once only for this row, only after actually fixing
                        try {
                            const [retried] = await withTransaction((client) => 
                                productsRepository.bulkInsertProducts([row], client)
                            );
                            results.push({ row: start + i, success: true, productId: retried.id });
                        } catch (retryErr) {
                            results.push({
                                row: start + i,
                                success: false,
                                error:
                                    env.NODE_ENV === 'development'
                                        ? retryErr instanceof Error ? retryErr.message : 'UNKNOWN_ERROR'
                                        : `ERROR_IN_COLUMNS_WHILE_INSERTING::${row.productName}`,
                            });
                        }

                    }
                }
            }
        }

        return results;
    }
};