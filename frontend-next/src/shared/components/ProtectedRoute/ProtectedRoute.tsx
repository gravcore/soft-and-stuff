'use client';

import { useEffect, type ReactNode } from "react";
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/core/auth/AuthContext';
import { Spinner } from "../Spinner/Spinner";

export function ProtectedRoute({ children }: { children: ReactNode }) {
    const { user, isLoading } = useAuthContext();
    const router = useRouter();

    // Redirect to loging if there's no user logged-in
    useEffect(() => {
        if (!isLoading && !user) router.replace('/login');
    }, [isLoading, user, router]);

    // While is verifying the session we see a spinner
    if (isLoading || !user) return <Spinner />;

    // Protected content
    return <>{children}</>;
}