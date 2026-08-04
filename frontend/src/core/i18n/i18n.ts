import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import type enTranslations from './locales/en.json';

// Import each translation file inmediately
const localeModules = import.meta.glob<{ default: typeof enTranslations }>('./locales/*.json', { eager: true });

// To reshape to what i18next needs
const resources: Record<string, { translation: typeof enTranslations }> = {};

const languageCodes: string[] = [];

// Fill resources with the shape i18n expects, and fill languageCodes
for (const path in localeModules) {
    const code = path.match(/\.\/locales\/(.+)\.json$/)?.[1];
    if (!code) continue;
    resources[code] = { translation: localeModules[path].default };
    languageCodes.push(code);
}

// Get the language name with its code of each available language
export function getAvailableLanguages(): { code: string; label: string }[] {
    const displayNames = new Intl.DisplayNames([i18n.language ?? 'en'], { type: 'language' });
    return languageCodes.map((code) => ({
        code,
        label: displayNames.of(code) ?? code.toUpperCase(),
    }));
}

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'lang',
        },
    });

export default i18n;