import { useState, useEffect } from 'react';

// Pause for delay ms to avoid firing a reqquest on every single keystroke
export function useDebounce<T>(value: T, delay: number): T {
    
    // What we actually return and use elsewhere
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Wait delay ms, then update debouncedValue to match the latest value
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cancels the old pending timer before the effect runs again (on the next value/delay change),
        // and When the component unmounts
        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}