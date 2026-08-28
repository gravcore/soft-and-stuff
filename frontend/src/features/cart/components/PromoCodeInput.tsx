import { Tag } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function PromoCodeInput() {
    const [code, setCode] = useState('');
    const { t } = useTranslation();

    return (
        <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-full bg-surface-2 px-4 py-3 text-muted">
                <Tag size={16} />
                
                <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={t('cart.promoCode', 'Promo code')}
                    className="w-full bg-transparent text-sm text-ink
                    placeholder:text-muted focus:outline-none"
                />
            </div>

            <button type="button" className="rounded-full bg-surface-2 px-5 py-3 text-sm font-semibold text-accent disabled:opacity-50">
                {t('cart.applyPromoCode', 'Apply')}
            </button>
        </div>
    );
}