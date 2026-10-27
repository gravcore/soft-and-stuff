import { z } from 'zod';
import { schemaError } from '@/shared/errors/schemaError';

// Validates POST /api/v1/payments/intent
export const createIntentSchema = z.object({
    orderId: z.uuid(schemaError('INVALID_UUID', 'Order ID must be a valid UUID')),
    method: z.enum(['paypal', 'stripe', 'cod']),
});

export type CreateIntentInput = z.infer<typeof createIntentSchema>;
