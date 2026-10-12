'use client';

import { useEffect, type ReactNode } from "react";
import { useRouter } from 'next/navigation';
import { useAuthContext } from "@/core/auth/AuthContext";
import { Spinner } from "../Spinner/Spinner";

// Opposite of ProtectedRoute take the user out of login/register
// if they have a session
export function GuestRoute({ children }: { children: ReactNode }) {
    const { user, isLoading } = useAuthContext();
    const router = useRouter();

    // Check if a user is logged-in to take him to /profile in auth routes
    useEffect(() => {
        if (!isLoading && user) router.replace('/profile');
    }, [isLoading, user, router]);

    // While is verifying it shows a spinner
    if (isLoading || user) return <Spinner />;

    return <>{children}</>;
}