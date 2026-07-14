export interface WelcomeEmailData {
    to: string;
    firstName: string;
}

export interface OrderConfirmationEmailData {
    to: string;
    orderNumber: string;
    trackingId: string;
    total: number;
    items: { name: string, quantity: number; totalPrice: number }[]
}