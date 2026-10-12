import { Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from '@/config/database';
import { AppError } from '../errors/AppError';
import { AuthRequest } from '../types';

export function idempotent(routeName: string) {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        
        // Search for a idempotency key in the header request
        const key = req.headers['idempotency-key'];
        if (!key || typeof key !== 'string') {
            throw new AppError('Idempotency-Key header is required for this request', 400, 'IDEMPOTENCY_KEY_REQUIRED');
        }

        // Sets the client id which can be the user id or the guest id
        const clientId = req.user?.sub ?? req.guestSessionId;
        if (!clientId) {
            throw new AppError('Could not identify the caller for idempotency tracking', 401, 'UNAUTHENTICATED');
        }

        // Hash the request body to save it in the database
        const requestHash = crypto.createHash('sha256').update(JSON.stringify(req.body ?? {})).digest('hex');

        // Check if is already registered an idempotency key for that key
        const { rows } = await db.query<{ response_status: number | null; response_body: unknown; request_hash: string }>(
            `SELECT response_status, response_body, request_hash 
            FROM idempotency_keys WHERE idempotency_key = $1 AND route = $2`,
            [key, routeName]
        );

        // If the idempotency key alredy exists in the database
        if (rows[0]) {

            // The row has a different request body, for a frontend bug
            if (rows[0].request_hash !== requestHash) {
                // Same key different body, a client bug reusing a key, not a legitimate retry of the same action
                throw new AppError('Idempotency-Key was alreay used with a different request body', 422, 'IDEMPOTENCY_KEY_CONFLICT');
            }

            // Match undefined and null
            // The response already has a code, so is already resolved
            if (rows[0].response_status != null) {
                return res.status(rows[0].response_status).json(rows[0].response_body);
            }

            // Row exists but no response yet
            throw new AppError('This request is already being processed', 409, 'REQUEST_IN_PROCESS');
        }

        try {
            await db.query(`INSERT INTO idempotency_keys (client_id, idempotency_key, route, request_hash)
                VALUES ($1, $2, $3, $4)`, [clientId, key, routeName, requestHash]);
        } catch (err) {
            if ((err as { code?: string }).code === '23505') {
                throw new AppError('This request is already being processed', 409, 'REQUEST_IN_PROGRESS');
            }
            throw err; // Any other error code
        }

        const originalJson = res.json.bind(res);

        res.json = ((body: unknown) => {
            db.query(
                `UPDATE idempotency_keys SET 
                response_status = $1, response_body = $2
                WHERE client_id = $3 AND idempotency_key = $4 AND route = $5`,
                [res.statusCode, JSON.stringify(body), clientId, key, routeName],
            ).catch(() => {});
            return originalJson(body);
        }) as Response['json'];

        return next();
    };
}