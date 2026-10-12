import { env } from '@/config/env';
import { AppError } from '@/shared/errors/AppError';
import { paypalAdapter } from './adapters/paypalAdapter';
import { stripeAdapter } from './adapters/stripeAdapter';
import type { PaymentProvider } from './payments.types';

export function getPaymentProvider(method: string): PaymentProvider {
    if (method === 'paypal') return paypalAdapter;
    if (method === 'stripe') {
        if (!env.STRIPE_ENABLED) throw new AppError('Stripe payments are not enabled yet', 400, 'STRIPE_DISABLED');
        return stripeAdapter;
    }

    throw new AppError(`Unsupported payment method: ${method}`, 400, 'UNSUPPORTED_PAYMENT_METHOD');
}
