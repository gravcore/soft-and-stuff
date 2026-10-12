import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';

interface QuantityStepperProps {
    quantity: number;
    min?: number;
    max?: number;
    disabled?: boolean;
    onChange: (quantity: number) => void;
}

export function QuantityStepper({ quantity, min = 1, max = Infinity, disabled, onChange }: QuantityStepperProps) {
    
    const [text, setText] = useState(String(quantity));
    const [prevQuantity, setPrevQuantity] = useState(quantity);

    if (quantity !== prevQuantity) {
        setPrevQuantity(quantity);
        setText(String(quantity));
    }

    function commit(raw: string) {
        const parsed = Number(raw);
        const clamped = Number.isNaN(parsed) ? quantity : Math.min(Math.max(parsed, min), max);
        setText(String(clamped));
        onChange(clamped);
    }
    
    return (
        <div className="flex items-center gap-1 rounded-full bg-surface px-1 py-1">
            <button 
                type="button" className="flex h-7 w-7 items-center justify-center rounded-full text-ink disabled:opacity-30 hover:cursor-pointer disabled:hover:cursor-not-allowed"
                onClick={() => onChange(quantity - 1)}
                disabled={disabled || quantity<= min}
            >
                <Minus size={14} />
            </button>

            <input 
                type="text"
                inputMode="numeric"
                value={text}
                disabled={disabled}
                onChange={(e) => setText(e.target.value.replace(/\D/g, ''))}
                onBlur={(e) => commit(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                className="w-10 bg-transparent text-center text-sm text-ink
                focus:outline-none"
            />

            <button 
                type="button" className="flex h-7 w-7 items-center justify-center rounded-full text-ink disabled:opacity-30 hover:cursor-pointer disabled:hover:cursor-not-allowed"
                onClick={() => onChange(quantity + 1)}
                disabled={disabled || quantity >= max}
            >
                <Plus size={14} />
            </button>
        </div>
    );
}