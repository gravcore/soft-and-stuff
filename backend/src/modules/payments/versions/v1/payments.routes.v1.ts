import { Router } from 'express';
import { validateSchema } from '@/shared/middleware/validateSchema.middleware';
import { authenticate } from '@/shared/middleware/auth.middleware';
import { createIntentSchema } from '../../payments.schema';
import { paymentsControllerV1 } from './payments.controller.v1';
import { attachGuestSession } from '@/shared/middleware/guestSession.middleware';
import { idempotent } from '@/shared/middleware/idempotency.middleware';

const router = Router();

// Webhook paypal's server to server
router.post('/webhooks/paypal', paymentsControllerV1.webhookPaypal);

// route intent with soft authentication to allow logged-in users and guests
router.post('/:orderId/:method', authenticate(false), attachGuestSession, validateSchema(createIntentSchema), idempotent('POST /payments/:orderId/:method'), paymentsControllerV1.createIntent);

// capture the payment
router.post('/:orderId/:method/capture', authenticate(false), attachGuestSession, idempotent('POST /payments/:orderId/:method/capture'), paymentsControllerV1.captureIntent);

export default router;
