import { useEffect, useState } from "react";
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from "lucide-react";
import { trackGuestOrder } from "../services/checkoutApi";

// Fetches by trackingId rather than relying on navigation state
export const OrderConfirmationPage = () => {
    const { t } = useTranslation();
    const { trackingId } = useParams();
    const [order, setOrder] = useState<Awaited<ReturnType<typeof trackGuestOrder>> | null>(null);

    useEffect(() => {
        if (trackingId) trackGuestOrder(trackingId).then(setOrder).catch(() => setOrder(null));
    }, [trackingId]);

    return (
        <div className="mx-auto max-w-md space-y-4 px-4 pt-16 text-center md:pt-32">
            <CheckCircle2 size={48} className="mx-auto text-accent"/>

            <h1 className="text-lg font-semibold text-ink">
                {t('checkout.orderPlaced', 'Order placed!')}
            </h1>

            {/* Order number */}
            {order && (
                <p className="text-sm text-muted">
                    {t('checkout.orderNumber')} <strong className="text-ink">{order.orderNumber}</strong>
                </p>
            )}

            {/* Tracking ID */}
            <div className="rounded-2xl border border-border bg-surface-2/60
            p-4 backdrop-blur-lg">
                <p className="text-sm text-muted">{t('checkout.trackingId', 'Your tracking ID:')}</p> 
                <strong className="text-ink">{trackingId}</strong>

                <p className="mt-2 text-sm text-muted">
                    {t('checkout.saveTrackingId', 'Save this - use it below to check your order any time.')}
                </p>
            </div>

            <Link to="/order-status" className="inline-block text-sm font-semibold text-accent">
                {t('checkout.trackOrder', 'Track your order')}
            </Link>
        </div>
    );
};