import { PaginationParams } from "@/shared/types";
import { ProductFilters } from "./products.types";
import { db } from "@/config/database";

interface ProductRow {
    id:                     string;
    category_id:            string | null;
    product_name:           string;
    slug:                   string;
    product_description:    string | null;
    price_in_cents:         number;
    compare_price:          number | null;
    sku:                    string | null;
    stock:                  number;
    is_active:              boolean;
    is_featured:            boolean;
    images_url:             string[];
    videos_url:             string[];
    metadata:               Record<string, unknown>;
    created_at:             Date;
    updated_at:             Date;
}

interface CreateProductParams {
    name:           string;
    slug:           string;
    categoryId?:    string;
    description?:   string;
    priceInCents:   number;
    comparePrice?:  number;
    sku?:           string;
    stock:          number;
    isFeatured:     boolean;
    images:         string[];
    videos:         string[];
    metadata:       Record<string, unknown>;
}

export const productsRepository = {

    async findMany(
        filters: ProductFilters,
        pagination: PaginationParams
    ): Promise<{ rows: ProductRow[], total: number }> {
        const conditions: string[] = ['p.is_active = true'] // always show active products only
        
        // Values of the conditions
        const values: unknown[] = [];

        // Tracks placeholder number dynamically instead of using fixed $1, $2, etc.
        let idx: number = 1;

        if (filters.categorySlug) {
            conditions.push(`c.slug = $${idx++}`);
            values.push(filters.categorySlug);
        }

        if (filters.featured !== undefined) {
            conditions.push(`p.is_featured = $${idx++}`);
            values.push(filters.featured);
        }

        if (filters.search) {
            // case-insensitive LIKE search
            conditions.push(`(p.product_name ILIKE $${idx} OR p.product_description ILIKE $${idx++})`);
            values.push(`%${filters.search}%`); // % matches any chars before/after the term
        }

        if (filters.minPrice !== undefined) {
            conditions.push(`p.price_in_cents >= $${idx++}`);
            values.push(filters.minPrice);
        }

        if (filters.maxPrice !== undefined) {
            conditions.push(`p.price_in_cents <= $${idx++}`);
            values.push(filters.maxPrice);
        }

        const sortMap: Record<string, string> = {
            price_asc: 'p.price_in_cents ASC',
            price_desc: 'p.price_in_cents DESC',
            newest: 'p.created_at DESC',
            popular: 'p.is_featured DESC, p.created_at DESC',
        }

        const orderBy = (filters.sort?.length ? filters.sort : ['newest'])
            .map((s) => sortMap[s])
            .join(', ');

        const where = conditions.join(' AND ');

        // Run queries at the same time
        const [{ rows }, { rows: countRows }] = await Promise.all([
            db.query<ProductRow>(
                `SELECT p.*
                FROM products p
                LEFT JOIN categories c ON c.id = p.category_id
                WHERE ${where}
                ORDER BY ${orderBy}
                LIMIT $${idx} OFFSET $${idx + 1}`,
                [...values, pagination.limit, pagination.offset]
            ),

            // Second query needed because combining with COUNT(*) requires GROUP BY which breaks pagination
            db.query<{ count: string }>(
                `SELECT COUNT(*) AS count
                FROM products p
                LEFT JOIN categories c ON c.id = p.category_id
                WHERE ${where}`,
                values
            ),
        ]);

        return { rows, total: parseInt(countRows[0].count) };
    },

    // Single product lookup by URL slug, used on the product detail page
    async findBySlug(slug: string): Promise<ProductRow | null> {
        const { rows } = await db.query<ProductRow>(
            `SELECT * FROM products WHERE slug = $1 AND is_active = true LIMIT 1`,
            [slug]
        );
        return rows[0] ?? null;
    },

    async findById(id: string): Promise<ProductRow | null> {
        const { rows } = await db.query<ProductRow>(
            `SELECT * FROM products WHERE id = $1 LIMIT 1`,
            [id]
        );
        return rows[0] ?? null;
    },
     
    async create(input: CreateProductParams): Promise<ProductRow> {
        const { rows } = await db.query<ProductRow>(
            `INSERT INTO products
            (category_id, product_name, slug, product_description, price_in_cents, compare_price,
              sku, stock, is_featured, images, videos_id, metadata)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
            RETURNING *`,
            [
                input.categoryId ?? null,
                input.name,
                input.slug,
                input.description ?? null,
                input.priceInCents,
                input.comparePrice ?? null,
                input.sku ?? null,
                input.stock,
                input.isFeatured,
                JSON.stringify(input.images),
                JSON.stringify(input.videos),
                JSON.stringify(input.metadata),
            ]
        );
        return rows[0];
    },

    async update(id: string, input: Partial<CreateProductParams>): Promise<ProductRow | null> {
        const { rows } = await db.query<ProductRow>(
            `UPDATE products SET
                category_id         = COALESCE($2, category_id),
                product_name        = COALESCE($3, product_name),
                slug                = COALESCE($4, slug),
                product_description = COALESCE($5, product_description),
                price_in_cents      = COALESCE($6, price_in_cents),
                compare_price       = COALESCE($7, compare_price),
                sku                 = COALESCE($8, sku),
                stock               = COALESCE($9, stock),
                is_featured         = COALESCE($10, is_featured),
                images_url          = COALESCE($11, images_url),
                videos_url          = COALESCE($12, videos_url),
                metadata            = COALESCE($13, metadata),
                updated_at          = NOW()
            WHERE id = $1
            RETURNING *`,
            [
                id,
                input.categoryId ?? null,
                input.name ?? null,
                input.slug ?? null,
                input.description ?? null,
                input.priceInCents ?? null,
                input.comparePrice ?? null,
                input.sku ?? null,
                input.stock ?? null,
                input.isFeatured ?? null,
                input.images ? JSON.stringify(input.images) : null,
                input.videos ? JSON.stringify(input.videos) : null,
                input.metadata ? JSON.stringify(input.metadata) : null,
            ]       
        );
        return rows[0] ?? null;
    },

    // sets is_active to false instead of deleting the row
    async softDelete(id: string): Promise<void> {
        await db.query(
            `UPDATE products SET is_active = false, updated_at = NOW() WHERE id = $1`,
            [id]
        );
    },

    async findCategories(): Promise<{ id: string; name: string; slug: string; image_url: string | null }[]> {
        const { rows } = await db.query(
            `SELECT id, category_name AS name, slug, image_url FROM categories ORDER BY category_name ASC`
        );
        return rows;
    },
};