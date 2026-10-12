import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { formatPrice } from '@/features/products/utils/formatPrice';
import { Pagination } from '@/features/products/components/Pagination/Pagination';

export const ProfileOrdersPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [page, setpage] = useState(1);
    const { data, isLoading, isFetching } = useOrders(page);
    const canGoBack = (window.history.state?.idx ?? 0) > 0;

    return (
        <div className="mx-auto max-w-2xl space-y-6 px-4 pb-24 pt-6 md:pb-6 md:pt-32">

            {canGoBack && (
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-muted hover:text-ink">
                    <ArrowLeft size={16} /> {t('common.back', 'Back')}
                </button>
            )}

            <h1 className="text-lg font-semibold text-ink">
                {t('profile.orderHistory', 'Order history')}
            </h1>

            {isLoading ? (
                <p className="text-sm text-muted">
                    {t('profile.loading', 'Loading...')}
                </p>
            ) : data && data.orders.length === 0 ? (
                <p className="text-sm text-muted">
                    {t('profile.noOrders', "You haven't placed any orders yet.")}
                </p>
            ) : (
                <>
                    <div className="space-y-2">
                        {data?.orders.map((o) => (
                            <div key={o.id} className="flex justify-between rounded-2xl border border-border bg-surface-2/60 p-4
                            text-sm backdrop-blur-lg">
                                <span className="text-ink">{o.order_number}</span>
                                <span className="text-muted">{o.order_status}</span>
                                <span className="font-semibold text-ink">{formatPrice(o.total).full}</span>
                            </div>
                        ))}
                    </div>

                    {/* Only shown when there's actually more than one page */}
                    {data && data.meta.totalPages > 1 && (
                        <Pagination 
                            onPageChange={(page) => setpage(page)}
                            page={page}
                            totalPages={data.meta.totalPages}
                        />
                    )}
                </>
            )}
        </div>
    );
}