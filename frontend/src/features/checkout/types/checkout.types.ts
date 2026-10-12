export interface ShippingAddress {
    fullName: string; 
    email: string;
    phone?: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    zip?: string;
    country:string;
    reference?: string;
    coordinates?: { lat: number; lng: number };
}

export interface OrderQuoteItem {
    productId: string;
    name: string;
    image: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface OrderQuote {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    currency: string;
    items: OrderQuoteItem[];
}

export interface OrderResult {
    orderId: string;
    orderNumber: string;
    trackingId: string;
    total: number;
    currency: string;
}