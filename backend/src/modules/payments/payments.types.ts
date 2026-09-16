// The frontend uses clientSecret to confirm payment with Stripe.js
export interface PaymentInitResult {
    providerReference: string;
    clientSecret?: string | null;
}

export interface PaymentProvider {
    createPayment(orderId: string, amount: number, currency: string): Promise<PaymentInitResult>;
    capturePayment(providerReference: string): Promise<{ status: 'paid' | 'failed' }>;
}