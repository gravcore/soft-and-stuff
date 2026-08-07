import { useEffect, useRef, useState, type ReactNode } from "react";
import { AuthContext, type AuthUser } from "./AuthContext";
import { fetchCurrentUser } from "@/features/auth/services/authApi";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const mightBeLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(mightBeLoggedIn);
    const checked = useRef(false);

    useEffect(() => {
        if (checked.current) return;
        checked.current = true;

        if (!mightBeLoggedIn) return;

        fetchCurrentUser()
            .then(setUser)
            .catch(() => { setUser(null); localStorage.removeItem('isLoggedIn'); })
            .finally(() => setIsLoading(false));
    }, [setUser, setIsLoading, mightBeLoggedIn]);

    return (
        <AuthContext.Provider value={{ user, setUser, isLoading, setIsLoading }}>
            {children}
        </AuthContext.Provider>
    );
};