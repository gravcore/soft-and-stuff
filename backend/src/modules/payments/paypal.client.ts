import { env } from '@/config/env';
import { AppError } from '@/shared/errors/AppError';

type PayPalTokenResponse = {
    access_token: string;
    expires_in: number;
}

const BASE_URL = env.NODE_ENV === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
    if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;

    const auth = Buffer.from(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`).toString('base64');

    const res = await fetch(`${BASE_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=client_credentials',
    });

    const data = await res.json() as PayPalTokenResponse;
    
    cachedToken = { 
        value: data.access_token,
        
        // We don't use an almost-expired token so - 60 seconds
        expiresAt: Date.now() + (data.expires_in - 60) * 1000,
    };
    return cachedToken.value;
}

export async function paypalRequest<T>(method: string, path: string, body?: unknown) {
    const token = await getAccessToken();
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) throw new AppError('PayPal request failed', 502, 'PAYPAL_ERROR');

    return res.json() as Promise<T>;
}