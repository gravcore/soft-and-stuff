import { z } from 'zod';
import { schemaError } from '@/shared/errors/schemaError';

export const uploadVideoSchema = z.object({
    title: z.string().max(100, schemaError('TITLE_TOO_LONG', 'Title must be under 100 characters')).default('Product video'),
    description: z.string().max(5000, schemaError('DESC_TOO_LONG', 'Description must be under 5000 characters')).optional(),
});

export type UploadVideoInput = z.infer<typeof uploadVideoSchema>;

