// The frontend uses clientSecret to confirm payment with Stripe.js
export interface PaymentIntentResult {
    clientSecret: string | null;
}