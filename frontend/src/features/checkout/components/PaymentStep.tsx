import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { PAYMENT_METHODS } from '../config/paymentMethods.config';
import { ShippingAddressSummaryCard } from './ShippingAddressSummaryCard';
import { CheckoutBottomBar } from './CheckoutBottomBar';
import type { OrderResult, ShippingAddress, OrderQuote } from '../types/checkout.types';

interface PaymentStepProps {
    order: OrderResult;
    address: ShippingAddress;
    quote: OrderQuote;
    onEditAddress: () => void;
    selected: string | null;
    onSelect: (methodId: string) => void;
    onContinue: () => void;
}

export function PaymentStep({ order, address, quote, onEditAddress, selected, onSelect, onContinue }: PaymentStepProps) {
    const { t } = useTranslation();
    const active = PAYMENT_METHODS.find((m) => m.id === selected);

    return (
        <div className="space-y-4 pb-28">

            <ShippingAddressSummaryCard address={address} onEdit={onEditAddress} />

            <div className="space-y-3">

                <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
                    {t('checkout.paymentMethod', 'Payment Method')}
                </h2>

                {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => {
                    const isSelected = selected === id;

                    return (
                        <button
                            key={id}
                            onClick={() => onSelect(id)}
                            className={`flex w-full items-center justify-between
                                rounded-2xl border p-4 backdrop-blur-lg
                                transition-colors ${
                                    isSelected ? 'border-accent-admin' : 'border-border'
                                }`}
                        >
                            {/* Icon and text */}
                            <span className="flex items-center gap-3 text-sm
                            font-medium text-ink">
                                <Icon size={20} />
                                {t(label)}
                            </span>

                            {/* Radio dot icon to show which is selected */}
                            <span 
                                className="flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors"
                                style={{ borderColor: isSelected ? 'var(--accent-admin)' : 'var(--color-border)' }}
                            >
                                {isSelected && (
                                    <motion.span
                                        layoutId="payment-method-dot"
                                        className="h-2.5 w-2.5 rounded-full bg-accent-admin"
                                    />                                
                                )}
                            </span>
                        </button>
                    );
                })}

                {active?.Component && <active.Component order={order} onSuccess={onContinue} />}
            </div>

            <CheckoutBottomBar 
                total={quote.total} 
                currency={quote.currency} 
                actionLabel={!active?.Component ? t('checkout.continue', 'Continue') : undefined}
                onAction={!active?.Component ? onContinue : undefined}
                disabled={!selected}
            />
        </div>
    );
}

