import { useMutation } from "@tanstack/react-query";
import { fetchQuote, submitCheckout, updateShippingAddress } from "../services/checkoutApi";
import type { ShippingAddress } from "../types/checkout.types";

// We don't use useQuery because we're not going to cache anything, is a changing triggering a server call
export const useQuote = () => useMutation({ mutationFn: fetchQuote });

export const useSubmitCheckout = () => 
    useMutation({
        mutationFn: ({ address, idempotencyKey }: { address: ShippingAddress; idempotencyKey: string }) =>
            submitCheckout(address, idempotencyKey),
    });

export const useUpdateShippingAddress = () =>
    useMutation({
        mutationFn: ({ orderId, address, trackingId, idempotencyKey }: { orderId: string; address: ShippingAddress; trackingId: string | undefined; idempotencyKey: string }) =>
            updateShippingAddress(orderId, address, trackingId, idempotencyKey),
    });