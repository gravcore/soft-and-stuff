import { useNavigate } from "react-router-dom";
import { motion } from 'motion/react';
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/shared/components/Theme/ThemeToggle";
import { LanguageToggle } from "@/shared/components/LanguageToggle/LanguageToggle";

export function SettingsPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const canGoBack = (window.history.state?.idx ?? 0) > 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="mx-auto max-w-md px-4 pb-24 pt-6 md:pb-6 md:pt-22"
        >
            {canGoBack && (
                <button 
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-sm text-muted hover:text-ink">
                        <ArrowLeft size={16} /> {t('common.back')}
                </button>
            )}

            <h1 className="mb-6 text-lg font-semibold text-ink">
                {t('settings.title')}
            </h1>

            <section className="mb-6">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                    {t('settings.theme')}
                </p>
                <ThemeToggle />
            </section>

            <section>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                    {t('settings.language')}
                </p>
                <LanguageToggle />
            </section>
        </motion.div>
    );
}