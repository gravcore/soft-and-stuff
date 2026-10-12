import { ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function EmptyCart() {
    const { t } = useTranslation();
    
    return (
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 pt-24 text-center md:mt-16">
            <ShoppingBag size={40} className="text-muted" />

            <p className="text-ink">{t('cart.cartEmpty', 'Your cart is empty.')}</p>

            <Link
                to="/products"
                className="rounded-full bg-accent px-6 py-3 text-sm font-semibold
                text-ink"
            >
                {t('cart.browseProducts', 'Browse products')}
            </Link>
        </div>
    );
}