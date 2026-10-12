import { env } from "@/config/env";

const FALLBACK_RATE: Record<string, number> = {
    GT: 0.12,
    MX: 0.16,
    US: 0,
    CA: 0.05,
    ES: 0.21,
    GB: 0.20,
    CO: 0.19,
    CL: 0.19,
    AR: 0.21,
}

const GLOBAL_AVARAGE_RATE = 0.16;

export async function calculateTax(country: string, _state: string | undefined, subtotal: number): Promise<number> {
    try {
        const res = await fetch(`https://api.unirateapi.com/api/vat/rates?country=${country}&apiKey=${env.UNIRATE_API_KEY}`);
        const { vat_data } = await res.json() as { vat_data: { vat_rate: number }};
        return Math.round(subtotal * (vat_data.vat_rate / 100));
    } catch {
        const rate = FALLBACK_RATE[country] ?? GLOBAL_AVARAGE_RATE;
        return Math.round(subtotal * rate);
    }
}