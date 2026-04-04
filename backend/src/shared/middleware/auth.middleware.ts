import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { AuthRequest, JwtPayload } from '@/shared/types';
import { AppError } from '@/shared/errors/AppError';

// Verifies the JWT access token in the Authorization header
export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer '))
        return next(new AppError('No access token provided', 401, 'UNAUTHORIZED'));

    try {
        req.user = jwt.verify(header.slice(7), env.JWT_ACCESS_SECRET) as JwtPayload;
        next();
    } catch {
        next(new AppError('Invalid or expired access token', 401, 'UNAUTHORIZED'));
    }
};

// Checks that the authenticated user has one of the allowed roles
export const authorize = (...roles: JwtPayload['role'][]) => {
    return (req: AuthRequest, _res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role))
            return next(new AppError('Insufficient permissions', 403, 'FORBIDDEN'));
        next();
    }
};