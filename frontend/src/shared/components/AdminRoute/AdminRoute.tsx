import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '@/core/auth/AuthContext';
import { Spinner } from '../Spinner/Spinner';

export function AdminRoute() {
    const { user, isLoading } = useAuthContext();

    if (isLoading) return <Spinner />;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'admin') return <Navigate to="/unauthorized" replace />

    return <Outlet />;
}