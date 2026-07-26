import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type Theme } from '@/core/theme/ThemeContext';
import styles from './ThemeToggle.module.css';

const OPTIONS: { value: Theme; icon: typeof Sun; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
];

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const activeIndex = OPTIONS.findIndex((o) => o.value === theme);

    return (
        <div className={styles.track} role='radiogroup' aria-label='Theme'>
            <div
                className={styles.indicator}
                style={{ transform: `translateX(${activeIndex * 100}%)`}}
            />
            {OPTIONS.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    type='button'
                    role='radio'
                    aria-checked={theme === value}
                    aria-label={label}
                    title={label}
                    className={styles.option}
                    onClick={() => setTheme(value)}
                >
                    <Icon size={16} strokeWidth={2} />
                </button>
            ))}
        </div>
    );
}