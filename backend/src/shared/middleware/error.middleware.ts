import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { captureError } from '../adapters/errorTracker';

export const errorHandler = (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void => {
    // Controlled app errors
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                ...(err.errors ? { errors: err.errors } : {}),
            }
        });

        return;
    }

    // Uncontrolled errors
    captureError(err);
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: `Something went wrong: ${err ?? 'unknown error'}`,
        }
    });
};