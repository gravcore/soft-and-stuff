export interface Products {
    id: string, 
    category_id: string | null,
    product_name: string,
    product_description: string | null,
    slug: string,
    sku: string,
    stock: number,
    is_active: boolean,
    is_featured: boolean,
    price_in_cents: number,
    compare_price: number | null,
    images_url: string[],
    videos_url: string[],
    metadata: Record<string, unknown> | null,
    created_at: Date,
    updated_at: Date,
}

export interface ProductFilters {
    categorySlug?: string,
    featured?: boolean,
    search?: string,
    minPrice?: number,
    maxPrice?: number,
    sort?: ('price_asc' | 'price_desc' | 'newest' | 'popular')[],
}