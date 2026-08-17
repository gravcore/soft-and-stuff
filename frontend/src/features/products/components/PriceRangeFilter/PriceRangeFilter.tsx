import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { formatPrice } from '../../utils/formatPrice';

interface PriceRangeFilterProps {
    min: number;
    max: number;
    value: [number, number];
    onChange: (value: [number, number]) => void;
}

export function PriceRangeFilter({ min, max, value, onChange }: PriceRangeFilterProps) {

    // Local copy so the slider moves instantly no touching the url
    const [local, setLocal] = useState(value);

    // Saved copy of value, used to detect when value changed from outside (url/parent)
    const [prevValue, setPrevValue] = useState(value);

    // Value changed from the url
    // Check that runs on every render, comparing value (from the parent) against prevValue
    if (value[0] !== prevValue[0] || value[1] !== prevValue[1]) {
        setPrevValue(value);
        setLocal(value);
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
        setLocal([Math.min(v, local[1]), local[1]]);
    }

    function handleMaxChange(v: number) {
        setLocal([local[0], Math.max(v, local[0])]);
    }

    const minPercent = ((local[0] - min) / (max - min)) * 100;
    const maxPercent = ((local[1] - min) / (max - min)) * 100;

    return (
        <div className="w-full max-w-xs">
            <div className="mb-2 flex items-center justify-between text-xs text-muted">
                <span>{formatPrice(local[0])}</span>
                <span>{formatPrice(local[1])}</span>
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
                    onChange={(e) => handleMinChange(Number(e.target.value))}
                    className="range-thumb pointer-events-none absolute inset-0 w-full
                    appearance-none bg-transparent"
                />
                <input 
                    type="range"
                    min={min}
                    max={max}
                    value={local[1]}
                    onChange={(e) => handleMaxChange(Number(e.target.value))}
                    className="range-thumb pointer-events-none absolute inset-0 w-full
                    appearance-none bg-transparent"
                />
            </div>
        </div>
    );
}