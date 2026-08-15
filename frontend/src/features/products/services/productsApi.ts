import httpClient from "@/shared/services/httpClient";
import type { Product, ProductFilters, PaginatedProducts, Category } from '../types/product.types';

interface RawProduct {
    id: string;
    category_id: string | null;
    product_name: string;
    slug: string;
    product_description: string | null;
    price_in_cents: number;
    compare_price: number | null;
    sku: string | null;
    stock: number;
    is_featured: boolean;
    images_url: string[];
    videos_url: string[];
    metadata: Record<string, unknown>;
}

interface RawCategory {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
}

const mapProduct = (raw: RawProduct): Product => ({
    id: raw.id, categoryId: raw.category_id, productName: raw.product_name,
    slug: raw.slug, description: raw.product_description, priceInCents: raw.price_in_cents,
    comparePrice: raw.compare_price, sku: raw.sku, stock: raw.stock, isFeatured: raw.is_featured,
    imagesUrl: raw.images_url ?? [], videosUrl: raw.videos_url ?? [],
    metadata: raw.metadata ?? {},
});

export const fetchProducts = async (filters: ProductFilters): Promise<PaginatedProducts> => {
    const { data } = await httpClient.get('/products', { params: filters });
    return {
        products: data.data.products.map(mapProduct),
        meta: data.meta,
    };    
};

export const fetchProductBySlug = async (slug: string): Promise<Product> => {
    const { data } = await httpClient.get(`/products/${slug}`);
    return mapProduct(data.data.product);
};

export const fetchCategories = async (): Promise<Category[]> => {
    const { data } = await httpClient.get('/products/categories');
    return data.data.categories.map((c: RawCategory) => ({ id: c.id, name: c.name, slug: c.slug, imageUrl: c.image_url }));
};
