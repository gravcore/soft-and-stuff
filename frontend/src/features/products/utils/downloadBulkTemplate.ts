export function downloadBulkTemplate() {
    const headers = [
        'productName',
        'categoryName',
        'description',
        'slug',
        'sku',
        'priceInCents',
        'comparePrice',
        'stock',
        'isActive',
        'isFeatured',
        'imagesUrl',
        'videosUrl',
        'metadata',
    ];

    // Example row
    const exampleRow = [
        'Classic Cotton T-Shirt',
        'Shirts',
        'A soft, breathable everyday t-shirt made from 100% organic cotton',
        'classic-cotton-t-shirt',
        'TSHIRT-001',
        '1999',
        '2499',
        '150',
        'true',
        'false',
        'https://example.com/tshort-front.jpg,https://example.com/tshirt-back.jpg',
        'https://example.com/tshort-demo-1.mp4,https://example.com/tshort-demo-2.mp4',
        '{"color":"white","material":"cotton","fit":"regular"}',
    ];

    function csvEscape(value: string): string {
        if (value.includes(',') || value.includes('"')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }

    const csvContent = [
        headers.join(','),
        exampleRow.map(csvEscape).join(','),
    ].join('\n');

    // Wrap the text into a file (Binary Large Object blob)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Creates the fake url linked to the file in memory
    const url = URL.createObjectURL(blob);

    // Temporary invisible link anchor element to download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'product-bulk-upload-template.csv';
    link.click();

    // Frees up memory now that the download started
    URL.revokeObjectURL(url);
}