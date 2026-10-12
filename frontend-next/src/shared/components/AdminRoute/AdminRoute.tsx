'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthContext } from '@/core/auth/AuthContext';
import { Link, usePathname } from '@/i18n/navigation-no-prefix';
import { Spinner } from '../Spinner/Spinner';

export function AdminRoute({ children }: { children: ReactNode }) {
    const t = useTranslations();
    const { user, isLoading } = useAuthContext();
    const router = useRouter();
    const pathname = usePathname();

    const allowed = !isLoading && user?.role === 'admin';

    useEffect(() => {
        if (isLoading) return;
        if (!user) router.replace('/login');
        else if (user.role !== 'admin') router.replace('unauthorized');
    }, [isLoading, user, router]);

    if (!allowed) return <Spinner />; // No session, no admin rol, or verifying

    
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'admin') return <Navigate to="/unauthorized" replace />

    return <Outlet />;
}