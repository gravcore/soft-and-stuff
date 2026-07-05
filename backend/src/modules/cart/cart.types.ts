export interface Cart {
    id: string;
    user_id: string | null;
    session_id: string | null;
    expires_at: Date;
    created_at: Date;
    updated_at: Date;
}

export interface CartItem {
    id: string;
    cart_id: string;
    product_id: string;
    quantity: number;
    price_snapshot: number;
    created_at: Date;
}

// Joins product details so the frontend doesn't need a second request
export interface CartItemWithProduct extends CartItem {
    product_name: string;
    slug: string;
    images: string[];
    stock: number;
}
