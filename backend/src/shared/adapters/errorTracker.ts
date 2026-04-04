import Sentry from '@sentry/node';
import { env } from '@/config/env';

export const initErrorTracker = (): void => {
    if (!env.SENTRY_DSN) return;
    Sentry.init({
        dsn: env.SENTRY_DSN,
        environment: env.NODE_ENV,
        tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0, // for performance recordings
    });
};

// Report an unexpected error to Sentry
export const captureError = (err: unknown, context?: Record<string, unknown>): void => {
    if (context) Sentry.setContext('additional', context); // "additional" our name of the context
    Sentry.captureException(err);
}