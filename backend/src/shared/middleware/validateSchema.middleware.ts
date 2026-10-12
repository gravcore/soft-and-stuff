import { ZodType } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

type RequestTarget = 'body' | 'query' |  'params';

export const validateSchema =
    (schema: ZodType, target: RequestTarget = 'body') =>
    (req: Request, _res: Response, next: NextFunction) => {

        // Check data with the schema, converts in an object, and if something fail not throw an error
        const parsed = schema.safeParse(req[target] ?? {});

        if (!parsed.success) {

            // Re-shape the errors to show important things
            const errors = parsed.error.issues.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
                code: (e as any).params?.code ?? e.code ?? 'VALIDATION_ERROR',
            }));

            // Send to our error handler the error with the specific erros inside
            return next(new AppError('Invalid request data', 422, 'VALIDATION_ERROR', errors));
        }

        // Change the request data to the stripped version (removes unknown fields)
        if (target === 'query') {            
            Object.defineProperty(req, 'query', {
                value: parsed.data, // from now on, 'req.query' always returns this object
                writable: true, // allow req.query to be reassigned again
                configurable: true, // allows this property definition itself to be changed/redefined again if needed
            });
        } else if (target === 'body') {
            req.body = parsed.data;
        } else {
            req.params = parsed.data as Record<string, string>;
        }

        next();
    }