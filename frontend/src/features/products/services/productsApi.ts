import httpClient from "@/shared/services/httpClient";
import type { Product, ProductFilters, PaginatedProducts, Category } from '../types/product.types';
import type { BulkCreateResult, BulkProductRowInput } from "../schema/productsSchema";

interface RawProduct {
    id: string;
    category_id: string | null;
    category_name: string | null;
    category_image_url: string | null;
    product_name: string;
    slug: string;
    product_description: string | null;
    price_in_cents: number;
    compare_price: number | null;
    sku: string | null;
    stock: number;
    is_active: boolean;
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

export interface ProductInput {
    productName: string;
    categoryId?: string | null;
    description?: string;
    priceInCents: number;
    comparePrice?: number | null;
    sku?: string;
    stock: number;
    isFeatured: boolean;
    imagesUrl: string[];
    videosUrl: string[];
    metadata?: Record<string, unknown>;
}

const mapProduct = (raw: RawProduct): Product => ({
    id: raw.id, categoryId: raw.category_id, categoryName: raw.category_name, categoryImageUrl: raw.category_image_url,
    productName: raw.product_name,
    slug: raw.slug, description: raw.product_description, priceInCents: raw.price_in_cents,
    comparePrice: raw.compare_price, sku: raw.sku, stock: raw.stock, isActive: raw.is_active, isFeatured: raw.is_featured,
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

export const fetchProductById = async (id: string): Promise<Product> => {
    const { data } = await httpClient.get(`/products/id/${id}`);
    return mapProduct(data.data.product);
};

export const fetchCategories = async (): Promise<Category[]> => {
    const { data } = await httpClient.get('/products/categories');
    return data.data.categories.map((c: RawCategory) => ({ id: c.id, name: c.name, slug: c.slug, imageUrl: c.image_url }));
};

export const createProduct = async (input: ProductInput): Promise<Product> => {
    const { data } = await httpClient.post('/products', input);
    return mapProduct(data.data.product);
};

export const updateProduct = async (id: string, input: Partial<ProductInput>): Promise<Product> => {
    const { data } = await httpClient.patch(`/products/${id}`, input);
    return mapProduct(data.data.product);
};

export const deleteProduct = async (id: string): Promise<void> => {
    await httpClient.delete(`/products/${id}`);
};

export const uploadProductImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file); // Matches backend's multer field
    const { data } = await httpClient.post('/media/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data.url;
};

export const uploadProductVideo = async (file: File, title: string): Promise<{ videoId: string; embedUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    const { data } = await httpClient.post('/media/videos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
};

export const createCategory = async (name: string): Promise<Category> => {
    const { data } = await httpClient.post('/products/categories', { name });
    const category = data.data.category;
    return {
        id: category.id,
        name: category.name,
        imageUrl: category.image_url,
        slug: category.slug,
    };
};

export const searchCategories = async (query: string): Promise<Category[]> => {
    const { data } = await httpClient.get('/categories/search', {
        params: { q: query }
    });
    const categories = data.data.categories;

    return categories.map((c: { id: string; name: string; slug: string; image_url: string | null }) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        imageUrl: c.image_url,
    }));
};

export const bulkCreateProducts = async (rows: BulkProductRowInput[]): Promise<BulkCreateResult[]> => {
    const { data } = await httpClient.post('/products/bulk', {
        products: rows
    }, { timeout: 60_000 });
    return data.data.results;
};
