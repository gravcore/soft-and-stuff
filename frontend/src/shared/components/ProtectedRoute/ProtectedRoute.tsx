import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from '@/core/auth/AuthContext';
import { Spinner } from "../Spinner/Spinner";

export function ProtectedRoute() {
    const { user, isLoading } = useAuthContext();

    if (isLoading) return <Spinner />;
    if (!user) return <Navigate to="/login" replace />;

    return <Outlet />;
}