import { useEffect, useMemo, useRef, useState } from 'react';
import {
    PayPalProvider,
    PayPalCardFieldsProvider,
    PayPalCardNumberField,
    PayPalCardExpiryField,
    PayPalCardCvvField,
    PayPalCardNameField,
    usePayPalCardFields,
    usePayPalCardFieldsOneTimePaymentSession,
} from '@paypal/react-paypal-js/sdk-v6';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useCreatePaymentIntent, useCapturePayment } from '../hooks/usePayments';
import type { PaymentMethodComponentProps } from '../config/paymentMethods.config';

const BULLET = '\u2022';
const NBSP = '\u00A0';
const NAME_MAX_SLOTS = 22;
const DEFAULT_CVV_SIZE = 3;
const EXPIRY_GROUPS = [2, 2];
const AMEX_NUMBER_GROUPS = [4, 6, 5];
const DEFAULT_NUMBER_GROUPS = [4, 4, 4, 4];

const ACCEPTED_BRANDS = ['visa', 'mastercard', 'amex'] as const;
type CardBrand = (typeof ACCEPTED_BRANDS)[number];

type FieldName = 'number' | 'expiry' | 'cvv' | 'name';
type FieldState = { isEmpty: boolean; isValid: boolean; isPotentiallyValid: boolean };
type FieldEvent = {
    sender?: string;
    data?: { emittedBy?: string } & Partial<Record<FieldName, FieldState>>;
};
type CardTypeEvent = { data: { cards: { type: string; code?: { size: number } }[] } };

const getSender = (event: FieldEvent) => event.sender ?? event.data?.emittedBy;

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

// Normalizes the type reported by PayPal (for example "visa" or "master-card") to our brands
function toCardBrand(type?: string): CardBrand | null {
    const normalized = (type ?? '').toLowerCase().replace(/[^a-z]/g, '');
    if (normalized.includes('visa')) return 'visa';
    if (normalized.includes('master')) return 'mastercard';
    if (normalized.includes('american') || normalized.includes('amex')) return 'amex';
    return null;
}

// The SDK never exposes the typed value, only the field state, so the preview is a simulation.
// A change event cannot tell typing from deleting, so we step forward and fix it on empty/valid states.
function nextProgress(name: FieldName, previous: number, max: number, field: FieldState) {
    if (field.isEmpty) return 0;
    if (name === 'name') return Math.min(previous + 1, max);
    if (field.isValid || !field.isPotentiallyValid) return max;
    if (previous >= max) return max - 1;
    return Math.min(previous + 1, max - 1);
}

// The PayPal fields live inside an iframe, so CSS variables from the page are not available there.
// We resolve them to real values and pass those to the field style.
function readThemeColors() {
    const styles = getComputedStyle(document.documentElement);
    return {
        ink: styles.getPropertyValue('--ink').trim(),
        muted: styles.getPropertyValue('--muted').trim(),
        surface: styles.getPropertyValue('--surface').trim(),
        danger: styles.getPropertyValue('--danger').trim(),
        fontFamily: getComputedStyle(document.body).fontFamily,
    };
}

function useThemeColors() {
    const [colors, setColors] = useState(readThemeColors);

    useEffect(() => {
        const observer = new MutationObserver(() => setColors(readThemeColors()));
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme', 'class'],
        });
        return () => observer.disconnect();
    }, []);

    return colors;
}

function MaskedSlots({ groups, filled, separator = '' }: { groups: number[]; filled: number; separator?: string }) {
    return (
        <>
            {groups.map((size, groupIndex) => {
                const offset = sum(groups.slice(0, groupIndex));

                return (
                    <span key={groupIndex}>
                        {groupIndex > 0 && <span className="mx-1">{separator}</span>}
                        {Array.from({ length: size }, (_, slot) => (
                            <span
                                key={slot}
                                className={`transition-opacity duration-150 ${offset + slot < filled ? 'opacity-100' : 'opacity-30'}`}
                            >
                                {BULLET}
                            </span>
                        ))}
                    </span>
                );
            })}
        </>
    );
}

function BrandBadge({ brand }: { brand: CardBrand }) {
    if (brand === 'visa') {
        return (
            <span className="inline-flex h-7 min-w-[44px] items-center justify-center rounded-[6px] border border-border bg-white px-2 text-xs font-semibold text-[#1A1F71]">
                VISA
            </span>
        );
    }

    if (brand === 'mastercard') {
        return (
            <span className="inline-flex h-7 items-center justify-center rounded-[6px] border border-border bg-white px-2">
                <svg width="26" height="16" viewBox="0 0 26 16" aria-hidden="true">
                    <circle cx="9" cy="8" r="7" fill="#EB001B" />
                    <circle cx="17" cy="8" r="7" fill="#F79E1B" />
                    <path d="M13 2.4a7 7 0 0 1 0 11.2 7 7 0 0 1 0-11.2z" fill="#FF5F00" />
                </svg>
            </span>
        );
    }

    return (
        <span className="inline-flex h-7 min-w-[44px] items-center justify-center rounded-[6px] border border-[#2E77BC] bg-[#2E77BC] px-2 text-[10px] font-semibold text-white">
            AMEX
        </span>
    );
}

