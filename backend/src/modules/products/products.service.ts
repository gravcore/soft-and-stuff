import { AppError } from "@/shared/errors/AppError";
import { buildMeta, parsePagination } from "@/shared/utils/pagination";
import { productsRepository } from "./products.repository";
import { CreateProductInput, UpdateProductInput } from "./products.schema";
import { Request } from 'express';
import { ProductFilters } from "./products.types";

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

    async getCategories() {
        return productsRepository.findCategories();
    },

    async create(input: CreateProductInput) {
        const slug = slugify(input.productName);
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
};