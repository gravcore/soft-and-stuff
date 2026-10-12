import { unstable_cache } from 'next/cache';
import httpClientServer from './httpClient.server';

// Allows to save data on the nextjs cache 
// A single product detail
export const getProduct = (slug: string) =>
    unstable_cache(
        async () => {
            const { data } = await httpClientServer.get(`/products/${slug}`);
            return data.data.product;
        },
        ['product', slug],
        {
            tags: ['products', `product-${slug}`],
        }
    )();

// List of products saved in cache
export const getProducts = (searchParams: Record<string, string | undefined>) =>
    unstable_cache(
        async () => {
            const { data } = await httpClientServer.get('/products', {
                params: searchParams,
            });
            return data.data;
        },
        ['products', JSON.stringify(searchParams)],
        {
            tags: ['products'],
        },
    )();