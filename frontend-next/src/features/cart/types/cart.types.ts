export interface CartItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    stock: number;
}

export interface CartState {
    cartId: string;
    items: CartItem[];
    total: number;
}