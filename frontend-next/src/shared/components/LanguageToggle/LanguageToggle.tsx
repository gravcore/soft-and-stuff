import { SegmentToggle } from "../SegmentToggle/SegmentToggle";
import { useLocale, useTranslations } from 'next-intl'; 
import { usePathname as useNativePathname } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { resolveRoute } from '@/routeAccess';
import { useRouter as usePrefixedRouter, usePathname as usePrefixedPathname } from '@/i18n/navigation'; 
import { useRouter as useNoPrefixRouter, usePathname as useNoPrefixPathname } from '@/i18n/navigation-no-prefix'; 

export function LanguageToggle() {
    const locale = useLocale();
    const t = useTranslations();

    const displayNames = new Intl.DisplayNames([locale], { type: 'language' });

    const options = routing.locales.map((code) => {
        const label = displayNames.of(code) ?? code.toUpperCase();
        return {
            value: code,
            label: label.charAt(0).toUpperCase() + label.slice(1),
        };
    });

    const isNoPrefixPage = resolveRoute(useNativePathname()).localePrefix === 'never';
    // '/es/products' for example has prefix and the internal table have no that key, so it falls to the default 'as-needed'

    // 4 hooks always called not inside an if because of the react's hook rule
    const prefixedRouter = usePrefixedRouter();
    const prefixedPathname = usePrefixedPathname();
    const noPrefixRouter = useNoPrefixRouter();
    const noPrefixPathname = useNoPrefixPathname();

    const changeLanguage = (nextLocale: string) =>
        isNoPrefixPage
            ? noPrefixRouter.replace(noPrefixPathname, { locale: nextLocale })
            : prefixedRouter.replace(prefixedPathname, { locale: nextLocale });

    return (
        <SegmentToggle 
            options={options}
            activeValue={locale}
            onChange={changeLanguage}
            ariaLabel={t('nav.language')}
        />
    );
}