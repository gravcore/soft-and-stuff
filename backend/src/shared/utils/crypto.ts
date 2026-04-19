import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { env } from '@/config/env';

export const hashPassword = (plain: string): Promise<string> => bcrypt.hash(plain, env.BCRYPT_ROUNDS);
export const verifyPassword = (plain: string, hash: string): Promise<boolean> => bcrypt.compare(plain, hash);

// Fast hash for tokens, to save in DB
export const hashToken = (token: string): string => 
    crypto.createHash('sha256').update(token).digest('hex');

// Generate token url friendly for reset password links
export const generateToken = (bytes = 32): string => 
    crypto.randomBytes(bytes).toString('base64url');

// Generate uppercase tracking id for orders
export const generateTrackingId = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // omit 0, O, 1, I (easily confused)
    const bytes = crypto.randomBytes(8);
    const id = Array.from(bytes).map((b) => chars[b % chars.length]).join('');
    return `ORD-${id}`;
}