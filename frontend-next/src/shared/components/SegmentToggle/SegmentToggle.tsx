import { type LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

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
    
    return (
        <div 
            role="radiogroup"
            aria-label={ariaLabel}
            className="relative flex w-full gap-0.5 rounded-full border border-border bg-surface-2 p-1"
        >
                {options.map(({ value, label, icon: Icon }) => {
                    const isActive = activeValue === value;
                    return (
                        <button 
                            key={value}
                            type="button"
                            role="radio"
                            aria-checked={isActive}
                            onClick={() => onChange(value)}
                            className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm
                            transition-colors duration-200 ${ isActive ? 'font-semibold text-ink' : 'font-medium text-muted hover:text-ink'}`}
                        >
                            {isActive && (
                                <motion.span
                                    layoutId={`segment-indicator-${ariaLabel}`}
                                    className='absolute inset-0 z-0 rounded-full bg-accent shadow-sm'
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-1 5">
                                {Icon && <Icon size={16} strokeWidth={2} />}
                                {label}
                            </span>
                        </button>
                    );
                })}
        </div>
    );
}