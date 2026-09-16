import { env } from "@/config/env";
import { paypalRequest } from "./paypal.client";
import { Request } from "express";

type WebhookVerificationResponse = {
    verification_status: 'SUCCESS' | 'FAILURE';
};

export async function verifyPaypalWebhookSignature(req: Request): Promise<boolean> {
    const result = await paypalRequest<WebhookVerificationResponse>('POST', '/v1/notifications/verify-webhook-signature', {
        auth_algo: req.headers['paypal-auth-algo'],
        cert_url: req.headers['paypal-cert-url'],
        transmission_id: req.headers['paypal-transmission-id'],
        transmission_sig: req.headers['paypal-transmission-sig'],
        transmission_time: req.headers['paypal-transmission-time'],
        webhook_id: env.PAYPAL_WEBHOOK_ID,
        webhook_event: req.body,
    });
    return result.verification_status === 'SUCCESS';
}