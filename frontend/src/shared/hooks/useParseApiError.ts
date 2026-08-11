import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../types/api';
import { useTranslation } from 'react-i18next';

export function useParseApiError(error: unknown) {

    const apiError = (error as AxiosError<ApiErrorResponse>)?.response?.data?.error;

    const codes = [
        apiError?.code ?? apiError?.message,
        ...(apiError?.errors?.map((e) => e.code ?? e.message) ?? []),
    ].filter(Boolean) as string[];

    const { t } = useTranslation();

    return {
        codes,
        hasCodes: codes.length > 0,
        fallbackMessage: (error as Error)?.message ?? t('errors.GENERIC'),
    };
}