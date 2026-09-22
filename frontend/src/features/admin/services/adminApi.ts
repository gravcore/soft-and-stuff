import httpClient from "@/shared/services/httpClient";
import type { ShippingAddress } from "@/features/checkout/types/checkout.types";

export interface AdminOrder {
    id: string;
    order_number: string;
    order_status: string;
    payment_status: 'pending' | 'paid' | 'failed' | null;
    payment_provider: 'cod' | 'paypal' | 'stripe' | 'recurrente' | null;
    total: number;
    currency: string;
    guest_email: string | null;
    user_email: string | null;
    user_id: string | null;
    created_at: string;
}

export interface AdminOrderItem {
    product_name: string;
    product_sku: string | null;
    quantity: number;
    price_snapshot: number;
    total: number;
}

export interface AdminOrderDetail extends AdminOrder {
    shipping_address: ShippingAddress;
    notes: string | null;
    items: AdminOrderItem[];
}

export interface AdminOrdersFilters {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedAdminOrders {
    orders: AdminOrder[],
    meta: { page: number; limit: number; total: number; totalPages: number },
}

export const fetchAllOrders = async (filters: AdminOrdersFilters): Promise<PaginatedAdminOrders> => {
    const { data } = await httpClient.get('/orders/all', { params: filters });
    return { 
        orders: data.data.orders,
        meta: data.meta,
    };
};

export const fetchOrderById = async (id: string): Promise<AdminOrderDetail> => {
    const { data } = await httpClient.get(`/orders/${id}`);
    return data.data.order;
};

export const updateOrderStatus = async (id: string, status: string): Promise<AdminOrder> => {
    const { data } = await httpClient.patch(`/orders/${id}/status`, { status });
    return data.data.order;
};