import { useQuery } from '@tanstack/react-query';
import { fetchProducts, fetchProductBySlug, fetchCategories, fetchProductById, searchCategories } from '../services/productsApi';
import type { ProductFilters } from '../types/product.types';
import { useDebounce } from '@/shared/hooks/useDebounce';

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

export const useProductById = (id: string) =>
    useQuery({
        queryKey: ['product', 'id', id],
        queryFn: () => fetchProductById(id),
        enabled: !!id,
    });

export const useCategorySearch = (query: string) => {
    const debouncedQuery = useDebounce(query, 300);
    return useQuery({
        queryKey: ['categories', 'search', debouncedQuery],
        queryFn: () => searchCategories(debouncedQuery),
        enabled: debouncedQuery.trim().length > 0,
        placeholderData: (prev) => prev,
    });
}