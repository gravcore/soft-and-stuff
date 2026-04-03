import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const schema = z.object({

    // Only these exact values are allowed
    NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
    PORT: z.coerce.number().default(3000), // string -> number

    DATABASE_URL: z.url(),
    DB_POOL_MIN: z.coerce.number().default(2),
    DB_POOL_MAX: z.coerce.number().default(10),

    REDIS_URL: z.url().optional(),

    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

    STRIPE_SECRET_KEY: z.string(),
    STRIPE_WEBHOOK_SECRET: z.string(),

    IMAGEKIT_PUBLCI_KEY: z.string(),
    IMAGEKIT_PRIVATE_KEY: z.string(),
    IMAGEKIT_URL_ENDPOINT: z.url(),

    YOUTUBE_CLIENT_ID: z.string(),
    YOUTUBE_CLIENT_SECRET: z.string(),
    YOUTUBE_REDIRECT_URI: z.url(),
    YOUTUBE_REFRESH_TOKEN: z.string(),

    RESEND_API_KEY: z.string(),
    RESEND_FROM_EMAIL: z.email(),

    SENTRY_DSN: z.url().optional(),

    ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
    BCRYPT_ROUNDS: z.coerce.number().default(12),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900_000), // 15 minutes
    RATE_LIMIT_MAX: z.coerce.number().default(100),
});

// safeParse validates without throwing errors
const parsed = schema.safeParse(process.env);

if (!parsed.success) {
    console.error('Invalid environment variables: ', parsed.error.issues);
    process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
