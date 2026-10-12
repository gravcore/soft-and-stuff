import { defineRouting } from 'next-intl/routing';

const locales = (process.env.NEXT_PUBLIC_LOCALES ?? '').split(',').map(value => value.trim()).filter(Boolean);

// Check that locales is not empty
if (locales.length === 0) {
    throw new Error('NEXT_PUBLIC_LOCALES is empty, check env from next.config.ts');
}

const base = {
    locales,
    defaultLocale: 'en',
    localCookie: { // avoids next-intl treats this cookie as session (when user closes the browser)
        maxAge: 365 * 24 * 60 * 60,
    },
}

export const routing = defineRouting({
    ...base,
    localePrefix: 'as-needed', // just when the language is not default the url should include the language
});

export const routingNoPrefix = defineRouting({
    ...base,
    localePrefix: 'never', // never includes the prefix language in the url
});

export type Locale = (typeof routing.locales)[number];