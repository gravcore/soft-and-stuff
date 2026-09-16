import type { ShippingAddress } from "@/features/checkout/types/checkout.types";
import { MapPin, Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ShippingAddressSummaryCardProps {
    address: ShippingAddress;
    onEdit: () => void;
}

export function ShippingAddressSummaryCard({ address, onEdit }: ShippingAddressSummaryCardProps) {
    const { t } = useTranslation(); 

    return (
        <div className="rounded-2xl border border-border bg-surface-2/60
        p-4 backdrop-blur-lg">

            {/* Address title */}
            <div className="mb-3 flex items-center justify-center">

                <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <MapPin size={16} className="text-accent-admin" />
                    {t('checkout.shippingAddress', 'Shipping Address')}
                </div>

                <button 
                    type="button" 
                    onClick={onEdit}
                    className="flex items-center gap-1 text-xs font-medium text-accent-admin hover:underline"
                >
                    <Pencil size={12} />
                    {t('checkout.edit', 'Edit')}
                </button>
            </div>

            {/* Address summary */}
            <div className="space-y-0.5 text-sm text-ink">
                <p className="font-medium">{address.fullName}</p>

                <p className="text-muted">
                    {address.line1}{address.line2 ? `, ${address.line2}` : ''}
                </p>

                <p className="text-muted">
                    {[address.city, address.state, address.zip].filter(Boolean).join(', ')}
                </p>

                <p className="text-muted">{address.country}</p>

                {address.phone && <p className="pt-1 text-muted">{address.phone}</p>}
            </div>
        </div>
    );
}