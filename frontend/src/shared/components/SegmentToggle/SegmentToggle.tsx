import { type LucideIcon } from 'lucide-react';
import styles from './ThemeToggle.module.css';

interface SegmentOption<T extends string> {
    value: T;
    label: string;
    icon?: LucideIcon;
}

interface SegmentToggleProps<T extends string> {
    options: SegmentOption<T>[];
    activeValue: T;
    onChange: (value: T) => void;
    ariaLabel: string;
}

export function SegmentToggle<T extends string>({ options, activeValue, onChange, ariaLabel }: SegmentToggleProps<T>) {
    const activeIndex = options.findIndex((o) => o.value === activeValue);

    return (
        <div className={styles.track} role='radiogroup' aria-label={ariaLabel}>
            <div
                className={styles.indicator}
                style={{ transform: `translateX(${Math.max(activeIndex, 0) * 100}%)`}}
            />
            {options.map(({ value, label, icon: Icon }) => (
                <button
                    key={value}
                    type='button'
                    role='radio'
                    aria-checked={activeValue === value}
                    aria-label={label}
                    title={label}
                    className={styles.option}
                    onClick={() => onChange(value)}
                >
                    {Icon && <Icon size={16} strokeWidth={2} />}
                    {label}
                </button>
            ))}
        </div>
    );
}