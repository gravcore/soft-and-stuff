import httpClient from "@/shared/services/httpClient";
import type { CartState } from "../types/cart.types";

interface RawItem {
    id: string;
    product_id: string;
    product_name: string;
    images_url: string[];
    price_snapshot: number;
    quantity: number;
    stock: number;
}

interface RawCart {
    cartId: string;
    items: RawItem[];
    total: number;
}

const mapCart = (raw: RawCart): CartState => ({
    cartId: raw.cartId, total: raw.total,
    items: raw.items.map((i) => ({
        id: i.id, productId: i.product_id, name: i.product_name,
        price: i.price_snapshot, quantity: i.quantity,
        image: i.images_url[0], stock: i.stock
    })),
});

export const fetchCart = async (): Promise<CartState> => {
    const { data } = await httpClient.get<{ data: RawCart }>('/cart');
    return mapCart(data.data);
};

export const addCartItem = async (productId: string, quantity: number): Promise<CartState> => {
    const { data } = await httpClient.post<{ data: RawCart }>('/cart/items', { productId, quantity });
    return mapCart(data.data);
};

export const updateCartItem = async (itemId: string, quantity: number): Promise<CartState> => {
    const { data } = await httpClient.patch<{ data: RawCart }>(`/cart/items/${itemId}`, { quantity });
    return mapCart(data.data);
};

export const removeCartItem = async (itemId: string): Promise<CartState> => {
    const { data } = await httpClient.delete<{ data: RawCart }>(`/cart/items/${itemId}`);
    return mapCart(data.data);
};

export const clearCart = async (): Promise<CartState> => {
    const { data } = await httpClient.delete<{ data: RawCart }>('/cart');
    return mapCart(data.data);
};