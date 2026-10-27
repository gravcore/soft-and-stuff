import { AppError } from "@/shared/errors/AppError";

export async function convertCurrency(amountCents: number, from: string, to: string): Promise<number> {
    if (from === to) return amountCents;

    const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
    if (!res.ok) throw new AppError(`FX reuest failed: ${res.status}`, 500, 'FX_REQUEST_FAILED');

    const data = await res.json() as { result?: string; rates?: Record<string, number>; }

    const rate = data.rates?.[to];
    if (data.result !== 'success' || !rate) {
        throw new AppError(`No FX rate for ${from}->${to}`, 404, 'FX_NO_RATE_FOR_CURRENCY');
    }
    
    return Math.round(amountCents * rate);
}