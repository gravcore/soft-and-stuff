import { ordersRepository } from "@/modules/orders/orders.repository";
import { AppError } from "@/shared/errors/AppError";
import { AuthRequest } from "@/shared/types";
import { sendSuccess } from "@/shared/utils/response";
import { Request, Response, NextFunction } from "express";
import { paymentsService } from "../../payments.service";
import { verifyPaypalWebhookSignature } from "../../verifyPaypalWebhookSignature";
import Stripe from "stripe";
import { env } from "@/config/env";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

async function assertOwnerShip(req: AuthRequest, order: { user_id: string | null; tracking_id: string }) {
    
    // Users logged-in
    if (req.user?.sub) {
        if (order.user_id !== req.user.sub)
            throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    
    // Guest users
    } else {
        if (order.tracking_id !== req.body.tracking_id)
            throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }
}

export const paymentsControllerV1 = {

    async createIntent(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const order = await ordersRepository.findById(req.params.orderId as string);
            if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
            
            await assertOwnerShip(req, order);

            sendSuccess(res, await paymentsService.createPayment(order.id, req.params.method as string));
        } catch (err) { next(err); }
    },

    async captureIntent(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const order = await ordersRepository.findById(req.params.orderId as string);
            if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');

            await assertOwnerShip(req, order);

            // Always capture the reference we stored back in createIntent
            if (!order.payment_reference) throw new AppError('No payment was started for this order', 409, 'NO_PAYMENT_STARTED');

            const { status } = await paymentsService.capturePayment(req.params.method as string, order.payment_reference);
            
            // Set the status, and later with the webhook it confirms as a separate process so, even if this fail, paypal would send the confirmation
            await ordersRepository.updatePaymentStatus(order.id, status);
            sendSuccess(res, { status });
        } catch (err) { next(err); }
    },

    // Paypal calls this server-to-server to confirm payment
    async webhookPaypal(req: Request, res: Response, next: NextFunction) {
        try {
            const verified = await verifyPaypalWebhookSignature(req); // checks paypal webhook id + signature headers
            if (!verified) throw new AppError('Invalid webhook signature', 401, 'INVALID_SIGNATURE');

            const event = req.body as unknown as { resource: { custom_id: string; }, event_type: string; };
            const internalOrderId = event?.resource?.custom_id; // our own id set in createPayment
            if (!internalOrderId) throw new AppError('Webhook payload missing resource.custom_id', 400, 'MALFORMED_WEBHOOK_PAYLOAD');

            if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
                await ordersRepository.updatePaymentStatus(internalOrderId, 'paid');
            } else if (event.event_type === 'PAYMENT.CAPTURE.DENIED') {
                await ordersRepository.updatePaymentStatus(internalOrderId, 'failed');
            }

            res.sendStatus(200);
        } catch (err) { next(err); }
    },

    async webhookStripe(req: Request, res: Response) {
        const signature = req.headers['stripe-signature'] as string;
        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(req.body, signature, env.STRIPE_WEBHOOK_SECRET);
        } catch {
            res.status(400).send('Webhook signature verification failed'); // non-2xx -> stripe retries later

            return;
        }

        await paymentsService.handleStripeWebhookEvent(event);
        res.json({ received: true }); // Stripe just needs a 200; body content is arbitrary
    }
};