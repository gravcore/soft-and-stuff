import Stripe from 'stripe';
import { env } from '@/config/env';
import { AppError } from '@/shared/errors/AppError';
import type { PaymentProvider } from '../payments.types';

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export const stripeAdapter: PaymentProvider = {
    async createPayment(orderId, amount, currency) {
        const intent = await stripe.paymentIntents.create({
            amount, // already cents, stripe exepects cents too
            currency: currency.toLowerCase(),
            metadata: { orderId }
        });

        return {
            providerReference: intent.id,
            clientSecret: intent.client_secret ?? undefined,
        };
    },

    // Stripe confirms client-side (stripe.confirmPayment) and reports
    // success via its own webhook, so there's no backend capture call
    async capturePayment() {
        throw new AppError('Stripe payments confirm via webhook, not an explicit capture call', 400, 'STRIPE_CAPTURE_NOT_SUPPORTED');
    },
};