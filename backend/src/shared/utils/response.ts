import { Response } from 'express';

// Standardized shape to send a success response
export const sendSuccess = <T>(
    res: Response,
    data: T,
    statusCode = 200,
    meta?: Record<string, unknown>,
): void => {
    res.status(statusCode).json({ success: true, data, ...(meta ? { meta } : {}) });
};