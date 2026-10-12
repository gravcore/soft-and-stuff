import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllOrders, fetchOrderById, updateOrderStatus, type AdminOrdersFilters } from '../services/adminApi';

export const useAdminOrders = (filters: AdminOrdersFilters) => {
    const ordersQuery = useQuery({
        queryKey: ['admin', 'orders', filters],
        queryFn: () => fetchAllOrders(filters),
        placeholderData: (prev) => prev,
    });

    return {
        data: ordersQuery.data,
        isLoading: ordersQuery.isLoading,
    };
};

export const useAdminOrder = (id: string) =>
    useQuery({
        queryKey: ['admin', 'orders', id],
        queryFn: () => fetchOrderById(id),
        enabled: !!id
    });

export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            updateOrderStatus(id, status),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: ['admin', 'orders'],
        }),
    });
};