'use client';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type Theme } from '@/core/theme/ThemeContext';
import { SegmentToggle } from '../SegmentToggle/SegmentToggle';
import { useTranslations } from 'next-intl'; 

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const t = useTranslations();

    const Options: { value: Theme; icon: typeof Sun; label: string }[] = [
        { value: 'light', icon: Sun, label: t('theme.light') },
        { value: 'dark', icon: Moon, label: t('theme.dark') },
        { value: 'system', icon: Monitor, label: t('theme.system') },
    ];

    return (
        <SegmentToggle 
            options={Options}
            activeValue={theme}
            onChange={(value) => setTheme(value)}
            ariaLabel={t('nav.theme')}
        />
    );
}