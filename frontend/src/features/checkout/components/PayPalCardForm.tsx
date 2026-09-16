import { useRef } from 'react';
import { PayPalCardFieldsProvider, PayPalCardFieldsForm, usePayPalCardFields } from '@paypal/react-paypal-js';
import { useTranslation } from 'react-i18next';
import { useCreatePaymentIntent, useCapturePayment } from '../hooks/usePayments';
import type { PaymentMethodComponentProps } from '../config/paymentMethods.config';

function SubmitButton({ order, onSuccess }: PaymentMethodComponentProps) {
    const { cardFieldsForm } = usePayPalCardFields();
    const { t } = useTranslation();
    const captureKey = useRef(crypto.randomUUID()).current;
    const captureIntent = useCapturePayment();

    async function handleSubmit() {
        await cardFieldsForm?.submit(); // validates and tokenizes the card
        // raw card data never touches our server

        await captureIntent.mutateAsync({
            orderId: order.orderId,
            method: 'paypal',
            trackingId: order.trackingId,
            idempotencyKey: captureKey,
        });

        onSuccess();
    }

    return (
        <div className="space-y-2">
            <button
                onClick={handleSubmit}
                disabled={captureIntent.isPending}
                className="w-full rounded-full bg-accent-admin py-3
                text-sm font-semibold text-white disabled:opacity-50"
            >
                {captureIntent.isPending ? t('checkout.processing', 'Processing...') : t('checkout.payWithCard')}
            </button>

            {captureIntent.isError && <p className="text-xs text-danger">{t('checkout.cardError', "Couldn't charge that card. Please try again.")}</p>}
        </div>
    );
}

// Credit card form
export function PayPalCardForm({ order, onSuccess }: PaymentMethodComponentProps) {
    const createKey = useRef(crypto.randomUUID()).current;
    const createIntent = useCreatePaymentIntent();

    return (
        <PayPalCardFieldsProvider 
            createOrder={async () => {
                const result = await createIntent.mutateAsync({
                    orderId: order.orderId,
                    method: 'paypal',
                    trackingId: order.trackingId,
                    idempotencyKey: createKey,
                })

                return result.providerReference;
            }}
            onApprove={() => {}} // This flow already runs inside SubmitButton
            onError={(err) => console.error('Paypal CardFields error:', err)} // Same, this is just a callback if SubmitButton doesn't handled error
        >
            <PayPalCardFieldsForm />

            {/* Our own custom button to capture the payment */}
            <SubmitButton order={order} onSuccess={onSuccess} />

        </PayPalCardFieldsProvider>
    );
}