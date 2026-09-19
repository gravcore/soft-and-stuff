import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAdminOrders } from '../../hooks/useAdminOrders';
import { Pagination } from '@/features/products/components/Pagination/Pagination';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { formatPrice } from '@/features/products/utils/formatPrice';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-amber-500/15 text-amber-600',
    confirmed: 'bg-blue-500/15 text-blue-600',
    shipped: 'bg-indigo-500/15 text-indigo-600',
    delivered: 'bg-green-500/15 text-green-600',
    cancelled: 'bg-danger/15 text-danger',
};

export function AdminOrdersListPage() {
    const { t } = useTranslation();
    const [status, setStatus] = useState('');
    const [search, setSearch] = useState(''); // what's actually sent to the query, only updates on submit
    const debouncedSearch = useDebounce(search, 400);
    const [page, setPage] = useState(1);

    const { data, isLoading } = useAdminOrders({
        status: status || undefined,
        search: debouncedSearch || undefined,
        page,
        limit: 20,
    });

    return (
        <div className="mx-auto max-w-5xl p-6">

            {/* Title */}
            <h1 className="text-xl font-semibold text-ink">
                {t('admin.orders.title', 'Orders')}
            </h1>

            {/* Filters row */}
            <div className="mt-4 flex flex-wrap items-center gap-3">

                {/* Search box */}
                <div className="relative">

                    <Search size={16} className="absolute left-3 top-1/2
                    -translate-y-1/2 text-muted" />

                    <input 
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder={t('admin.orders.searchPlaceholder', 'Order number or email')}
                        className="rounded-full border border-border py-2 pl-9 pr-3 text-sm"
                    />
                </div>

                {/* Status Filter */}
                <select
                    value={status}
                    onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                    className="rounded-full border border-border px-3 py-2 text-sm"
                >
                    <option value="">{t('admin.orders.allStatuses', 'All statuses')}</option>

                    {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
            </div>

            {/* Orders list */}
            <div className="mt-6 divide-y divide-border rounded-2xl border border-border">

                {isLoading && !data ? (
                    <p className="p-6 text-sm text-muted">{t('admin.orders.loading', 'Loading...')}</p>
                ) : data?.orders.length === 0 ? (
                    <p className="p-6 text-sm text-muted">
                        {t('admin.orders.empty', 'No orders match these filters.')}
                    </p>
                ) : (

                    // There's data case, one clickable row per order, linking to its detail page
                    data?.orders.map((o) => (
                        <Link
                            key={o.id}
                            to={`/admin/orders/${o.id}`}
                            className="flex items-center justify-between gap-4 p-4
                            text-sm hover:bg-surface-2"
                        >
                            <div>
                                <p className="font-medium text-ink">{o.order_number}</p>
                                <p className="text-muted">{o.guest_email ?? o.user_email ?? t('admin.orders.registeredCustomer', 'Registered customer')}</p>
                            </div>

                            {/* Date created at */}
                            <span className="text-muted">{new Date(o.created_at).toLocaleDateString()}</span>

                            {/* Total */}
                            <span className="font-medium text-ink">{(formatPrice(o.total, true, navigator.language, o.currency).full)}</span>

                            <span className={`rounded-full px-2 py-0.5 text-[0.6875rem] font-medium
                                ${STATUS_STYLES[o.order_status] ?? ''}`}>
                                {o.order_status}
                            </span>
                        </Link>
                    ))
                )}
            </div>

            {/* Pagination */}
            {data && data.meta.totalPages > 1 && (
                <div className="mt-4">
                    <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />
                </div>
            )}
        </div>
    );
}