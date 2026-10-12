'use client';
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { ThemeContext, type Props, type Theme } from "./ThemeContext";

const STORAGE_KEY = 'theme';
const DARK_QUERY = '(prefers-color-scheme: dark)'; // ask to the OS if it has dark mode active

// ======== Source 1: preference saved by the person (localstorage) ===========
const themeListeners = new Set<() => void>(); // components waiting for theme changes

function subscribeToTheme(onChange: () => void) {
    themeListeners.add(onChange); // Changes on this tab, setTheme notify below

    window.addEventListener('storage', onChange); // Changes on other tab, the browser triggers 'storage'

    return () => {
        // Cleaning function
        themeListeners.delete(onChange);
        window.removeEventListener('storage', onChange);
    };
}

// The current value readed on the browser
function getThemeSnapshot(): Theme {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : 'system';
}

// Server side there's no any localStorage, and the hydratation must start 
// with the same that the server drew
const getThemeServerSnapshot = (): Theme => 'system';

// ======== Source 2: OS theme matchMedia ===========
function subscribeToSystemTheme(onChange: () => void) {
    const media = window.matchMedia(DARK_QUERY);
    
    // Notify when the user changes light/dark on his OS
    media.addEventListener('change', onChange);

    // Cleaner function
    return () => media.removeEventListener('change', onChange);
}

const getSystemThemeSnapshot = (): 'light' | 'dark' =>
    window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';

// On the server there's no window so we use 'light' as a neutral value for hydratation
const getSystemThemeServerSnapshot = (): 'light' | 'dark' => 'light';

export function ThemeProvider({ children }: Props) {
    // React hook to read data that lives outside React (localStorage, OS theme)
    const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getThemeServerSnapshot);

    // What OS has active right now
    const systemTheme = useSyncExternalStore(
        subscribeToSystemTheme,
        getSystemThemeSnapshot,
        getSystemThemeServerSnapshot,
    );

    // Computed during render, actual theme
    const resolvedTheme = theme === 'system' ? systemTheme : theme;

    // Function to change the theme
    const setTheme = useCallback((next: Theme) => {
        localStorage.setItem(STORAGE_KEY, next);
        themeListeners.forEach((notify) => notify()); // Notify to react in this tab, that the data changed, to re-read the snapshot
    }, []);

    // Sync React with the external system (html attribute)
    // Don't change any state
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', resolvedTheme);
    }, [resolvedTheme]);

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}