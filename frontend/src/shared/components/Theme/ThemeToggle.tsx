import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type Theme } from '@/core/theme/ThemeContext';
import { SegmentToggle } from '../SegmentToggle/SegmentToggle';
import { useTranslation } from 'react-i18next';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const { t } = useTranslation();

    const Options: { value: Theme; icon: typeof Sun; label: string }[] = [
        { value: 'light', icon: Sun, label: t('theme.light', 'Light') },
        { value: 'dark', icon: Moon, label: t('theme.dark', 'Dark') },
        { value: 'system', icon: Monitor, label: t('theme.system', 'System') },
    ];

    return (
        <SegmentToggle 
            options={Options}
            activeValue={theme}
            onChange={(value) => setTheme(value)}
            ariaLabel={t('nav.theme', 'Theme')}
        />
    );
}