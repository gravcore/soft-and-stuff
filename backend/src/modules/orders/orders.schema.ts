import { z } from 'zod';
import { schemaError } from '@/shared/errors/schemaError';

const shippingAddressSchema = z.object({
    fullName:   z.string().min(1, schemaError('REQUIRED', 'Full name is required')).max(200),
    email:      z.email(schemaError('INVALID_EMAIL', 'Must be a valid email address')),
    line1:      z.string().min(1, schemaError('REQUIRED', 'Address line 1 is required')).max(255),
    line2:      z.string().max(255).optional(),
    city:       z.string().min(1, schemaError('REQUIRED', 'City is required')).max(100),
    state:      z.string().max(100).optional(),
    zip:        z.string().max(20).optional(),
    country:    z.string().length(2, schemaError('INVALID_COUNTRY', 'Country must be a 2-letter code')),
    phone:      z.string().max(30).optional(),
});

export const checkoutSchema = z.object({
    shippingAddress: shippingAddressSchema,
    notes: z.string().max(1000).optional(), 
});

export const trackOrderSchema = z.object({
    trackingId: z.string()
                 .length(12, schemaError('INVALID_TRACKING_ID', 'Tracking ID must be 12 characteres'))
                 .regex(/^ORD-[A-Z0-9]{8}$/, schemaError('INVALID_TRACKING_ID', 'Invalid tracking ID format')),
});

// Admin only
export const updateOrderStatusSchema = z.object({
    status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
            schemaError('INVALID_STATUS', 'Status must be one of: pending, confirmed, shipped, delivered, cancelled')),
});

export type CheckoutInput           = z.infer<typeof checkoutSchema>;
export type UpdateOrderStatusInput  = z.infer<typeof updateOrderStatusSchema>;