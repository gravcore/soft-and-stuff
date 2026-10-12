import { formatPrice } from "@/features/products/utils/formatPrice";
import { useTranslation } from "react-i18next";

interface CheckoutBottomBarProps {
    total: number;
    currency: string;
    actionLabel?: string;
    onAction?: () => void;
    disabled?: boolean;
}

export function CheckoutBottomBar({ total, actionLabel, onAction, disabled }: CheckoutBottomBarProps) {
    const { t } = useTranslation();

    return (
        <div className="fixed inset-x-0 bottom-0 z-10 
        border-t border-border bg-surface/90 px-4 py-4 backdrop-blur-xl">

            <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
                
                {/* Total */}
                <div>
                    <p className="text-[11px] uppercase tracking-wide
                    text-muted">
                        {t('checkout.total', 'Total')}
                    </p>

                    <p className="text-lg font-semibold text-ink">
                        {formatPrice(total).full}
                    </p>
                </div>

                {/* Action button */}
                {actionLabel && onAction && (
                    <button 
                        type="button"
                        onClick={onAction}
                        disabled={disabled} 
                        className="rounded-full bg-accent-admin
                        px-8 py-3 text-sm font-semibold text-white transition-opacity
                        disabled:opacity-50"
                    >
                        {actionLabel}
                    </button>
                )}

            </div>
        </div>
    );
}