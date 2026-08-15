export interface Product {
    id: string;
    categoryId: string | null;
    productName: string;
    slug: string;
    description: string | null;
    priceInCents: number;
    comparePrice: number | null;
    sku: string | null;
    stock: number;
    isFeatured: boolean;
    imagesUrl: string[];
    videosUrl: string[];
    metadata: Record<string, unknown>;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
}

export interface ProductFilters {
    category?: string;
    featured?: boolean;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string[];
    page?: number;
    limit?: number;
}

export interface PaginatedProducts {
    products: Product[];
    meta: { total: number; page: number; limit: number; totalPages: number; }
}