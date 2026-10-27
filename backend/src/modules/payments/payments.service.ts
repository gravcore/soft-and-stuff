import { AppError } from '@/shared/errors/AppError';
import { ordersRepository } from '../orders/orders.repository';
import { PaymentInitResult } from './payments.types';
import { getPaymentProvider } from './getPaymentProvider';
import { convertCurrency } from '../currency/currency.service';

export const paymentsService = {

    async createPayment(orderId: string, method: string): Promise<PaymentInitResult> {
        const order = await ordersRepository.findById(orderId);
        if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
        
        if (order.payment_status === 'paid') throw new AppError('Order is already paid', 409, 'ALREADY_PAID');

        const provider = getPaymentProvider(method);

        // Paypal only accepts USD
        let amount = order.total;
        let currency = order.currency;

        if (method === 'paypal' && currency !== 'USD') {
            try {
                amount = await convertCurrency(order.total, currency, 'USD');
            } catch {
                throw new AppError('Could not conver order total to USD', 502, 'CURRENCY_CONVERSION_FAILED');
            }
            currency = 'USD';
        }
        
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new AppError('Invalid payment amunt', 400, 'INVALID_PAYMENT_AMOUNT');
        }

        const result = await provider.createPayment(order.id, amount, currency);
        await ordersRepository.attachPaymenReference(order.id, method, result.providerReference);
        return result;
    },

    async capturePayment(method: string, providerReference: string): Promise<{ status: 'paid' | 'failed' }> {
        return getPaymentProvider(method).capturePayment(providerReference);
    },

    // Stripe webhook handling
    async handleStripeWebhookEvent(event: import('stripe').default.Event): Promise<void> {
        if (event.type === 'payment_intent.succeeded') {
            const intent = event.data.object as unknown as { id: string; metadata: { orderId?: string }};
            
            const orderId = intent.metadata.orderId;
            if (!orderId) throw new AppError('Webhook event missing orderId in metadata', 400, 'MISSING_ORDER_ID');

            await ordersRepository.updateStatus(orderId, 'confirmed');
            await ordersRepository.updatePaymentStatus(orderId, 'paid');    
        }

        if (event.type === 'payment_intent.payment_failed') {
            const intent = event.data.object as unknown as { id: string; metadata: { orderId?: string } };
            
            const orderId = intent.metadata.orderId;
            if (!orderId) return;
            await ordersRepository.updatePaymentStatus(orderId, 'failed');
        }
    },
};