import type { ComponentType } from "react";
import { Banknote, Wallet, CreditCard } from "lucide-react";
import { PayPalCheckoutButton } from '../components/PayPalCheckoutButton';
import { PayPalCardForm } from '../components/PayPalCardForm';
import type { OrderResult } from "../types/checkout.types";
import { StripePaymentPanel } from "../components/StripePaymentPanel";

const STRIPE_ENABLED = import.meta.env.VITE_STRIPE_ENABLED === 'true';

export interface PaymentMethodComponentProps {
    order: OrderResult;
    onSuccess: () => void;
}

export interface PaymentMethodConfig {
    id: string;
    label: string;
    icon: ComponentType<{ className?: string; size?: number }>;
    Component?: ComponentType<PaymentMethodComponentProps>;
}

export const PAYMENT_METHODS: PaymentMethodConfig[] = [
    { id: 'card', label: 'checkout.card', icon: CreditCard, Component: PayPalCardForm },
    { id: 'paypal', label: 'checkout.paypal', icon: Wallet, Component: PayPalCheckoutButton },
    { id: 'cod', label: 'checkout.cod', icon: Banknote },
    ...(STRIPE_ENABLED ? [
        { id: 'stripe', label: 'checkout.cardStripe', icon: CreditCard, Component: StripePaymentPanel },
    ] : []),
]