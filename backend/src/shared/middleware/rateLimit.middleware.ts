import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '@/config/env';
import { AppError } from '../errors/AppError';

const rateLimitHandler = (_req: Request, _res: Response, next: NextFunction) => {
    next(new AppError('Too many requests, please try again later.', 429, 'RATE_LIMITED'));
};

export const apiLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS, // 15 minutes 900_000
    limit: env.RATE_LIMIT_MAX, // old name 'max'
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
    skip: () => env.NODE_ENV === 'test',
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
    skip: () => process.env.NODE_ENV === 'test',
});