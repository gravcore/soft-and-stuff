import Stripe from 'stripe';
import { env } from '@/config/env';
import { AppError } from '@/shared/errors/AppError';
import { ordersRepository } from '../orders/orders.repository';
import { PaymentIntentResult } from './payments.types';

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export const paymentsService = {

    // Creates a Stripe PaymentIntent for an existing order
    async createIntent(orderId: string): Promise<PaymentIntentResult> {
        const order = await ordersRepository.findById(orderId);
        if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');

        // Don't let someone create a new payment intent for an order that's already been paid
        if (order.stripe_payment_status === 'paid') {
            throw new AppError('Order is already paid', 409, 'ALREADY_PAID');
        }

        const intent = await stripe.paymentIntents.create({
            amount: order.total,
            currency: order.currency.toLowerCase(),
            metadata: { orderId },  // Webhook match this intent back to our order later
        });

        // For the record
        await ordersRepository.attachPaymentIntent(order.id, intent.id);

        return { clientSecret: intent.client_secret };
    },

    async handleWebhookEvent(event: Stripe.Event): Promise<void> {
        if (event.type === 'payment_intent.succeeded') {
            const intent = event.data.object as Stripe.PaymentIntent;
            const orderId = intent.metadata.orderId;

            if (!orderId) return; // defensive: ignore intents not tied to one of our orders

            await ordersRepository.updateStatus(orderId, 'confirmed');
            await ordersRepository.updatePaymentStatus(orderId, 'paid');
        }

        if (event.type === 'payment_intent.payment_failed') {
            const intent = event.data.object as Stripe.PaymentIntent;
            const orderId = intent.metadata.orderId;

            if (!orderId) return;

            await ordersRepository.updatePaymentStatus(orderId, 'failed');
        }
    },
};