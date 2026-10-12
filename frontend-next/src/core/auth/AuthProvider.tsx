import { useEffect, useRef, useState, type ReactNode } from "react";
import { AuthContext, type AuthUser } from "./AuthContext";
import { fetchCurrentUser, loginWithOneTap } from "@/features/auth/services/authApi";
import { Spinner } from "@/shared/components/Spinner/Spinner";

// ====== for Google one-tap login ======
interface GoogleAccounts {
    accounts: { id: { initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void; prompt: () => void } };
}
// ====== for Google one-tap login ======

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const mightBeLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(mightBeLoggedIn);
    const sessionChecked = useRef(false);
    const oneTapInitialized = useRef(false);

    useEffect(() => {
        // Protects when double render for example in StrictMode
        if (sessionChecked.current) return;
        sessionChecked.current = true;

        if (!mightBeLoggedIn) return;

        fetchCurrentUser()
            .then(setUser)
            .catch(() => { setUser(null); localStorage.removeItem('isLoggedIn'); })
            .finally(() => setIsLoading(false));
    }, [setUser, setIsLoading, mightBeLoggedIn]);

    // ====== for Google one-tap login ======
    useEffect(() => {
        if (oneTapInitialized.current) return;
        oneTapInitialized.current = true;

        if (mightBeLoggedIn) return; // already logged in, don't show the prompt at all

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.onload = () => {
            const google = (window as unknown as { google: GoogleAccounts }).google;
            
            google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                callback: async (response: { credential: string }) => {
                    await loginWithOneTap(response.credential);
                    setUser(await fetchCurrentUser());
                },
            });
            google.accounts.id.prompt();
        };

        document.body.appendChild(script);
    }, [mightBeLoggedIn])
    // ====== for Google one-tap login ======

    if (isLoading) return <Spinner />

    return (
        <AuthContext.Provider value={{ user, setUser, isLoading, setIsLoading }}>
            {children}
        </AuthContext.Provider>
    );
};