function SubmitButton({ order, onSuccess }: PaymentMethodComponentProps) {
    const { t } = useTranslation();
    const [createKey] = useState(() => crypto.randomUUID());
    const [captureKey] = useState(() => crypto.randomUUID());
    const createIntent = useCreatePaymentIntent();
    const captureIntent = useCapturePayment();

    const { error: cardFieldsError } = usePayPalCardFields();
    const { submit, submitResponse, error: submitError } = usePayPalCardFieldsOneTimePaymentSession();

    useEffect(() => {
        if (!submitResponse) return;

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
                className="w-full rounded-full bg-accent-admin py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
                {isSubmitting ? t('checkout.processing') : t('checkout.payWithCard')}
            </button>

            {(cardFieldsError || submitError || captureIntent.isError) && (
                <p className="text-xs text-danger">{t('checkout.cardError')}</p>
            )}
        </div>
    );
}

// Credit card form
export function PayPalCardForm({ order, onSuccess }: PaymentMethodComponentProps) {
    const { t } = useTranslation();
    const colors = useThemeColors();
    const [isCvvFocused, setIsCvvFocused] = useState(false);
    const [cardBrand, setCardBrand] = useState<CardBrand | null>(null);
    const [cvvSize, setCvvSize] = useState(DEFAULT_CVV_SIZE);
    const [progress, setProgress] = useState<Record<FieldName, number>>({ number: 0, expiry: 0, cvv: 0, name: 0 });

    const numberGroups = cardBrand === 'amex' ? AMEX_NUMBER_GROUPS : DEFAULT_NUMBER_GROUPS;

    const maxByField = useMemo<Record<FieldName, number>>(
        () => ({ number: sum(numberGroups), expiry: sum(EXPIRY_GROUPS), cvv: cvvSize, name: NAME_MAX_SLOTS }),
        [numberGroups, cvvSize],
    );

    // The provider may keep the first callback it receives, so the handler reads the latest limits from a ref
    const maxRef = useRef(maxByField);
    useEffect(() => {
        maxRef.current = maxByField;
    }, [maxByField]);

    const handleFocus = (event: FieldEvent) => {
        if (getSender(event) === 'cvv') setIsCvvFocused(true);
    };

    const handleBlur = (event: FieldEvent) => {
        if (getSender(event) === 'cvv') setIsCvvFocused(false);
    };

    const handleChange = (event: FieldEvent) => {
        const sender = getSender(event) as FieldName | undefined;
        const field = sender ? event.data?.[sender] : undefined;
        if (!sender || !field) return;

        setProgress((previous) => ({
            ...previous,
            [sender]: nextProgress(sender, previous[sender], maxRef.current[sender], field),
        }));
    };

    const handleCardTypeChange = (event: CardTypeEvent) => {
        const cards = event.data.cards;
        const isSingleCard = cards.length === 1;
        setCardBrand(isSingleCard ? toCardBrand(cards[0].type) : null);
        setCvvSize(isSingleCard ? (cards[0].code?.size ?? DEFAULT_CVV_SIZE) : DEFAULT_CVV_SIZE);
    };

    const cardFieldStyle = useMemo(() => {
        const reset = { border: 'none', outline: 'none', boxShadow: 'none' };

        return {
            input: {
                ...reset,
                background: colors.surface,
                color: colors.ink,
                fontSize: '0.875rem',
                fontFamily: colors.fontFamily,
                lineHeight: '1.25rem',
                padding: '0',
                height: '100%',
            },
            'input.focus': { ...reset },
            'input.valid': { ...reset },
            'input.invalid': { ...reset, color: colors.danger },
            '.invalid': { ...reset, color: colors.danger },
            '.invalid.focus': { ...reset },
            'input::placeholder': { color: colors.muted },
        };
    }, [colors]);

    const fieldWrapperClass =
        'relative flex h-12 w-full items-center overflow-hidden rounded-full border border-border bg-surface px-4 transition-colors focus-within:border-accent focus-within:shadow-[0_0_0_3px_rgba(91,95,239,.18)]';

    return (
        <PayPalProvider
            clientId={import.meta.env.VITE_PAYPAL_CLIENT_ID}
            environment={import.meta.env.VITE_PAYPAL_ENVIRONMENT}
            components={['card-fields']}
        >
            <PayPalCardFieldsProvider
                focus={handleFocus}
                blur={handleBlur}
                change={handleChange}
                cardtypechange={handleCardTypeChange}
            >
                <div className="space-y-6">
                    <div className="space-y-1.5">
                        <h2 className="font-display text-lg font-semibold text-ink">
                            {t('checkout.cardPayment')}
                        </h2>
                        <p className="text-sm text-muted">{t('checkout.cardInstructions')}</p>
                    </div>

                    <div className="[perspective:1100px] mx-auto w-full max-w-[380px]">
                        <motion.div
                            className="relative w-full [aspect-ratio:1.586] [transform-style:preserve-3d]"
                            animate={{ rotateY: isCvvFocused ? 180 : 0 }}
                            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                            aria-hidden="true"
                        >
                            <div className="absolute inset-0 flex flex-col justify-between rounded-[var(--radius-md)] bg-accent p-5 text-white [backface-visibility:hidden] [-webkit-backface-visibility:hidden] sm:p-6">
                                <div className="flex items-center justify-between">
                                    <svg width="40" height="30" viewBox="0 0 40 30" aria-hidden="true">
                                        <rect x="1" y="1" width="38" height="28" rx="6" fill="#ffffff" fillOpacity=".22" stroke="#fff" strokeOpacity=".6" />
                                        <path d="M1 10h38M1 20h38M15 1v28" stroke="#fff" strokeOpacity=".5" />
                                    </svg>
                                    {cardBrand && <BrandBadge brand={cardBrand} />}
                                </div>
                                <div className="whitespace-nowrap font-mono text-lg tracking-wider sm:text-2xl">
                                    <MaskedSlots groups={numberGroups} filled={progress.number} separator={NBSP} />
                                </div>
                                <div className="flex items-end justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="text-[10px] uppercase tracking-[0.4em] opacity-70">{t('checkout.cardHolder')}</div>
                                        <div className="mt-1 truncate text-sm font-medium">
                                            {progress.name > 0 ? (
                                                <MaskedSlots groups={[progress.name]} filled={progress.name} />
                                            ) : (
                                                t('checkout.nameOnCard')
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase tracking-[0.4em] opacity-70">{t('checkout.expires')}</div>
                                        <div className="mt-1 font-mono text-sm">
                                            <MaskedSlots groups={EXPIRY_GROUPS} filled={progress.expiry} separator="/" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute inset-0 flex flex-col justify-between rounded-[var(--radius-md)] bg-accent [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)]">
                                <div className="mt-6 h-10 bg-black/70 sm:mt-7 sm:h-11"></div>
                                <div className="px-5 sm:px-6">
                                    <div className="mb-1 text-[10px] uppercase tracking-[0.4em] text-white/70">{t('checkout.securityCode')}</div>
                                    <div className="flex justify-end rounded-[var(--radius-sm)] bg-white px-3 py-2 font-mono text-sm text-ink">
                                        <MaskedSlots groups={[cvvSize]} filled={progress.cvv} />
                                    </div>
                                </div>
                                <div className="h-6"></div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="space-y-3">
                        <div className={fieldWrapperClass}>
                            <div className="h-full w-full [&>div]:h-full [&>div]:w-full">
                                <PayPalCardNumberField
                                    placeholder={t('checkout.cardNumber')}
                                    style={cardFieldStyle}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className={fieldWrapperClass}>
                                <div className="h-full w-full [&>div]:h-full [&>div]:w-full">
                                    <PayPalCardExpiryField
                                        placeholder={t('checkout.monthYear')}
                                        style={cardFieldStyle}
                                    />
                                </div>
                            </div>
                            <div className={fieldWrapperClass}>
                                <div className="h-full w-full [&>div]:h-full [&>div]:w-full">
                                    <PayPalCardCvvField
                                        placeholder={t('checkout.cvv')}
                                        style={cardFieldStyle}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={fieldWrapperClass}>
                            <div className="h-full w-full [&>div]:h-full [&>div]:w-full">
                                <PayPalCardNameField
                                    placeholder={t('checkout.nameOnCard')}
                                    style={cardFieldStyle}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 border-t border-border pt-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-ink">{t('checkout.acceptedCards')}</p>
                            <div className="flex items-center gap-1.5">
                                {ACCEPTED_BRANDS.map((brand) => (
                                    <BrandBadge key={brand} brand={brand} />
                                ))}
                            </div>
                        </div>

                        <ul className="space-y-3 text-sm text-muted">
                            <li className="flex gap-3">
                                <svg className="mt-0.5 shrink-0 text-accent" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <rect x="4" y="10" width="16" height="11" rx="3" />
                                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                                </svg>
                                <span><strong className="font-medium text-ink">{t('checkout.secureConnection')}</strong></span>
                            </li>
                            <li className="flex gap-3">
                                <svg className="mt-0.5 shrink-0 text-accent" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z" />
                                </svg>
                                <span><strong className="font-medium text-ink">{t('checkout.noCardStored')}</strong></span>
                            </li>
                        </ul>

                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                            <span className="text-sm text-muted">{t('checkout.paymentsProcessedBy')}</span>
                            <span className="inline-flex h-7 items-center justify-center rounded-[6px] border border-border bg-white px-2 text-xs font-semibold italic">
                                <span className="text-[#003087]">Pay</span>
                                <span className="text-[#009CDE]">Pal</span>
                            </span>
                        </div>
                        <p className="text-xs text-muted">{t('checkout.pciCompliant')}</p>
                    </div>

                    <SubmitButton order={order} onSuccess={onSuccess} />
                </div>
            </PayPalCardFieldsProvider>
        </PayPalProvider>
    );
}