import { useState } from "react";
import { useTranslation } from "react-i18next"
import { trackGuestOrder } from "../services/checkoutApi";
import { FormField } from "@/shared/components/FormField/FormField";
import { Package } from "lucide-react";

export const OrderStatusPage = () => {
    const { t } = useTranslation();
    const [trackingId, setTrackingId] = useState('');
    const [order, setOrder] = useState<Awaited<ReturnType<typeof trackGuestOrder>> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLookup = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            setOrder(await trackGuestOrder(trackingId.trim().toUpperCase()));
        } catch {
            setError(t('checkout.orderNotFound', 'Order not found. Check the tracking ID and try again.'))
        } finally {
            setLoading(false);
        }
    };

   return (
        <div className="mx-auto max-w-md space-y-4 px-4 pt-16">

            <h1 className="text-lg font-semibold text-ink">
                {t('checkout.trackYourOrder', 'Track your order')}
            </h1>

            <form onSubmit={handleLookup} className="flex gap-2">
                <FormField
                    label={t('checkout.yourTrackingId', 'Tracking ID')}
                    icon={Package}
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder={t('checkout.trackingIdPlaceholder', 'ORD-A3F8B2C1')}
                    required
                    className="flex-1"
                />

                <button type="submit" className="rounded-xl bg-accent-admin px-4 text-sm font-semibold text-white disabled:opacity">
                    {loading ? t('checkout.lookingUp', 'Looking up...') : t('checkout.trackButton', 'Track order')}
                </button>
            </form>

            {error && <p className="text-sm text-danger">{error}</p>}

            {order && (
                <div className="rounded-2xl border border-border bg-surface-2/60
                backdrop-blur-lg">

                    <p className="text-sm text-ink">{t('checkout.orderNumbered', 'Order number:')} <strong>{order.orderNumber}</strong></p>

                    <p className="text-sm text-muted">
                        {t('checkout.status', 'Status:')} <strong className="text-ink">{order.status}</strong>
                    </p>
                </div>
            )}
        </div>
   );
};