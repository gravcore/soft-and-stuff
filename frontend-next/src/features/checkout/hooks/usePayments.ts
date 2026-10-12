import httpClient from "@/shared/services/httpClient";
import { useMutation } from "@tanstack/react-query";

interface PaymentIntentArgs {
    orderId: string;
    method: string;
    trackingId: string;
    idempotencyKey: string;
}

export const useCreatePaymentIntent = () =>
    useMutation({
        mutationFn: async ({ orderId, method, trackingId, idempotencyKey }: PaymentIntentArgs) => {
            const { data } = await httpClient.post<{ data: { providerReference: string } }>(
                `/payments/${orderId}/${method}`,
                { trackingId },
                { headers: { 'Idempotency-Key': idempotencyKey } },
            );
            return data.data;
        }
    });

export const useCapturePayment = () =>
    useMutation({
        mutationFn: ({ orderId, method, trackingId, idempotencyKey }: PaymentIntentArgs) =>
            httpClient.post(
                `/payments/${orderId}/${method}/capture`,
                { trackingId },
                { headers: { 'Idempotency-Key': idempotencyKey } }
            ),
    });

export const useConfirmCod = () =>
    useMutation({
        mutationFn: ({ orderId, trackingId, idempotencyKey }: { orderId: string; trackingId: string; idempotencyKey: string }) =>
            httpClient.post(
                `/orders/${orderId}/pay/cod`,
                { trackingId },
                { headers: { 'Idempotency-Key': idempotencyKey }}
            ),
    });