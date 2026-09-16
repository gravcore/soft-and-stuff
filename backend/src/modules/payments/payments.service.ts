import { AppError } from '@/shared/errors/AppError';
import { ordersRepository } from '../orders/orders.repository';
import { paypalAdapter } from './adapters/paypalAdapter';
import { PaymentInitResult, PaymentProvider } from './payments.types';

const PAYMENT_PROVIDERS: Record<string, PaymentProvider> = {
    paypal: paypalAdapter,
}

function getPaymentProvider(method: string): PaymentProvider {
    const provider = PAYMENT_PROVIDERS[method];
    if (!provider) throw new AppError(`Unsupported payment method: ${method}`, 400, 'UNSUPPORTED_PAYMENT_METHOD');
    return provider;
}

export const paymentsService = {

    async createPayment(orderId: string, method: string): Promise<PaymentInitResult> {
        const order = await ordersRepository.findById(orderId);
        if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
        
        if (order.payment_status === 'paid') throw new AppError('Order is already paid', 409, 'ALREADY_PAID');

        const provider = getPaymentProvider(method);
        const result = await provider.createPayment(order.id, order.total, order.currency);
        await ordersRepository.attachPaymenReference(order.id, method, result.providerReference);
        return result;
    },

    async capturePayment(method: string, providerReference: string): Promise<{ status: 'paid' | 'failed' }> {
        return getPaymentProvider(method).capturePayment(providerReference);
    },
};