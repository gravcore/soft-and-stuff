import { useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from "lucide-react";
import { StepIndicator } from '../components/StepIndicator';
import { ShippingStep } from '../components/ShippingStep';
import { PaymentStep } from "../components/PaymentStep";
import { ReviewStep } from "../components/ReviewStep";
import { useConfirmCod } from "../hooks/usePayments";
import { PAYMENT_METHODS } from "../config/paymentMethods.config";
import type { ShippingAddress, OrderResult, OrderQuote } from "../types/checkout.types";
import { useQuote, useSubmitCheckout, useUpdateShippingAddress } from "../hooks/useCheckout";

type Step = 'shipping' | 'payment' | 'review';

export const CheckoutPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [step, setStep] = useState<Step>('shipping');
    const [returnStep, setReturnStep] = useState<Step>('payment'); // which step "Edit" was opened from, so saving returns there instead of always forward
    const [order, setorder] = useState<OrderResult | null>(null); // real order created once
    const [address, setaddress] = useState<ShippingAddress | null>(null);
    const [quote, setquote] = useState<OrderQuote | null>(null);

    // Defaults to card as payment method
    const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHODS[0].id);
    const [placeOrderError, setPlaceOrderError] = useState(false);

    // Stable double-tap/network-retry safe by idempotency key that never changes as long as this page is mounted
    const [checkoutIdempotencyKey] = useState(() => crypto.randomUUID());

    // Different idempotencyKey because is other task editing
    const [editIdempotencyKey, setEditIdempotencyKey] = useState<string | null>(null);

    // Stable for the whole page idempotency key, COD only ever gets confimed once, one only submission to protect
    const [codeIdempotencyKey] = useState(() => crypto.randomUUID());

    const quoteMutation = useQuote();
    const checkoutMutation = useSubmitCheckout();
    const updateAddressMutation = useUpdateShippingAddress();
    const confirmCodMutation = useConfirmCod();

    // Edit a shipping address
    async function handleShippingContinue(newAddress: ShippingAddress) {
        try {
            if (order) { // Already placed order address edit
                const totals = await updateAddressMutation.mutateAsync({
                    orderId: order.orderId,
                    address: newAddress,
                    trackingId: order.trackingId,
                    idempotencyKey: editIdempotencyKey!, // safe, only reachable via handleEditAddress, which always sets this first
                });

                setaddress(newAddress);
                setquote((prev) => (prev ? { ...prev, ...totals } : prev)); // items/subtotal carry over unchanged, only tax/shipping/total shift with a new address
                setStep(returnStep);
            } else {
                const q = await quoteMutation.mutateAsync(newAddress);
                const result = await checkoutMutation.mutateAsync({
                    address: newAddress,
                    idempotencyKey: checkoutIdempotencyKey,
                });

                setaddress(newAddress);
                setquote(q);
                setorder(result);
                setStep('payment');
            }
        } catch {
            // Every mutation's own isError state renders the message below
        }
    }

    function handleEditAddress() {
        setReturnStep(step); // remember whether Edit was opened from Payment or Review
        setEditIdempotencyKey(crypto.randomUUID());
        setStep('shipping');
    }

    // Every payment method ends here
    async function handlePlaceOrder() {
        if (!order) return;
        if (paymentMethod === 'cod') {
            try {
                await confirmCodMutation.mutateAsync({
                    orderId: order.orderId,
                    trackingId: order.trackingId,
                    idempotencyKey: codeIdempotencyKey,
                })
            } catch {
                setPlaceOrderError(true); // Stays on Review page
                return;
            }
        }
        navigate(`/order-confirmation/${order.trackingId}`);
    }

    const isSubmitting = quoteMutation.isPending || checkoutMutation.isPending || updateAddressMutation.isPending;
    const submitError = quoteMutation.isError || checkoutMutation.isError || updateAddressMutation.isError;
    const canGoBack = (window.history.state?.idx ?? 0) > 0;

    return (
        <MotionConfig reducedMotion="user">

            {/* Checkout column */}
            <div className="mx-auto max-w-2xl px-4 pb-32 pt-6 md:pt-16">

                {/* Header row: back button and title side by side */}
                <div className="mb-4 flex items-center gap-3">

                    {canGoBack && (
                        <button
                            onClick={() => navigate(-1)}
                            aria-label={t('checkout.back', 'Back')}
                            className="rounded-full p-2 text-ink transition-colors hover:bg-surface-2"
                        >
                            <ArrowLeft />
                        </button>
                    )}

                    <h1 className="text-base font-semibold text-ink">
                        {t('checkout.title', 'Checkout')}
                    </h1>
                </div>

                {/* Circles and line UI to display which of 3 steps we're on */}
                <StepIndicator current={step} />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                    >
                        {step === 'shipping' && (
                            <>
                                <ShippingStep
                                    onContinue={handleShippingContinue}
                                    isSubmitting={isSubmitting}
                                    initialAddress={address ?? undefined}
                                    isEditing={!!order}
                                />

                                {submitError && (
                                    <p className="mt-3 text-center text-sm
                                    text-danger">
                                        {t('checkout.submitError', 'Something went wrong placing your order. Please try again.')}
                                    </p>
                                )}
                            </>
                        )}

                        {step === 'payment' && order && address && quote && (
                            <PaymentStep
                                order={order}
                                address={address}
                                quote={quote}
                                onEditAddress={handleEditAddress}
                                selected={paymentMethod}
                                onSelect={setPaymentMethod} // fires when a different method is picked
                                onContinue={() => setStep('review')} // advances to the next step, called by whichever method just finished (or "Continue" for COD)
                            />
                        )}

                        {step === 'review' && order && address && quote && (
                            <>
                                <ReviewStep
                                    quote={quote}
                                    address={address}
                                    onEditAddress={handleEditAddress}
                                    onDone={handlePlaceOrder} // the actual final action
                                    isPlacingOrder={confirmCodMutation.isPending} // true only while COD's confirm call is in flight
                                />

                                {placeOrderError && ( // Specifically for a failed COD confirmation
                                    <p className="mt-3 text-center text-sm
                                    text-danger">
                                        {t('checkout.placeOrderError', "Couldn't confirm cash on delivery. Please try again.")}
                                    </p>
                                )}
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </MotionConfig>
    );
}

