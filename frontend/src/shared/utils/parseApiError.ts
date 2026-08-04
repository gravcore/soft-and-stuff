import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../types/api';

export function parseApiError(error: unknown) {

    const apiError = (error as AxiosError<ApiErrorResponse>)?.response?.data?.error;

    const codes = [
        apiError?.code ?? apiError?.message,
        ...(apiError?.errors?.map((e) => e.code ?? e.message) ?? []),
    ].filter(Boolean) as string[];

    return {
        codes,
        hasCodes: codes.length > 0,
        fallbackMessage: (error as Error)?.message ?? 'Something went wrong. Please try again',
    };
}