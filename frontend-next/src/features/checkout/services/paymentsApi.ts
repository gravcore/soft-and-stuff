import httpClient from "@/shared/services/httpClient";

// Stripe needs create intent upfront the moment the panel mounts
export const createPaymentIntent = async (orderId: string, method: string): Promise<string | null> => {
    const { data } = await httpClient.post<{ data: { clientSecret: string | null } }>(`/payments/${orderId}/${method}`);
    return data.data.clientSecret;
}