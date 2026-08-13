import { useEffect, useRef } from "react";
import { loginWithOneTap, fetchCurrentUser } from "../services/authApi";
import { useAuthContext } from "@/core/auth/AuthContext";
import { useNavigate } from "react-router-dom";

interface GoogleAccounts {
    accounts: {
        id: {
            initialize: (config: {
                client_id: string;
                callback: (response: { credential: string }) => void;
            }) => void;
            renderButton: (
                el: HTMLElement,
                options: {
                    theme?: 'outline' | 'filled_blue' | 'filled_black';
                    size?: 'large' | 'medium' | 'small';
                    shape?: 'rectangular' | 'pill' | 'circle' | 'square';
                    width?: number;
                    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
                }
            ) => void;
        };
    };
}

export function useGoogleButton() {
    const containerRef = useRef<HTMLDivElement>(null);
    const initialized = useRef(false);
    const { setUser } = useAuthContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.onload = () => {
            const google = (window as unknown as { google: GoogleAccounts}).google;

            google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                callback: async (response: { credential: string }) => {
                    await loginWithOneTap(response.credential);
                    setUser(await fetchCurrentUser());
                    navigate('/');
                },
            });

            if (containerRef.current) {
                google.accounts.id.renderButton(containerRef.current, {
                    theme: 'filled_blue',
                    size: 'large',
                    shape: 'pill',
                    width: 320,
                    text: 'continue_with',
                });
            }
        };

        document.body.appendChild(script);
    }, [setUser, navigate]);

    return containerRef;
}
