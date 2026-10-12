import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Check, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface LocationOption {
    code: string;
    name: string;
}

interface LocationComboboxProps {
    value: string;
    options: LocationOption[];
    onSelect: (name: string, code: string | null) => void;
    placeholder: string,
    disabled?: boolean;
    disabledMessage?: string;
    loading?: boolean;
}

export function LocationCombobox({ value, options, onSelect, placeholder, disabled, disabledMessage, loading }: LocationComboboxProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    // Hide if the user touches outside container
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filtered client-side, data loaded in memory
    const filtered = search.trim()
        ? options.filter((o) => o.name.toLowerCase().includes(search.trim().toLowerCase()))
        : options;

    const exactMatch = options.some((o) => o.name.toLowerCase() === search.trim().toLowerCase());

    const canUseCustom = search.trim().length > 0 && !exactMatch;

    function selectOption(option: LocationOption) {
        onSelect(option.name, option.code);
        setSearch('');
        setOpen(false);
    }

    function setCustomValue() {
        onSelect(search.trim(), null);
        setSearch('');
        setOpen(false);
    }

    // Enter uses the typed value directly
    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && canUseCustom) {
            e.preventDefault();
            setCustomValue();
        }
    }

    if (disabled) {
        return (
            <div className="flex w-full items-center rounded-xl
            bg-surface-2/50 px-3 py-3 text-sm text-muted">
                {disabledMessage}
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative">

            {/* Option selected in the button */}
            <button 
                type="button"
                onClick={() => setOpen((p) => !p)} 
                className="flex w-full items-center gap-2 
                rounded-xl bg-surface-2 px-3 py-3 text-sm outline-none"
            >
                <span className={`flex-1 truncate text-left
                    ${value ? 'text-ink' : 'text-muted'}`}
                >
                    {value || placeholder}
                </span>

                <ChevronDown size={16} className="shrink-0 text-muted" />
            </button>

            {/* Options card */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 mt-2 w-full overflow-hidden
                        rounded-2xl border border-border bg-surface shadow-lg"
                    >

                        {/* Search bar */}
                        <div className="relative border-b border-border p-2">
                            <Search size={14} className="absolute left-4 top-1/2
                            -translate-y-1/2 text-muted" />

                            <input 
                                autoFocus
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={t('checkout.searchOrType', 'Search or type your own...')}
                                className="w-full rounded-lg bg-transparent py-1.5 pl-9 pr-2 text-sm
                                text-ink outline-none"
                            />
                        </div>

                        {/* List of options */}
                        <div className="max-h-48 overflow-y-auto hide-scrollbar">
                            {loading && <p className="px-4 py-3 text-xs text-muted">
                                {t('checkout.loadingOptions', 'Loading...')}    
                            </p>}

                            {/* List of coincidences */}
                            {!loading && filtered.map((o) => (
                                <button 
                                    key={o.code}
                                    type="button" 
                                    onClick={() => selectOption(o)}
                                    className="flex w-full items-center 
                                    justify-between px-4 py-2.5 text-left text-sm text-ink
                                    hover:bg-surface-2"
                                >
                                    {o.name}
                                    {o.name === value && <Check size={14} className="text-accent-admin" />}
                                </button>
                            ))}

                            {/* Text for not matches */}
                            {!loading && filtered.length === 0 && (
                                <p className="px-4 py-3 text-xs text-muted">
                                    {t('checkout.notLocationMatches', 'No matches - you can still use what you typed below')}
                                </p>
                            )}

                            {/* Inline fallback */}
                            {canUseCustom && (
                                <button 
                                    type="button" 
                                    onClick={setCustomValue}
                                    className="flex w-full items-center gap-2 border-t border-border
                                    px-4 py-2.5 text-left text-sm text-accent-admin hover:bg-surface-2"
                                >
                                    <Plus size={14} />
                                    {t('checkout.useCustomValue', 'Use "{{name}}"', { name: search.trim() })}
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}