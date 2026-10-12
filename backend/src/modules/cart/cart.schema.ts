import { z } from 'zod';
import { schemaError } from '@/shared/errors/schemaError';

export const addItemSchema = z.object({
    productId: z.uuid(schemaError('INVALID_UUID', 'Product ID must be a valid UUID')),
    quantity:  z.number(schemaError('REQUIRED', 'Quantity is required'))
                .int(schemaError('INVALID_QUANTITY', 'Quantity must be a whole number'))
                .min(1, schemaError('QUANTITY_TOO_LOW', 'Quantity must be at least 1')),
});

export const updateItemSchema = z.object({
    quantity: z.number(schemaError('REQUIRED', 'Quantity is required'))
               .int(schemaError('INVALID_QUANTITY', 'Quantity must be a whole number'))
               .min(1, schemaError('QUANTITY_TOO_LOW', 'Quantity must be at least 1')),
});

export type AddItemInput    = z.infer<typeof addItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;