import httpClient from '@/shared/services/httpClient';
import type { ShippingAddress, OrderQuote, OrderResult } from '../types/checkout.types';

export const fetchQuote = async (shippingAddress: ShippingAddress): Promise<OrderQuote> => {
    const { data } = await httpClient.post<{ data: OrderQuote }>('/orders/quote', { shippingAddress });
    return data.data;
};

export const submitCheckout = async (shippingAddress: ShippingAddress, idempotencyKey: string, notes?: string): Promise<OrderResult> => {
    const { data } = await httpClient.post<{ data: OrderResult }>('/orders/checkout', 
        { shippingAddress, notes },
        { headers: { 'Idempotency-Key': idempotencyKey } }
    );
    return data.data;
};

export const updateShippingAddress = async (
    orderId: string, shippingAddress: ShippingAddress,
    trackingId: string | undefined, idempotencyKey: string
): Promise<{ subtotal: number; tax: number; shipping: number; total: number; currency: string }> => {
    const { data } = await httpClient.patch(`/orders/${orderId}/shipping-address`,
        { shippingAddress, trackingId },
        { headers: { 'Idempotency-Key': idempotencyKey } }
    );
    return data.data;
};

// Public endpoint, no auth required
export const trackGuestOrder = async (trackingId: string) => {
    const { data } = await httpClient.get(`/orders/track/${trackingId}`);
    return data.data.order;
};

export interface MyOrdersPage {
    orders: {
        id: string;
        order_number: string;
        order_status: string;
        total: number;
    }[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }
}

export const fetchMyOrders = async (page = 1): Promise<MyOrdersPage> => {
    const { data } = await httpClient.get('/orders', {
        params: { page }
    });
    return data.data;
};