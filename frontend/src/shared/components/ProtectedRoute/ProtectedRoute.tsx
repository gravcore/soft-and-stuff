import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from '@/core/auth/AuthContext';
import { Spinner } from "../Spinner/Spinner";
import { useEffect, useRef } from "react";
import { fetchCurrentUser } from "@/features/auth/services/authApi";

export function ProtectedRoute() {
    const { user, setUser, isLoading, setIsLoading } = useAuthContext();

    const checked = useRef(false);

    useEffect(() => {
        if (checked.current) return;
        checked.current = true;

        fetchCurrentUser()
            .then(setUser)
            .catch(() => setUser(null))
            .finally(() => setIsLoading(false));
    }, [setUser, setIsLoading]);

    if (isLoading) return <Spinner />;
    if (!user) return <Navigate to="/login" replace />;

    return <Outlet />;
}