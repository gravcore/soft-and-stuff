import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type Theme } from '@/core/theme/ThemeContext';
import { SegmentToggle } from '../SegmentToggle/SegmentToggle';
import { useTranslation } from 'react-i18next';

const OPTIONS: { value: Theme; icon: typeof Sun; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
];

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const { t } = useTranslation();

    return (
        <SegmentToggle 
            options={OPTIONS}
            activeValue={theme}
            onChange={(value) => setTheme(value)}
            ariaLabel={t('nav.theme', 'Theme')}
        />
    );
}