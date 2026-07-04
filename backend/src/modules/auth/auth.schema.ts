import { z, ZodType } from 'zod';
import { schemaError } from '@/shared/errors/schemaError';

export const registerSchema: ZodType = z.object({
    email: z
        .email(schemaError('INVALID_EMAIL', 'Must be a valid email address')),

    password: z 
        .string(schemaError('PASSWORD_REQUIRED', 'Password is required'))
        .min(8, schemaError('PASSWORD_TOO_SHORT', 'Password must be at least 8 characteres'))
        .max(72, schemaError('PASSWORD_TOO_LONG', 'Password must be up to 72 characteres'))
        .regex(/[A-Z]/, schemaError('PASSWORD_NO_UPPERCASE', 'Password must contain at least one uppercase letter'))
        .regex(/[0-9]/, schemaError('PASSWORD_NO_NUMBER', 'Password must contain at least one number')),
    
    firstName: z
        .string(schemaError('FIRST_NAME_REQUIRED', 'First name is required'))
        .min(1, schemaError('FIRST_NAME_EMPTY', 'First name must be not empty'))
        .max(100, schemaError('FIRST_NAME_TOO_LONG', 'First name must be up to 100 characteres')),

    lasName: z
        .string(schemaError('STRING_REQUIRED', 'Last name should be a string'))
        .max(100, schemaError('LAST_NAME_TOO_LONG', 'Last name must be up to 100 characteres'))
        .optional(),
});

export const loginSchema: ZodType = z.object({
    email: z.email(schemaError('INVALID_EMAIL', 'Must be a valid email address')),
    password: z.string(schemaError('PASSWORD_REQUIRED', 'Password is required')).min(1, schemaError('PASSWORD_EMPTY', 'Password must be not empty'))
});

export const refreshSchema: ZodType = z.object({
    refreshToken: z.string(schemaError('STRING_REQUIRED', 'Refresh token must be a valid string')).min(1, schemaError('TOKEN_EMPTY', 'Token must be not empty')).optional(),
});

// Schemas to interface
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;