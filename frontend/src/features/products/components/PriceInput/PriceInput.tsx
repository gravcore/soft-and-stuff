import { useState } from 'react';
import { formatPrice } from '../../utils/formatPrice';

export function PriceInput({ label, valueInDollars, onCommit }: { label: string; valueInDollars: number; onCommit: (v: number) => void; }) {
    const [focused, setFocused] = useState(false);
    const [rawText, setRawText] = useState(String(valueInDollars));

    const { symbol, amount } = formatPrice(valueInDollars, false); // not in cents

    function commit() {
        const parsed = Number(rawText);
        onCommit(Number.isFinite(parsed) ? parsed : valueInDollars);
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
                    onFocus={() => { setFocused(true); setRawText(String(valueInDollars)); }}
                    onChange={(e) => setRawText(e.target.value.replace(/[^0-9.]/g, ''))}
                    onBlur={() => { setFocused(false); commit(); }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            commit();
                            e.currentTarget.blur();
                        }
                    }}
                    className="w-full bg-transparent outline-none" />
            </div>
        </div>
    );
}
