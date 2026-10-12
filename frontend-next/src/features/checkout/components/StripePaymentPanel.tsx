import { useEffect, useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/shared/services/stripe';
import { createPaymentIntent } from '../services/paymentsApi';
import type { PaymentMethodComponentProps } from '../config/paymentMethods.config';
import { useTranslation } from 'react-i18next';

function PaymentForm({ onSuccess }: { onSuccess: () => void }) {
    const { t } = useTranslation();
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);

        // Resolves once stripe finishes trying the charge
        const { error } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required',
        });

        if (error) {
            setError(error.message ?? t('checkout.paymentFailed', 'Payment failed'));
            setProcessing(false);
            return;
        }

        onSuccess(); // webhook confirms the order server-side, this just moves the UI forward
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">

            {/* Rounded card */}
            <div className="rounded-2xl border border-border bg-surface p-4 transition-colors 
            focus-within:border-accent-admin/50">
                <PaymentElement />
            </div>

            {/* Print error */}
            <div className={`grid transition-all duration-200 ${error ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <p className="overflow-hidden text-xs text-danger">{error}</p>
            </div>

            <button 
                type="submit"
                disabled={!stripe || processing}
                className="flex w-full items-center justify-center gap-2
                rounded-full bg-accent-admin py-3 text-sm font-semibold
                text-white transition-transform hover:scale-[1.02]
                disabled:opacity-50 disabled:hover:scale-100"
            >
                {processing && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}

                {processing ? t('checkout.processing', 'Processing...') : t('checkout.payNow', 'Pay now')}
            </button>
        </form>
    );
}

export function StripePaymentPanel({ order, onSuccess }: PaymentMethodComponentProps) {
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    useEffect(() => {
        createPaymentIntent(order.orderId, 'stripe').then(setClientSecret);
    }, [order.orderId]);

    if (!clientSecret) {
        return (
            <div className="flex justify-center rounded-2xl border border-border bg-surface p-8">
                <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-border border-t-accent-admin" />
            </div>
        );
    }

    return (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm onSuccess={onSuccess} />
        </Elements>
    );
}