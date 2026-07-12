import Stripe from 'stripe';
import { Request, Response, NextFunction } from 'express';
import { env } from '@/config/env';
import { sendSuccess } from '@/shared/utils/response';
import { paymentsService } from '../../payments.service';

// Separate Stripe instance here, not shared state needed
// Just for webhook signature verification
const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export const paymentsControllerV1 = {

    async createIntent(req: Request, res: Response, next: NextFunction) {
        try {
            const { orderId } = req.body;
            const result = await paymentsService.createIntent(orderId);
            sendSuccess(res, result);
        } catch (err) { next(err); }
    },

    // Webhook receives events directly from Stripe's servers,
    // so this must verify the signature before trusting anything
    // Signature verification needs the exact original bytes Stripe sent
    // no parsed JSON
    async webhook(req: Request, res: Response) {
        const signature = req.headers['stripe-signature'] as string;
        let event: Stripe.Event;

        try {
            // Verifies the request is genuinely from Stripe and parses it into an Event
            event = stripe.webhooks.constructEvent(req.body, signature, env.STRIPE_WEBHOOK_SECRET);
        } catch {
            // Non-2xx status code tells Stripe this failed, it will retry later
            res.status(400).send('Webhook signature verification failed');
            return;
        }

        // Process the event
        await paymentsService.handleWebhookEvent(event);

        // Response with implicit 200 status code Stripe expects
        res.json({ received: true });
    },
};