import { Shippo } from 'shippo';
import type { ShippingProvider } from '../shipping.types';
import { env } from '@/config/env';
import { AppError } from '@/shared/errors/AppError';

const shippo = new Shippo({ apiKeyHeader: env.SHIPPO_API_KEY! });

export const shippoAdapter: ShippingProvider = {

    async getRates(address, parcel) {
        const shipment = await shippo.shipments.create({
            addressFrom: JSON.stringify(env.WAREHOUSE_ADDRESS_JSON),
            addressTo: address,
            parcels: [{
                weight: String(parcel.weightOz),
                massUnit: 'oz',
                length: '10',
                width: '10',
                height: '10',
                distanceUnit: 'in'
            }],
            async: false,
        });

        return shipment.rates.map((r) => ({
            carrier: r.provider,
            service: r.servicelevel.name ?? 'Unknown',
            price: Math.round(parseFloat(r.amount) * 100),
            deliverDays: r.estimatedDays ?? 5,
            currency: r.currency,
            providerRateId: r.objectId,
        }))
        .sort((a, b) => a.deliverDays - b.deliverDays);
    },

    async createLabel(address, rate) {
        if (!rate.providerRateId) { // happens if createLabel is called with a reate that never came from this adapter's own getRates
            throw new AppError('Rate was not quoted by getRates', 400, 'SHIPPO_MISSING_RATE_REFERENCE');
        }

        const transaction = await shippo.transactions.create({
            rate: rate.providerRateId,
            labelFileType: 'PDF',
            async: false,
        });

        if (transaction.status !== 'SUCCESS') {
            throw new AppError(`${transaction.messages?.map((m) => m.text).join(', ')}`, 400, 'SHIPPO_LABEL_FAILED');
        }

        if (!transaction.trackingUrlProvider || !transaction.labelUrl) {
            throw new AppError(
                'Shippo did not return the tracking URL or label URL',
                500,
                'SHIPPO_MISSING_LABEL_DATE'
            );
        }

        return {
            trackingUrl: transaction.trackingUrlProvider,
            labelId: transaction.labelUrl,
        };
    },
}; 