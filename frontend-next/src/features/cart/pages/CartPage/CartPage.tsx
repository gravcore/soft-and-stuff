import { useNavigate } from "react-router-dom";
import { CartSkeleton } from "../../components/CartSkeleton";
import { EmptyCart } from "../../components/EmptyCart";
import { useCart } from "../../hooks/useCart"
import { ArrowLeft, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CartItemList } from "../../components/CartItemList";
import { PromoCodeInput } from "../../components/PromoCodeInput";
import { CartSummary } from "../../components/CartSummary";

export const CartPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { cart, isLoading, updateItem, removeItem, clearAllCart } = useCart();
    const canGoBack = (window.history.state?.idx ?? 0) > 0;

    if (isLoading) return <CartSkeleton />;
    if (!cart || cart.items.length === 0) return <EmptyCart />;

    return (
        <div className="mx-auto max-w-2xl px-4 pb-32 pt-6 md:mt-16">
            <div className="mb-6 flex items-center justify-between">
                {canGoBack && (
                    <button onClick={() => navigate(-1)} className="text-ink hover:cursor-pointer">
                        <ArrowLeft size={22} />
                    </button>
                )}

                <h1 className="text-lg font-semibold text-ink">
                    {t('cart.yourCart', 'Your Cart')}
                </h1>

                <button 
                    type="button" className="text-danger hover:cursor-pointer"
                    onClick={() => clearAllCart.mutate()}
                    title={t('cart.clearCart', 'Clear cart')}
                >
                    <Trash2 size={20} />
                </button>
            </div>

            <CartItemList 
                items={cart.items}
                disabled={updateItem.isPending}
                onQuantityChange={(itemId, quantity) => {
                    if (quantity <= 0) removeItem.mutate(itemId);
                    else updateItem.mutate({ itemId, quantity });
                }}
            />

            <div className="mt-6"><PromoCodeInput /></div>
            <div className="mt-8"><CartSummary subtotal={cart.total} /></div>
        </div>
    );
};