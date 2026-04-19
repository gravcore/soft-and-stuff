import { Request, Response, NextFunction } from 'express';
import { env } from "@/config/env";
import { authService } from '../../auth.service';
import { sendSuccess } from '@/shared/utils/response';
import { AuthRequest } from '@/shared/types';
import { AppError } from '@/shared/errors/AppError';

// Cookie options for security
const COOKIE_OPTIONS = {
    httpOnly: true, // not accessible from js
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
}

// Get the info of the device of the person requesting
const devieInfo = (req: Request) => 
    `${req.headers['user-agent'] ?? 'Unkownw'} | ${req.ip}`;

export const authControllerV1 = {

    // Register a new user
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await authService.register(req.body);
            sendSuccess(res, { user }, 201);
        } catch (err) { next(err); }
    },

    // Log in a new user and return their access and refresh tokens
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { accessToken, refreshToken, userId } = await authService.login(req.body, devieInfo(req));
            res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
            sendSuccess(res, { accessToken, userId });
        } catch (err) { next(err); }
    },

    // Allows a user refresh their expire access token
    async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.cookies?.refreshToken ?? req.body?.refreshToken;
            if (!token) throw new AppError('Token not provided', 401, 'MISSING_REFRESH_TOKEN');
            const { accessToken, refreshToken } = await authService.refresh(token, devieInfo(req));
            res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
            sendSuccess(res, { accessToken });
        } catch (err) { next(err); }
    },

    // Log out a user by deleting their refresh token
    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const token = req.cookies?.refreshToken ?? req.body?.refreshToken;
            if (!token) throw new AppError('Token not provided', 401, 'MISSING_REFRESH_TOKEN');
            await authService.logout(req.user!.sub, token);
            res.clearCookie('refreshToken', COOKIE_OPTIONS);
            sendSuccess(res, { message: 'Logged out' });
        } catch (err) { next(err); }
    },

    // Get the user info
    async me(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            sendSuccess(res, { user: await authService.getProfile(req.user!.sub) })
        } catch (err) { next(err); }
    },
}