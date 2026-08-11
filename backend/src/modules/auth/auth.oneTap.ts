import { OAuth2Client } from 'google-auth-library';
import { env } from '@/config/env';
import { AppError } from '@/shared/errors/AppError';
import { OAuthProfile } from './auth.types';

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export async function verifyOneTapCredential(credential: string): Promise<OAuthProfile> {
    const ticket = await client.verifyIdToken({ idToken: credential, audience: env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();

    if(!payload?.email) throw new AppError('No email in Google credential', 400, 'OAUTH_NO_EMAIL');

    return {
        provider: 'google',
        providerId: payload.sub,
        email: payload.email,
        firstName: payload.given_name ?? payload.name ?? 'User',
        lastName: payload.family_name,
        avatarUrl: payload.picture ?? null,
    };
}