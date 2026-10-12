// Converts a product name into a URL-friendly slug
// "Running sheos - Men's" -> "running-shoes-mens"
export const slugify = (name: string): string => 
    name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // e.g. "running shoes - men's!" -> "running shoes - mens"
                                      // it just strips out the apostrophe and exclamation mark,
                                      // leaving letters, numbers, spaces, and the hyphen untouched
        .trim()                       // Removes leading and trailing spaces e.g. " running shoes " -> "running shoes"
        .replace(/\s+/g, '-');        // replace spaces with hyphens (\s+ = one or more whitespace chars)

export const skuify = (productName: string): string => {
    const sku = slugify(productName).slice(0, 10).toUpperCase()
        .replace(/-/g, '');
    return `SKU-${sku}`;
}