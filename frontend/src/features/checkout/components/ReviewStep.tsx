import { useTranslation } from "react-i18next";
import { ClipboardList } from "lucide-react";
import { formatPrice } from "@/features/products/utils/formatPrice";
import { ShippingAddressSummaryCard } from "./ShippingAddressSummaryCard";
import { CheckoutBottomBar } from "./CheckoutBottomBar";
import type { OrderQuote, ShippingAddress } from "../types/checkout.types";

interface ReviewStepProps {
    quote: OrderQuote;
    address: ShippingAddress;
    onEditAddress: () => void;
    onDone: () => void;
    isPlacingOrder?: boolean; // True only for Cash on Delivery
}

export function ReviewStep({ quote, address, onEditAddress, onDone, isPlacingOrder }: ReviewStepProps) {
    const { t } = useTranslation();

    return (
        <div className="space-y-4 pb-28">

            {/* Shipping summary */}
            <ShippingAddressSummaryCard address={address} onEdit={onEditAddress} />

            {/* Order summary */}
            <div className="space-y-3 rounded-2xl border border-border
            bg-surface-2/60 p-4 backdrop-blur-lg">

                {/* Title */}
                <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <ClipboardList size={16} className="text-accent-admin" />
                    {t('checkout.orderSummary', 'Order Summary') }
                </h2>

                {/* Products */}
                <div className="space-y-3">
                    {quote.items.map((item) => (
                        <div key={item.productId} className="flex items-center gap-3">
                            
                            {/* Image product */}
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface">
                                {item.image 
                                    && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                }
                            </div>

                            {/* Name and quantity */}
                            <div className="min-w-0 flex-1">

                                <p className="truncate text-sm font-medium text-ink">
                                    {item.name}
                                </p>

                                <p className="text-xs text-muted">
                                    {t('cart.quantityShort', 'Qty')} {item.quantity}
                                </p>
                            </div>

                            {/* Price */}
                            <p className="shrink-0 text-sm font-medium text-ink">
                                {formatPrice(item.totalPrice).full}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Subtotal, shipping and taxes */}
                <div className="space-y-1.5 border-t border-border pt-3 text-sm">

                    {/* Subtotal */}
                    <div className="flex justify-between text-muted">

                        <span>{t('cart.subtotal')}</span>
                        <span>{formatPrice(quote.subtotal).full}</span>

                    </div>

                    {/* Shipping */}
                    <div className="flex justify-between text-muted">
                        <span>{t('checkout.shipping', 'Shipping')}</span>

                        <span
                            className={quote.shipping === 0 ? 'font-medium text-[var(--success)]' : undefined}
                        >
                            {quote.shipping === 0 ? t('checkout.free', 'Free') : formatPrice(quote.shipping).full}
                        </span>
                    </div>

                    {/* Taxes */}
                    <div className="flex justify-between text-muted">
                        <span>{t('checkout.tax', 'Tax')}</span>
                        <span>{formatPrice(quote.tax).full}</span>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between border-t border-border pt-2 font-semibold text-ink">
                        <span>{t('checkout.total', 'Total')}</span>
                        <span>{formatPrice(quote.total).full}</span>
                    </div>

                </div>
            </div>    
                
            <CheckoutBottomBar 
                total={quote.total}
                currency={quote.currency}
                actionLabel={isPlacingOrder ? t('checkout.placingOrder', 'Placing order...') : t('checkout.placeOrder', 'Place Order') }
                onAction={onDone}
                disabled={isPlacingOrder}
            />
        </div>
    );
}


