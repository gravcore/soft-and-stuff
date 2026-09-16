import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchMyOrders } from '@/features/checkout/services/checkoutApi';

export const useOrders = (page: number) => 
    useQuery({
        queryKey: ['orders', 'mine', page],
        queryFn: () => fetchMyOrders(page),
        placeholderData: keepPreviousData, // keeps showing the current page's orders while the next page loads
    });