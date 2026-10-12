import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { cartService } from '@/modules/cart/cart.service';
import { randomUUID } from 'crypto';
import { env } from '@/config/env';

export const attachGuestSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    let sessionId = req.cookies?.guestSessionId;

    // If the user is logged in
    if (req.user) {

        // Check guest cart leftover
        if (sessionId) {
            await cartService.resolveCart({ userId: req.user.sub, sessionId });
            res.clearCookie('guestSessionId', { path: '/' });
        }

        return next();
    }

    if (!sessionId) {
        sessionId = randomUUID();
        res.cookie('guestSessionId', sessionId, {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            path: '/',
        });
    }

    // Attach to the request so controllers can read it
    req.guestSessionId = sessionId;
    next();
};