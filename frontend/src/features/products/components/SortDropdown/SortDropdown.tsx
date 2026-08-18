import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function SortDropdown({ sort, onChange, sortOptions }: { sort: string[]; onChange: (sort: string[]) => void; sortOptions: { value: string; label: string }[] }) {

    const [open, setOpen] = useState(false); // controls whether the dropdown panel is visible
    const containerRef = useRef<HTMLDivElement>(null); // wraps the whole dropdown, to detect clicks outside of it
    const { t } = useTranslation();

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function selectOption(value: string) {
        onChange([value]);
        setOpen(false);
    }

    return (
        <div ref={containerRef} className="relative">
            <button 
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-border bg-surface-2 px-4 py-2 text-sm text-ink transition-colors hover:border-accent/50"
            >
                <span>{sortOptions.find((opt) => opt.value === sort[0])?.label ?? t('sort.label')}</span>

                <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown size={16} />
                </motion.span>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-border
                        bg-surface shadow-lg"
                    >
                        {sortOptions.map((opt) => {
                            const checked = sort.includes(opt.value);

                            return (
                                <button 
                                    key={opt.value}
                                    type="button"
                                    onClick={() => selectOption(opt.value)}
                                    className="flex w-full items-center justify-between px-4 py-2.5
                                    text-left text-sm text-ink transition-colors hover:bg-surface-2"
                                >
                                    <span>{opt.label}</span>

                                    {/* checkmark only renders when this option is selected, animates in/out instead o just popping */}
                                    <AnimatePresence>
                                        {checked && (
                                            <motion.span
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                                transition={{ duration: 0.12 }}
                                                className="text-accent"
                                            >
                                                <Check size={16} />
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

}