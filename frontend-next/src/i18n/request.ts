import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { locale as getRootParamLocale } from 'next/root-params';
import { routing } from './routing';

// export expected by next-intl
export default getRequestConfig(async () => {

    // [locale] value retrieved from root-params because request.ts is outside app/[locale]
    const requested = await getRootParamLocale();

    // Check availability of the language requested and return default if it's not found
    const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

    return {
        locale,
        messages: (await import(`@/core/i18n/locales/${locale}.json`)).defualt, // dynamic import
    }
});
