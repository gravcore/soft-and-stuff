import { ShippingAddress } from "../orders/orders.types";

export interface ShippingRate {
    carrier: string;
    service: string;
    price: number;
    deliverDays: number;
    currency: string;
    providerShipmentId?: string;
    providerRateId?: string;
}

export interface ShippingProvider {
    getRates(address: ShippingAddress, parcel: { weightOz: number }): Promise<ShippingRate[]>;
    createLabel(address: ShippingAddress, rate: ShippingRate, codAmount?: number): Promise<{ trackingUrl: string; labelId: string }>;
}