import { PaymentProvider } from "../payments.types";
import { paypalRequest } from "../paypal.client";

export const paypalAdapter: PaymentProvider = {

    async createPayment(orderId, amount, currency) {
        const order = await paypalRequest<{ id: string }>('POST', '/v2/checkout/orders', {
            intent: 'CAPTURE',
            purchase_units: [{
                custom_id: orderId,
                amount: { currency_code: currency, value: (amount / 100).toFixed(2) } // cents to decimal string
            }],
        });
        return { providerReference: order.id }
    },

    async capturePayment(providerReference) {
        const capture = await paypalRequest<{ status: string }>('POST', `/v2/checkout/orders/${providerReference}/capture`);
        return {
            status: capture.status === 'COMPLETED' ? 'paid' : 'failed',
        };
    }
}