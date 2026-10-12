import { useEffect, useState } from 'react';
import { 
    PayPalProvider, 
    PayPalCardFieldsProvider, 
    PayPalCardNumberField,
    PayPalCardExpiryField,
    PayPalCardCvvField,
    usePayPalCardFields,
    usePayPalCardFieldsOneTimePaymentSession,
} from '@paypal/react-paypal-js/sdk-v6';
import { useTranslation } from 'react-i18next';
import { useCreatePaymentIntent, useCapturePayment } from '../hooks/usePayments';
import type { PaymentMethodComponentProps } from '../config/paymentMethods.config';

function SubmitButton({ order, onSuccess }: PaymentMethodComponentProps) {
    const { t } = useTranslation();
    const [createKey] = useState(() => crypto.randomUUID());
    const [captureKey] = useState(() => crypto.randomUUID());
    const createIntent = useCreatePaymentIntent();
    const captureIntent = useCapturePayment();

    const { error: cardFieldsError } = usePayPalCardFields();
    const { submit, submitResponse, error: submitError } = usePayPalCardFieldsOneTimePaymentSession();

    useEffect(() => {
        if (!submitResponse) return; // Nobody pressed pay yet

        if (submitResponse.state === 'succeeded') {
            
            captureIntent.mutateAsync({
                orderId: order.orderId,
                method: 'paypal',
                trackingId: order.trackingId,
                idempotencyKey: captureKey,
            }).then(onSuccess);
        }
    }, [captureIntent, captureKey, onSuccess, order.orderId, order.trackingId, submitResponse]);

    async function handleSubmit() {
        
        const result = await createIntent.mutateAsync({
            orderId: order.orderId,
            method: 'paypal',
            trackingId: order.trackingId,
            idempotencyKey: createKey,
        });

        await submit(result.providerReference);
    }

    const isSubmitting = createIntent.isPending || captureIntent.isPending;

    return (
        <div className="space-y-2">
            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full rounded-full bg-accent-admin py-3
                text-sm font-semibold text-white disabled:opacity-50"
            >
                {isSubmitting ? t('checkout.processing', 'Processing...') : t('checkout.payWithCard')}
            </button>

            {(cardFieldsError || submitError || captureIntent.isError) && <p className="text-xs text-danger">{t('checkout.cardError', "Couldn't charge that card. Please try again.")}</p>}
        </div>
    );
}

// Credit card form
export function PayPalCardForm({ order, onSuccess }: PaymentMethodComponentProps) {
    const { t } = useTranslation();
    
    return (
        <PayPalProvider 
            clientId={import.meta.env.VITE_PAYPAL_CLIENT_ID}
            environment={import.meta.env.VITE_PAYPAL_ENVIRONMENT}
            components={['card-fields']}
        >
            <PayPalCardFieldsProvider>
                <PayPalCardNumberField placeholder={t('checkout.cardNumber', 'Card number')} />
                <PayPalCardExpiryField placeholder={t('checkout.monthYear', 'MM/YY')} />
                <PayPalCardCvvField placeholder={t('checkout.cvv', 'CVV')} />

                {/* Our own custom button to capture the payment */}
                <SubmitButton order={order} onSuccess={onSuccess} />

            </PayPalCardFieldsProvider>
        </PayPalProvider>
    );
}