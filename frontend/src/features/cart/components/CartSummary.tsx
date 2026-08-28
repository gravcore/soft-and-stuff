import { formatPrice } from "@/features/products/utils/formatPrice";
import { useTranslation } from "react-i18next";
import { motion } from 'motion/react';
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface CartSummaryProps {
    subtotal: number;
}

export function CartSummary({ subtotal }: CartSummaryProps) {
    const { t } = useTranslation();

    return (
        <div>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted">
                    <span>{t('cart.subtotal', 'Subtotal')}</span>
                    <span>{formatPrice(subtotal).full}</span>
                </div>
            </div>

            {/* Shipping */}
            {/* Total */}

            <motion.div
                whileTap={{ scale: 0.97 }}
                className="mt-6"
            >
                <Link
                    to="/checkout"
                    className="flex w-full items-center justify-center
                    gap-2 rounded-full bg-ink py-4 text-sm
                    font-semibold text-surface-2"
                >
                    {t('cart.checkout', 'Checkout')} <ArrowRight size={16} />
                </Link>
            </motion.div>
        </div>
    );
}