import { Request, Response, NextFunction } from 'express';
import { env } from "@/config/env";
import { authService } from '../../auth.service';
import { sendSuccess } from '@/shared/utils/response';
import { AuthRequest } from '@/shared/types';
import { AppError } from '@/shared/errors/AppError';
import { OAuthProfile } from '../../auth.types';
import { verifyOneTapCredential } from '../../auth.oneTap';

// Cookie options for security
const COOKIE_OPTIONS = {
    httpOnly: true, // not accessible from js
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
}

// Get the info of the device of the person requesting
const deviceInfo = (req: Request) => 
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
            const { accessToken, refreshToken, userId } = await authService.login(req.body, deviceInfo(req));
            res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
            sendSuccess(res, { accessToken, userId });
        } catch (err) { next(err); }
    },

    // Allows a user refresh their expire access token
    async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.cookies?.refreshToken ?? req.body?.refreshToken;
            if (!token) throw new AppError('Token not provided', 401, 'MISSING_REFRESH_TOKEN');
            const { accessToken, refreshToken } = await authService.refresh(token, deviceInfo(req));
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

    async oAuthCallback(req: Request, res: Response, next: NextFunction) {
        try {
            const profile = req.user as unknown as OAuthProfile;

            const { refreshToken } = await authService.loginWithOAuth(profile, deviceInfo(req))
            res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
            res.redirect(`${env.FRONTEND_URL}/oauth-callback`);
        } catch (err) { next(err); }
    },

    async googleOneTap(req: Request, res: Response, next: NextFunction) {
        try {
            const profile = await verifyOneTapCredential(req.body.credential);
            
            const { accessToken, refreshToken } = await authService.loginWithOAuth(profile, deviceInfo(req))
            res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
            sendSuccess(res, { accessToken });
        } catch (err) { next(err); }
    },

    async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.requestPasswordReset(req.body.email);
            sendSuccess(res, { message: 'If the email exists, a code has been sent.', ...result });
        } catch (err) { next(err); }
    },

    async verifyOtp(req: Request, res: Response, next: NextFunction) {
        try {
            await authService.verifyResetOtp(req.body.email, req.body.otp);
            sendSuccess(res, { verified: true });
        } catch (err) { next(err); }
    },

    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            await authService.resetPassword(req.body.email, req.body.newPassword);
            sendSuccess(res, { message: 'Password updated. Please log in.' });
        } catch (err) { next(err); }
    },
};