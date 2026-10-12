import { toNestErrors } from '@hookform/resolvers';
import type { FieldError, FieldValues, Resolver } from 'react-hook-form';
import type { ZodType } from 'zod';
import { z } from 'zod';
type ZodIssue = z.core.$ZodIssue;

// Custom shape for FieldError
export interface ZodFieldError extends FieldError {
    params?: { code?: string };
}

// Check if error have a params.code property
function hasCode(issue: ZodIssue): issue is ZodIssue & { params: { code: string } } {
    const params = (issue as { params?: unknown }).params;

    return (
        typeof params === 'object' &&
        params !== null &&
        typeof (params as { code?: unknown }).code === 'string'
    );
}

// Custom zodResolver to include params.code when is available (zodResolver from @hookform/resolvers doesn't include it)
export function zodResolver<T extends FieldValues>(schema: ZodType<T>): Resolver<T> {
    
    // return a callback that react-hook-form will call passing these values
    return async (values, _context, options) => {
        const parsed = await schema.safeParseAsync(values);

        // If there are not errors just pass the parsed values
        if (parsed.success) {
            return {
                values: parsed.data,
                errors: {}
            };
        }

        // If there are errors pass the errors instead
        const fieldErrors: Record<string, ZodFieldError> = {};

        for (const issue of parsed.error.issues) {
            const path = issue.path.join('.');

            if (!fieldErrors[path]) {
                
                fieldErrors[path] = {
                    type: issue.code, // Zod's own label for the error type
                    message: issue.message,
                    params: hasCode(issue) ? { code: issue.params.code } : undefined,
                };
            }
        }

        return {
            values: {},
            errors: toNestErrors(fieldErrors, options),
        }
    }
}