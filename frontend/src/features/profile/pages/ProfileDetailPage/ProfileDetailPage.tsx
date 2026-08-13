import { useNavigate } from "react-router-dom";
import { motion } from 'motion/react';
import { ArrowLeft, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "@/core/auth/AuthContext";
import { useLogout } from "@/features/auth/hooks/useLogout";

export function ProfileDetailPage() {
    const { user } = useAuthContext();
    const navigate = useNavigate();
    const canGoBack = (window.history.state?.idx ?? 0) > 0;
    const { t } = useTranslation();
    const { mutate: logout, isPending } = useLogout();

    const fields = [
        { label: t('profile.firstName'), value: user?.firstName },
        { label: t('profile.lastName'), value: user?.lastName },
        { label: t('auth.common.email'), value: user?.email },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="mx-auto max-w-md px-4 pb-24 pt-6 md:pb-6"
        >
            {canGoBack && (
                <button 
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-sm text-muted hover:text-ink">
                        <ArrowLeft size={16} /> {t('common.back')}
                </button>
            )}

            <div className="mb-6 flex flex-col items-center gap-2">
                {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.firstName} className="h-24 w-24 rounded-full object-cover" />
                ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface-2 text-3xl font-semibold text-accent">
                        {user?.firstName?.[0]?.toUpperCase() ?? '?'}
                    </div>
                )}
            </div>

            <div className="divide-y divide-border rounded-md bg-surface-2">
                {fields.map((f) => (
                    <div key={f.label} className="px-4 py-3 5">
                        <p className="text-xs text-muted">{f.label}</p>
                        <p className="text-sm font-medium text-ink">{f.value}</p>
                    </div>
                ))}
            </div>

            <button
                onClick={() => {
                    logout(undefined, { onSuccess: () => navigate('/login', { replace: true }) });
                }}
                disabled={isPending} 
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border border-danger py-3 text-sm font-semibold text-danger transition-colors hover:bg-danger/10 disabled:opacity-60 hover:cursor-pointer disabled:cursor-not-allowed">
                    <LogOut size={16} /> {isPending ? t('profile.loggingOut') : t('profile.logout')}
            </button>
        </motion.div>
    );
}
