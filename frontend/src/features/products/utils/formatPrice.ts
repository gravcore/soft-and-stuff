const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(locales: string, currency: string): Intl.NumberFormat {
    const key = `${locales}|${currency}`;
    if (!formatterCache.has(key)) {
        formatterCache.set(key, new Intl.NumberFormat(locales, { style: 'currency', currency }));
    }
    return formatterCache.get(key)!;
}

export const formatPrice = (value: number, valueInCents = true, locales = 'en-US', currency = 'USD') => {
    const formatter = getFormatter(locales, currency);
    const parts = formatter.formatToParts(valueInCents ? value / 100 : value);

    return {
        symbol: parts.find((part) => part.type === 'currency')?.value ?? '$',
        amount: parts.filter((part) => part.type !== 'currency').map((part) => part.value).join('').trim(),
        full: formatter.format(valueInCents ? value / 100 : value),
    };
};