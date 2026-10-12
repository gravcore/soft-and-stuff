import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isAxiosError } from 'axios';
import { getProduct } from '@/lib/products.server';
import httpClientServer from '@/lib/httpClient.server';
import { routing } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { ProductDetailPage } from '@/features/products/pages/ProductDetailPage/ProductDetailPage';

// In build time we make the entire 
// list of combinations of [locale] + [slug] 
// to pre-generate the HTML, this for ISR
export async function generateStaticParams() {

    // Ask for the first 1000 products to save an entry for each, 
    // with fallback generation on the first visit when products are missing
    const { data } = await httpClientServer.get('/products?limit=1000');

    // return in a single array products slugs with a locale
    return routing.locales.flatMap((locale) =>
        data.data.products.map((product: { slug: string}) => 
            ({ locale, slug: product.slug })
        )
    );
}

export const revalidate = 300; // Time until a data is considered stale: 5 minutes

export async function generateMetadata({
    params,
}: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
    const { locale, slug } = await params;
    const t = await getTranslations({ locale }); // translations of the specific language
    const product = await getProduct(slug); // cache call to retrieve products

    return {
        title: product.name,
        description: product.description,
        openGraph: {
            title: product.name,
            description: product.description,
            images: product.images,
        },
    };
}

export default async function ProductDetailPageWrap({ params }: { params: Promise<{ locale: string; slug: string; }> }) {
    const { slug } = await params;

    let product;
    try {
        product = await getProduct(slug); // cache retrieved of products (already fetched to the server so it doesn't waste server call)
    } catch (err) {
        // Edge case this page stayed cached by ISR and the product was deleted
        if (isAxiosError(err) && err.response?.status === 404) {
            notFound(); // end here and show the closest not-found.tsx page
        }

        throw err; // any other error continue its normal flow
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.images,
        offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: product.priceInCents / 100,
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        }
    };

    return (
        <>
            <script 
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ProductDetailPage />
        </>
    );
}