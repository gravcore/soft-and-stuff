import { Request } from 'express';
import { PaginationParams } from '@/shared/types';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// Extracts and sanitizes the pagination data comming from the request query string
export const parsePagination = (req: Request): PaginationParams => {

    // Ensures the result is never less than 1
    const page = Math.max(1, parseInt(String(req.query.page ?? 1)));

    // Ensures limit is never less than 1 and never exceeds MAX_LIMIT
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(String(req.query.limit ?? DEFAULT_LIMIT))));

    // offset: how many rows to skip
    return { page, limit, offset: (page - 1) * limit }
}

// Builds the meta object for paginated responses
export const buildMeta = (total: number, params: PaginationParams) => ({
    page: params.page,
    limit: params.limit,
    total,
    totalPages: Math.ceil(total / params.limit),
});