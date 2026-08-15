import { useNavigate } from "react-router-dom";
import { motion } from 'motion/react';
import { ChevronRight, Package, Truck, CreditCard, Settings as SettingsIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "@/core/auth/AuthContext";

const ROWS = [
    { to: '/profile/orders', icon: Package, key: 'profile.myOrders' },
    { to: '/profile/shipping', icon: Truck, key: 'profile.shippingAddress' },
    { to: '/profile/payment', icon: CreditCard, key: 'profile.paymentMethods' },
    { to: '/settings', icon: SettingsIcon, key: 'profile.settings' },
];

export function ProfilePage() {
    const { user } = useAuthContext();
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mx-auto max-w-md px-4 pb-24 pt-6 md:pb-6 md:pt-20"
        >
            <h1 className="mb-6 text-lg font-semibold text-ink">
                {t('profile.title')}
            </h1>

            <button onClick={() => navigate('/profile/details')} className="flex w-full flex-col items-center gap-2 rounded-md bg-surface-2 py-6 transition-transform active:scale-[0.98]">
                {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.firstName} className="h-20 w-20 rounded-full border-2 border-accent object-cover" />
                ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-accent bg-surface text-2xl font-semibold text-accent">
                        {user?.firstName?.[0]?.toUpperCase() ?? '?'}
                    </div>
                )}

                <span className="font-semibold text-ink">{user ? `${user.firstName} ${user.lastName ?? ''}` : t('profile.guest')}</span>

                <span className="text-sm text-muted">{user?.email}</span>
            </button>

            <div className="mt-6 divide-y divide-border rounded-md bg-surface-2 overflow-hidden">
                {ROWS.map(({ to, icon: Icon, key }, i) => (
                    <motion.button
                        key={to}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.2 }}
                        onClick={() => navigate(to)}
                        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface active:scale-[0.99]"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-surface text-accent">
                            <Icon size={18} />
                        </span>
                        <span className="flex-1 text-sm font-medium text-ink">
                            {t(key)}
                        </span>
                        <ChevronRight size={18} className="text-muted" />
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
}