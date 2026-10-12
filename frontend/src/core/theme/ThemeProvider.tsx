import { useEffect, useState } from "react";
import { ThemeContext, type Props, type Theme } from "./ThemeContext";

function resolve(current: Theme): 'light' | 'dark' {
    if (current === 'system') {
        // OS preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return current;
}

export function ThemeProvider({ children }: Props) {

    // Initial state
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('theme') as Theme | null;
        return saved || 'system';
    });

    // What the OS have as theme
    const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => resolve('system'));

    // Computed during render
    const resolvedTheme = theme === 'system' ? systemTheme : theme;

    // Manual theme choice
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', resolvedTheme);
        localStorage.setItem('theme', theme);
    }, [theme, resolvedTheme]);

    // OS-level changes
    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const handle = () => setSystemTheme(media.matches ? 'dark' : 'light');
        media.addEventListener('change', handle);
        return () => media.removeEventListener('change', handle);
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}