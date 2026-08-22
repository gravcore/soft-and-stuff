import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategory, createProduct, deleteProduct, updateProduct, type ProductInput } from '../services/productsApi';

export function useCreateProduct() {
    const queryClient = useQueryClient(); // React Query's cache

    return useMutation({
        mutationFn: (input: ProductInput) => createProduct(input),
        onSuccess: () => {
            // Marks every cached query tagged 'products' as outdated,
            // so React query automatically refetches them
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

export function useUpdateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, input }: { id: string, input: Partial<ProductInput> }) => updateProduct(id, input),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product', data.slug] });
        }
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (name: string) => createCategory(name),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
    });
}