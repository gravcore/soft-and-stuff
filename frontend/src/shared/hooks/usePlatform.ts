import { useState, useEffect } from "react";

export type Platform = 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'web';

interface CapacitorWindow extends Window {
  Capacitor?: {
    getPlatform: () => string
    // getPlatform() = returns 'android', 'ios', or 'web'
  }
}

function fromUserAgent(): Platform {
    const ua = navigator.userAgent.toLowerCase(); // example: "mozilla/5.0 (windows nt 10.0; win64; x64)..."

    if (/android/.test(ua)) return 'android';
    if (/iphone|ipad|ipod/.test(ua)) return 'ios';
    if (/win/.test(ua)) return 'windows';
    if (/mac/.test(ua)) return 'macos';
    if (/linux/.test(ua)) return 'linux';

    return 'web';
}

export function usePlatform(): Platform {
    const [platform, setPlatform] = useState('web');

    useEffect(() => {
        async function detect() {
            
            // Tauri
            if ('__TAURI_INTERNALS__' in window) {
                try {
                    const { platform } = await import('@tauri-apps/plugin-os');
                    setPlatform(platform() as Platform);
                } catch {
                    setPlatform(fromUserAgent());
                }
                return;
            }

            // Capacitor
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (window.Capacitor?.getPlatform) {
                const p = (window as CapacitorWindow).Capacitor?.getPlatform() as Platform;
                setPlatform(p === 'web' ? fromUserAgent() : p)
                return
            }

            setPlatform('web');
        }

        detect();
    }, []);

    return platform as Platform;
}