export async function convertCurrency(amountCents: number, from: string, to: string): Promise<number> {
    if (from === to) return amountCents;
    const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`);
    const { rates } = await res.json() as { rates: Record<string, number> };
    return Math.round(amountCents * rates[to]);
}