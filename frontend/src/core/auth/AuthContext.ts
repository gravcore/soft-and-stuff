import { createContext, useContext } from "react";

export type UserRole = 'customer' | 'admin';

export interface AuthUser {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string | null;
}

export interface AuthContextValue {
    user: AuthUser | null;
    setUser: (user: AuthUser | null) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuthContext = (): AuthContextValue => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider');
    return ctx;
};