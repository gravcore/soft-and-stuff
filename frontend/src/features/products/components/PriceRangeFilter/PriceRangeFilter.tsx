import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { formatPrice } from '../../utils/formatPrice';
import { useTranslation } from 'react-i18next';

interface PriceRangeFilterProps {
    min: number;
    max: number;
    value: [number, number];
    onChange: (value: [number, number]) => void;
}

function clampRange([lo, hi]: [number, number], min: number, max: number, fallback?: [number, number]): [number, number] {
    const safeLo = Number.isFinite(lo) ? lo : fallback?.[0] ?? min;
    const safeHi = Number.isFinite(hi) ? hi : fallback?.[1] ?? max;
    return [Math.min(Math.max(safeLo, min), max), Math.max(Math.min(safeHi, max), min)];
}

export function PriceRangeFilter({ min, max, value, onChange }: PriceRangeFilterProps) {

    const { t } = useTranslation();

    // Local copy so the slider moves instantly no touching the url
    const [local, setLocal] = useState(() => clampRange(value, min, max));

    // Saved copy of value, used to detect when value changed from outside (url/parent)
    const [prevValue, setPrevValue] = useState(value);

    // Value changed from the url
    // Check that runs on every render, comparing value (from the parent) against prevValue
    const safeValue = clampRange(value, min, max, local);
    if (safeValue[0] !== prevValue[0] || safeValue[1] !== prevValue[1]) {
        setPrevValue(safeValue);
        setLocal(safeValue);
    }

    const debounced = useDebounce(local, 300);

    // Holding the latest value made by the parent (url), not local dragging
    const valueRef = useRef(value);
    useEffect(() => {
        valueRef.current = value;
    });

    // Tells the parent that the price changed, triggered by debounced (dragging with delay)
    useEffect(() => {
        if (debounced[0] !== valueRef.current[0] || debounced[1] !== valueRef.current[1])
            onChange(debounced);
    }, [debounced, onChange]);

    function handleMinChange(v: number) {
        const safe = Number.isFinite(v) ? v : min;
        const clamped = Math.min(Math.max(safe, min), max); // Protects max/min 
        if (clamped > local[1]) setLocal([clamped, clamped]); // Set 2 points min and max the same if min is bigger than max
        else setLocal([clamped, local[1]]); // normal case min point is smaller than max point
    }

    function handleMaxChange(v: number) {
        const safe = Number.isFinite(v) ? v : max;
        const clamped = Math.max(Math.min(safe, max), min); // Protects to not go beyond absolute min/max
        if (clamped < local[0]) setLocal([clamped, clamped]);
        else setLocal([local[0], clamped]);
    }

    const minPercent = ((local[0] - min) / (max - min)) * 100;
    const maxPercent = ((local[1] - min) / (max - min)) * 100;

    return (
        <div className="w-full max-w-xs">
            
            {/* Editable number boxes */}
            <div className="mb-4 flex items-center gap-2">

                <PriceInput label={t('products.priceMin', 'Min')} value={local[0]} onCommit={handleMinChange} />
                <PriceInput label={t('products.priceMax', 'Max')} value={local[1]} onCommit={handleMaxChange} />

            </div>

            {/* dual-thumb slider: 2 range inputs stacked on the same track */}
            <div className="relative h-1.5 rounded-full bg-surface-2">

                {/* Colored bar between the two handles, purely visual */}
                <div 
                    className="pointer-events-none absolute h-full rounded-full bg-accent"
                    style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
                />

                <input 
                    type="range"
                    min={min}
                    max={max}
                    value={local[0]}
                    title={String(local[0])}
                    onChange={(e) => handleMinChange(Number(e.target.value))}
                    className="range-thumb pointer-events-none absolute inset-0 w-full
                    appearance-none bg-transparent"
                />
                <input 
                    type="range"
                    min={min}
                    max={max}
                    value={local[1]}
                    title={String(local[1])}
                    onChange={(e) => handleMaxChange(Number(e.target.value))}
                    className="range-thumb pointer-events-none absolute inset-0 w-full
                    appearance-none bg-transparent"
                />
            </div>
        </div>
    );
}

function PriceInput({ label, value, onCommit }: { label: string; value: number; onCommit: (v: number) => void }) {
    const [focused, setFocused] = useState(false);
    const [rawText, setRawText] = useState(String(value));

    const { symbol, amount } = formatPrice(value, false); // not in cents

    function commit() {
        const parsed = Number(rawText);
        onCommit(Number.isFinite(parsed) ? parsed : value);
    }

    return (
        <div className="flex-1 rounded-lg border border-border bg-surface-2 px-2.5 py-1.5">
            <label className="mb-0.5 block text-[0.6875rem] text-muted">{label}</label>

            <div className="flex items-baseline gap-0.5 text-sm text-ink">
                <span>{symbol}</span>

                <input 
                    type="text"
                    inputMode="decimal"
                    value={focused ? rawText : amount}
                    onFocus={() => { setFocused(true); setRawText(String(value)); }}
                    onChange={(e) => setRawText(e.target.value.replace(/[^0-9.]/g, ''))}
                    onBlur={() => { setFocused(false); commit(); }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            commit();
                            e.currentTarget.blur();
                        }
                    }}
                    className="w-full bg-transparent outline-none"
                />
            </div>
        </div>
    );
}