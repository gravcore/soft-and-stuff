import { ProductCard } from "../ProductCard/ProductCard";
import type { Product } from "../../types/product.types";
import { useTranslation } from "react-i18next";

export function ProductGrid({ products, loading, skeletonCount = 8 }: { products?: Product[]; loading?: boolean; skeletonCount?: number }) {
    const { t } = useTranslation();
    
    if (loading) {
        return (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: skeletonCount }).map((_, i) => (
                    <div key={i} className="aspect-square animate-pulse rounded-xl bg-surface-2" />
                ))}
            </div>
        );
    }

    if (!products?.length) {
        return <p className="py-16 text-center text-sm text-muted">{t('products.notFound', 'No products found.')}</p>;
    }

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
    );
}