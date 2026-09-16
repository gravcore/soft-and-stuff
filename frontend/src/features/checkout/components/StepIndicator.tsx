import { Check, ClipboardCheck, CreditCard, Truck } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

export function StepIndicator({ current }: { current: 'shipping' | 'payment' | 'review' }) {
    const { t } = useTranslation();

    const steps = [
        { key: 'shipping', icon: Truck, label: t('checkout.stepShipping', 'Shipping') },
        { key: 'payment', icon: CreditCard, label: t('checkout.stepPayment', 'Payment') },
        { key: 'review', icon: ClipboardCheck, label: t('checkout.stepReview', 'Review') },
    ] as const;

    const currentIndex = steps.findIndex((s) => s.key === current);

    return (
        <div className="mb-8 flex items-center justify-center">
            {steps.map((step, i) => {
                const isDone = i < currentIndex;
                const isCurrent = i === currentIndex;
                
                return (                
                <div key={step.key} className="flex items-center">

                    <div className="flex flex-col items-center gap-1.5">
                        <motion.div
                            animate={{
                                backgroundColor: isDone || isCurrent ? 'var(--accent-admin)' : 'var(--color-surface-2)',
                                scale: isCurrent ? 1.08 : 1,
                            }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="flex h-11 w-11 items-center justify-center rounded-full
                            text-white shadow-sm"
                            style={isCurrent ? { boxShadow: '0 0 0 4px color-mix(in srgb, var(--accent-admin) 20%, transparent)' } : undefined}
                        >
                            {isDone ? <Check size={18} /> : <step.icon size={17} />}
                        </motion.div>

                        <span 
                            className="text-[11px] font-medium transition-colors"
                            style={{ color: isCurrent ? 'var(--accent-admin)' : 'var(--color-muted)' }}
                        >
                            {step.label}
                        </span>
                    </div>

                    {/* If is not the last item */}
                    {i < steps.length - 1 && (
                        <motion.div
                            animate={{ backgroundColor: isDone ? 'var(--accent-admin)' : 'var(--color-border)' }}
                            className="mx-1.5 mb-5 h-0.5 w-10 rounded-full sm:w-14"
                        />
                    )}
                </div>
            );
        })}
        </div>
    );
}