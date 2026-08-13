import { doubleCsrf } from 'csrf-csrf';
import { env } from '@/config/env';

export const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
    getSecret: () => env.CSRF_SECRET,
    cookieName: 'csrfToken',
    cookieOptions: {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 1000, // 60 minutes
    },
    getSessionIdentifier: () => 'app',
});