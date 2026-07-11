export interface Order {
    id: string;
    user_id: string | null;
    order_number: string;
    tracking_id: string;
    order_status: string;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    currency: string;
    shipping_address: ShippingAddress;
    guest_email: string | null;
    stripe_payment_intent_id: string | null;
    stripe_payment_status: string | null;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string | null;
    product_name: string;
    product_sku: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
    created_at: Date;
}

export interface ShippingAddress {
    fullName: string;
    email: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    zip?: string;
    country: string;
    phone?: string;
}

// The shape of each cart item as the checkout flow needs it
export interface CheckoutCartItem {
    productId: string;
    name: string;
    sku: string | null;
    price: number;
    quantity: number;
}

export interface CheckoutPayload {
    userId?: string;
    cartItems: CheckoutCartItem[];
    shippingAddress: ShippingAddress;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
}