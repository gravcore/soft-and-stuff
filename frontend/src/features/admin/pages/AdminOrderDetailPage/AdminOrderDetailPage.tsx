import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAdminOrder, useUpdateOrderStatus } from "../../hooks/useAdminOrders";
import { formatPrice } from "@/features/products/utils/formatPrice";

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export function AdminOrderDetailPage() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string}>();
    const { data: order, isLoading } = useAdminOrder(id ?? '');
    const updateStatus = useUpdateOrderStatus();
    const canGoBack = (window.history.state.idx ?? 0) > 0;
    const navigate = useNavigate();

    if (isLoading) return <p className="p-6 text-sm text-muted">
        {t('admin.orders.loading', 'Loading...')}
    </p>;

    if (!order) return <p className="p-6 text-sm text-muted">
        {t('admin.orders.notFound', 'Order not found')}
    </p>

    const handleStatusChange = (nextStatus: string) => {
        if (nextStatus === 'cancelled' && !window.confirm(t('admin.orders.confirmCancel', 'Cancel this order?'))) return;

        updateStatus.mutate({ id: order.id, status: nextStatus });
    };

    const { shipping_address: addr } = order;

    return (
        <div className="mx-auto max-w-3xl p-6">

            {/* Back link */}
            {canGoBack && (
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1 text-sm text-muted hover:text-ink"
                >
                    <ArrowLeft size={16} /> {t('common.back', 'Back')}
                </button>
            )}

            {/* Header: order number/date on the left, status control on the right */}
            <div className="mt-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-ink">
                        {order.order_number}
                    </h1>

                    <p className="text-sm text-muted">
                        {new Date(order.created_at).toLocaleString()}
                    </p>
                </div>

                <select
                    value={order.order_status}
                    disabled={updateStatus.isPending}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="rounded-full border border-border px-3
                    py-2 text-sm disabled:opacity-50"
                >
                    {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
            </div>

            {/* 2 Column info block: customer/shipping on the left, payment/notes on the right */}
            <div className="mt-6 grid gap-6 sm:grid-cols-2">

                {/* Left column */}
                <section>
                    <h2 className="text-sm font-semibold text-ink">
                        {t('admin.orders.customer', 'Customer')}
                    </h2>

                    <p className="mt-1 text-sm text-muted">
                        {order.guest_email ?? order.user_email ?? t('admin.orders.registeredCustomer')}
                    </p>

                    <h2 className="mt-4 text-sm font-semibold text-ink">
                        {t('admin.orders.shipTo', 'Ship to')}
                    </h2>

                    <address className="mt-1 text-sm not-italic text-muted">
                        {addr.fullName}<br />
                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                        {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.zip ?? ''}<br />
                        {addr.country}
                        {addr.phone && <><br />{addr.phone}</>}
                    </address>
                </section>

                {/* Right column */}
                <section>
                    <h2 className="text-sm font-semibold text-ink">
                        {t('admin.orders.payment', 'Payment')}
                    </h2>

                    <p className="mt-1 text-sm text-muted">
                        {order.payment_provider ?? t('admin.orders.noPaymentYet', 'No payment method attached yet')}

                        {order.payment_status && ` · ${order.payment_status}`}
                    </p>

                    {order.notes && (
                        <>
                            <h2 className="mt-4 text-sm font-semibold text-ink">
                                {t('admin.orders.notes', 'Notes')}
                            </h2>

                            <p className="mt-1 text-sm text-muted">
                                {order.notes}
                            </p>
                        </>
                    )}
                </section>
            </div>

            {/* Line items table */}
            <h2 className="mt-6 text-sm font-semibold text-ink">
                {t('admin.orders.items', 'Items')}
            </h2>

            <div className="mt-2 divide-y divide-border rounded-2xl border border-border text-sm">
                {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3">

                        <div>
                            <p className="text-ink">{item.product_name}</p>

                            {item.product_sku && <p className="text-xs text-muted">SKU {item.product_sku}</p>}
                        </div>

                        <p className="text-muted">{item.quantity} × {formatPrice(item.unit_price, true, navigator.language, order.currency).full}</p>
                        
                        <p className="font-medium text-ink">{formatPrice(item.total_price, true, navigator.language, order.currency).full}</p>
                    </div>
                ))}
            </div>

            {/* Grand total */}
            <p className="mt-2 text-right text-sm font-semibold text-ink">
                {t('admin.orders.total', 'Total')}: {formatPrice(order.total, true, navigator.language, order.currency).full}
            </p>
        </div>
    );
}