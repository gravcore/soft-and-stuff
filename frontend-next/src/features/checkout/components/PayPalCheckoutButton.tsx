import { useRef } from 'react';
import { PayPalProvider, PayPalOneTimePaymentButton, type OnErrorData } from '@paypal/react-paypal-js/sdk-v6';
import { useTranslation } from 'react-i18next';
import { useCreatePaymentIntent, useCapturePayment } from '../hooks/usePayments';
import type { PaymentMethodComponentProps } from '../config/paymentMethods.config';

export function PayPalCheckoutButton({ order, onSuccess }: PaymentMethodComponentProps) {
    const { t } = useTranslation();

    // Two separate keys, for create order and to capture payment
    const createKey = useRef(crypto.randomUUID()).current;
    const captureKey = useRef(crypto.randomUUID()).current;
    const createIntent = useCreatePaymentIntent();
    const captureIntent = useCapturePayment();

    return (
        <div className="space-y-2">
            <PayPalProvider
                clientId={import.meta.env.VITE_PAYPAL_CLIENT_ID}
                environment={import.meta.env.VITE_PAYPAL_ENVIRONMENT}
                components={['paypal-payments']}
            >
                <PayPalOneTimePaymentButton
                    presentationMode="auto"
                    createOrder={async () => {
                        const result = await createIntent.mutateAsync({
                            orderId: order.orderId,
                            method: 'paypal',
                            trackingId: order.trackingId,
                            idempotencyKey: createKey,
                        });

                        return { orderId: result.providerReference };
                    }}
                    onApprove={async () => {
                        await captureIntent.mutateAsync({
                            orderId: order.orderId,
                            method: 'paypal',
                            trackingId: order.trackingId,
                            idempotencyKey: captureKey,
                        });

                        onSuccess();
                    }}
                    onError={(error: OnErrorData) => {
                        if (import.meta.env.VITE_ENVIRONMENT === 'development') {
                            console.error('PayPal payment error:', error.message);
                        }
                    }}
                />
            </PayPalProvider>

            {(createIntent.isError || captureIntent.isError) && (
                <p className="text-xs text-danger">
                    {t('checkout.paypalError', 'Something went wrong with PayPal. Please try again.')}
                </p>
            )}
        </div>
    );
}