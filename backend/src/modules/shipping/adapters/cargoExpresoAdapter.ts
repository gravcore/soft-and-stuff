import { zoneFor } from '../data/gtCoverage';
import type { ShippingProvider } from '../shipping.types';

const ZONE_PRICE_GTQ: Record<string, number> = {
    metro: 25,
    departamental: 55,
    especial: 90,
};

export const cargoExpresoAdapter: ShippingProvider = {
    async getRates(address) {
        const zone = zoneFor(address.city);
        if (!zone) throw new Error('CARGO_EXPRESO_NO_COVERAGE');
        return [{
            carrier: 'Cargo Expreso',
            service: 'Estándar',
            price: ZONE_PRICE_GTQ[zone] * 100, deliverDays: zone === 'metro' ? 1 : 2, currency: 'GTQ',
        }];
    },

    async createLabel(address, rate, codAmount) {
        const reference = [
            address.coordinates && `https://maps.google.com/?q=${address.coordinates.lat},${address.coordinates.lng}`,
            address.coordinates && `https://waze.com/ul?ll=${address.coordinates.lat},${address.coordinates.lng}`,
            address.reference,
        ].filter(Boolean).join(' | ');

        return { trackingUrl: '', labelId: '' };
    },
};