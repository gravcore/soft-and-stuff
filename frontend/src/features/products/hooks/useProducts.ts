import { useQuery } from '@tanstack/react-query';
import { fetchProducts, fetchProductBySlug, fetchCategories } from '../services/productsApi';
import type { ProductFilters } from '../types/product.types';

export const useProducts = (filters: ProductFilters) =>
    useQuery({
        queryKey: ['products', filters],
        queryFn: () => fetchProducts(filters),
        placeholderData: (prev) => prev,
    });

export const useProduct = (slug: string) =>
    useQuery({
        queryKey: ['product', slug],
        queryFn: () => fetchProductBySlug(slug),
        enabled: !!slug, // converts to boolean to not fire if slug is empty/undefined 
    });

export const useCategories = () =>
    useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
        staleTime: 10 * 60 * 1000, // categories rarely change, cache 10 min, avoid refetching on every nav
    });
