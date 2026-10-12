import { useTranslation } from "react-i18next";
import { getAvailableLanguages } from "@/core/i18n/i18n";
import { SegmentToggle } from "../SegmentToggle/SegmentToggle";

export function LanguageToggle() {
    const { i18n, t } = useTranslation();
    const options = getAvailableLanguages().map(({ code, label }) => ({
        value: code, label
    }));

    return (
        <SegmentToggle 
            options={options}
            activeValue={i18n.language}
            onChange={(code) => i18n.changeLanguage(code)}
            ariaLabel={t('nav.language', 'Language')}
        />
    );
}