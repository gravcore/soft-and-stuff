import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import type { Product } from '../../types/product.types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const formatPrice = (cents: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
    const [imgLoaded, setImgLoaded] = useState(false);
    const onSale = product.comparePrice && product.comparePrice > product.priceInCents;
    const { t } = useTranslation();

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
            className="group relative"
        >
            <Link to={`/products/${product.slug}`} className="block">
                <div className="relative aspect-aquare overflow-hidden rounded-xl bg-surface-2">
                    {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-surface-2" />}
                    <img 
                        src={product.imagesUrl[0]}
                        alt={product.productName}
                        loading="lazy"
                        onLoad={() => setImgLoaded(true)}
                        className={`h-full w-full object-cover transition-transform duration-500
                            group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                    />
                    {onSale && (
                        <span className="absolute left-3 top-3 rounded-full bg-danger px-2.5 py-1 text-xs font-semibold text-white">
                            {t('products.sale', 'Sale')}
                        </span>
                    )}
                    
                    <button
                        onClick={(e) => e.preventDefault()} 
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface/80 backdrop-blur-sm text-muted opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            <Heart size={16} />
                    </button>
                </div>

                <div className="mt-3 space-y-1">
                    <h3 className="text-sm font-medium text-ink line-clamp-1">
                        {product.productName}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-ink">{formatPrice(product.priceInCents)}</span>
                        {onSale && <span className="text-xs text-muted line-through">{formatPrice(product.comparePrice!)}</span> }
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}