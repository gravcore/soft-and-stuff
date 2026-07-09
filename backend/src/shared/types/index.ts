import { Request } from 'express';

export interface JwtPayload {
    sub: string;                    // user id (subject)
    role: 'customer' | 'admin';
    iat?: number;                   // issued at (Unix timestamp, set by jwt.sign)
    exp?: number;                   // expires at (Unix timestamp, set by jwt.sign)
}

// Extends Express Request with the decoded JWT payload
export interface AuthRequest extends Request {
    user?: JwtPayload;
    guestSessionId?: string;
}

export interface PaginationParams { page: number; limit: number; offset: number; }

// Standard success response shape
export interface ApiResponse<T> { success: true; data: T; meta?: Record<string, unknown>}