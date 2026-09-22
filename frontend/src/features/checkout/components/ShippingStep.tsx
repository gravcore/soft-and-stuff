import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { shippingAddressSchema, type ShippingAddressInput } from "../schema/orders.schema";
import { useState } from "react";
import { FormField } from "@/shared/components/FormField/FormField";
import { Mail, MapPin, Phone, User } from "lucide-react";
import type { ShippingAddress } from "../types/checkout.types";
import { LocationPicker } from "./LocationPicker";
import { AsYouType } from 'libphonenumber-js';

interface ShippingStepProps {
    onContinue: (address: ShippingAddress) => void;
    isSubmitting?: boolean;
    initialAddress?: ShippingAddress;
    isEditing?: boolean;
}

export function ShippingStep({ onContinue, isSubmitting, initialAddress, isEditing }: ShippingStepProps) {
    const { t } = useTranslation();
    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(shippingAddressSchema),
        defaultValues: initialAddress,
    });

    const [location, setLocation] = useState<Partial<ShippingAddress>>(initialAddress ?? {});

    const onSubmit = (form: ShippingAddressInput) => {
        onContinue({ ...form, city: location.city ?? '', state: location.state, country: location.country ?? 'GT',
            zip: location.zip, reference: location.reference, coordinates: location.coordinates
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4
        rounded-2xl border border-border bg-surface-2/60 p-4 backdrop-blur-lg">
            <FormField label={t('checkout.fullName', 'Full name')}
            icon={User} error={errors.fullName} { ...register('fullName') } placeholder={t('checkout.fullNamePlaceholder')} />
            
            <FormField label={t('checkout.email', 'Email')} type="email" placeholder={t('checkout.emailPlaceholder')}
            icon={Mail} error={errors.email} { ...register('email') } />

            <FormField label={t('checkout.phone', 'Phone')} placeholder={t('checkout.phonePlaceholder')}
            icon={Phone} error={errors.phone} { ...register('phone', { 
                onChange: (e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    e.target.value = new AsYouType().input(`+${digits}`);
                }
            })} type="tel" />

            <LocationPicker onAddressResolved={(partial) => setLocation((prev) => ({ ...prev, ...partial }))} />

            <FormField label={t('checkout.line1', 'Address line 1')}
            placeholder={t('checkout.addressLine1Placeholder')}
            icon={MapPin} error={errors.line1} { ...register('line1') } />

            <FormField label={t('checkout.reference', 'Detailed address and reference (house color, door color, etc)')}
            placeholder={t('checkout.referencePlaceholder', 'e.g. 15th Av. 2nd Street ... Green house')}
            icon={MapPin} error={errors.line2} { ...register('line2') } />

            <FormField label={t('checkout.zip', 'Postal code (optional)')}
            placeholder={t('checkout.zipPlaceholder', 'e.g. 01001')}
            icon={MapPin} error={errors.line2} { ...register('zip') } />

            <button
                type="submit" 
                disabled={isSubmitting}
                className="w-full rounded-full bg-accent-admin py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
                {isSubmitting 
                    ? (isEditing ? t('checkout.savingAddress', 'Saving...') : t('checkout.placingOrder', 'Placing order...'))
                    : (isEditing ? t('checkout.saveAddress', 'Save address') : t('checkout.continueToPayment', 'Continue to Payment'))
                }
            </button>
        </form>
    );
}