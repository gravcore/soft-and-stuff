import { schemaError } from '@/shared/errors/schemaError';
import { z } from 'zod';

export const createProductSchema = z.object({
    categoryId: 
        z.uuid(schemaError('PRODUCT_CATEGORY_INVALID_UUID', 'Invalid UUID in category id'))
        .optional(),
    productName: 
        z.string()
        .min(1, schemaError('PRODUCT_NAME_TOO_SHORT', 'Product name too short'))
        .max(255, schemaError('PRODUCT_NAME_TOO_LONG', 'Product name too long')),
    productDescription: 
        z.string()
        .max(5000, schemaError('PRODUCT_DESCRIPTION_TOO_LONG', 'Product description is too long'))
        .optional(),
    slug: 
        z.string()
        .min(1, schemaError('PRODUCT_SLUG_TOO_SHORT', 'Product slug too short'))
        .max(255, schemaError('PRODUCT_SLUG_TOO_LONG', 'Product slug too long')),
    sku: 
        z.string()
        .min(1, schemaError('PRODUCT_SKU_TOO_SHORT', 'Product sku too short'))
        .max(50, schemaError('PRODUCT_SKU_TOO_LONG', 'Product sku too long')),
    stock: 
        z.number().int()
        .min(0, schemaError('INVALID_STOCK', 'Stock must be 0 or greater'))
        .default(0),
    isActive: 
        z.boolean()
        .default(true),
    isFeatured:
        z.boolean()
        .default(false),
    priceInCents: 
        z.number(schemaError('PRODUCT_PRICE_REQUIRED', 'Product price required')).int()
        .min(0, schemaError('INVALID_PRICE', 'Price must be 0 or greater')),
    comparePrice: 
        z.number(schemaError('PRODUCT_COMPARE_PRICE_REQUIRE_NUMBER', 'Product compare price require a number')).int() 
        .min(0, schemaError('INVALID_PRICE', 'Price must be 0 or greater'))
        .optional(),
    images:
        z.array(z.url(schemaError('PRODUCT_IMAGE_INVALID_URL', 'Each image must be a valid url')))
        .default([]),
    videos: 
        z.array(z.url(schemaError('PRODUCT_VIDEO_INVALID_URL', 'Each video must be a valid url')))
        .default([]),
    metadata:
        z.record(z.string(), z.unknown())
        .default({}),
});

export const updateProductSchema = createProductSchema.partial();

export const productFiltersSchema = z.object({
    categorySlug: z.string().optional(),
    featured: z.coerce.boolean().optional(),
    search: z.string().optional(),
    minPrice: z.coerce.number().int().min(0).optional(),
    maxPrice: z.coerce.number().int().min(0).optional(),
    sort: z.enum([ 'price_asc', 'price_desc', 'newest', 'popular' ]).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductFiltersInput = z.infer<typeof productFiltersSchema>;
