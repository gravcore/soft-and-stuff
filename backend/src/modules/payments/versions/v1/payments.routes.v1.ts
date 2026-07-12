import { Router } from 'express';
import { validateSchema } from '@/shared/middleware/validateSchema.middleware';
import { authenticate } from '@/shared/middleware/auth.middleware';
import { createIntentSchema } from '../../payments.schema';
import { paymentsControllerV1 } from './payments.controller.v1';

const router = Router();

// route intent with soft authentication to allow logged-in users and guests
router.post('/intent', authenticate(false), validateSchema(createIntentSchema), paymentsControllerV1.createIntent);

// Payment server call this webhook
router.post('/webhook', paymentsControllerV1.webhook);

export default router;

