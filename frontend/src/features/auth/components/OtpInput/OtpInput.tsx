import { useRef, useState, type KeyboardEvent, type ClipboardEvent } from 'react';
import styles from './OtpInput.module.css';

interface OtpInputProps {
    onChange: (value: string) => void;
    error?: boolean;
}

export function OtpInput({ onChange, error }: OtpInputProps) {
    const [digits, setDigits] = useState<string[]>(Array(6).fill('')); // store value
    const refs = useRef<(HTMLInputElement | null)[]>([]); // To call .focus on each input

    const update = (next: string[]) => {
        setDigits(next);
        onChange(next.join(''));
    }

    const handleChange = (i: number, val: string) => {
        if (!/^\d?$/.test(val)) return; // only single digits, ignore anything else
        
        const next = [...digits];
        next[i] = val;
        update(next);
        if (val && i < 5) refs.current[i + 1]?.focus(); // auto-advance to next box
    };

    const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus(); // jump back on empty
    }

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

        if (!pasted) return; // pasted nothing usable

        e.preventDefault(); // stop the browser's default behavior of paste raw text into one box

        const next = pasted.split('').concat(Array(6).fill('')).slice(0, 6); // '428817' -> [4,2,8,8,1,7]

        update(next); // fill all boxes at once

        refs.current[Math.min(pasted.length, 5)]?.focus(); // Move focus to the box right after the last pasted digit
    }

    return (
        <div className={styles.wrap}>
            {digits.map((d, i) => (
                <input 
                    key={i}
                    ref={(el) => { refs.current[i] = el; }}
                    type='text'
                    inputMode='numeric'
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className={`${styles.box} ${error ? styles.boxError : ''}`}
                />
            ))}
        </div>
    );
};