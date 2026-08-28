import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Pencil, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProduct } from '../../hooks/useProducts';
import { ImageGallery } from '../../components/ImageGallery/ImageGallery';
import { formatPrice } from '../../utils/formatPrice';
import { useAuthContext } from '@/core/auth/AuthContext';
import { QuantityStepper } from '@/features/cart/components/QuantityStepper';
import { useCart } from '@/features/cart/hooks/useCart';

export function ProductDetailPage() {
    const { slug } = useParams();
    const { t } = useTranslation();
    const { data: product, isLoading } = useProduct(slug ?? '');
    const [quantity, setQuantity] = useState(1);
    const canGoBack = (window.history.state?.idx ?? 0) > 0;
    const navigate = useNavigate();
    const { user } = useAuthContext();
    const { addItem } = useCart();

    const colors = (product?.metadata?.colors as { name: string; hex: string }[] | undefined) ?? [];
    const [selectedColor, setselectedColor] = useState<string | null>(null);

    if (isLoading) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-8 md:mt-18">
                <div className="grid gap-8 md:grid-cols-2">
                    <div className="aspect-square animate-pulse rounded-2xl bg-surface-2" />

                    <div className="space-y-3">
                        <div className="h-8 w-2/3 animate-pulse rounded bg-surface-2" />
                        <div className="h-4 w-1/3 animate-pulse rounded bg-surface-2" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) return (
        <p className="py-16 text-center text-muted min-h-dvh flex items-center justify-center">{t('products.notFound', 'Product not found')}</p>
    );

    const onSale = product.comparePrice && product.comparePrice > product.priceInCents;
    
    const stockLabel = product.stock === 0 
        ? t('products.outOfStock', 'Out of stock')
        : product.stock <= 5 
            ? t('products.lowStock', { stock: product.stock, defaultValue: `Only ${product.stock} left` })
            : t('products.inStock', 'In stock');
    
    const stockColor = product.stock === 0 
        ? 'text-danger'
        : product.stock <= 5 ? 'text-amber-500' : 'text-green-500';

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="mx-auto max-w-5xl px-4 pb-24 pt-6 md:pb-8 md:mt-16"
        >
            {/* Back button */}
            {canGoBack && (
                <button 
                    onClick={() => navigate(-1)}
                    className="mb-6 inline-flex items-center gap-2 text-sm text-muted
                    hover:text-ink hover:cursor-pointer"
                >
                        <ArrowLeft size={20} /> {t('common.back')}
                </button>
            )}

            {/* Product detail */}
            <div className="grid gap-10 md:grid-cols-2">
                
                {/* Image */}
                <ImageGallery images={product.imagesUrl} alt={product.productName} viewTransitionName={`product-image-${product.id}`} />

                {/* Info */}
                <div>
                    {/* Name */}
                    <div className="flex justify-between w-full">
                        <h1 className="text-2xl font-semibold text-ink">{product.productName}</h1>
                        {user?.role === 'admin' && (
                            <Link
                                to={`/admin/products/${product.id}/edit`}
                                className="ml-4 rounded-full flex items-center gap-2 bg-[#012938] px-4 py-2 text-sm font-semibold text-white shadow-lg"
                            >
                                <Pencil size={16} />
                                {t('products.admin.editProduct')}
                            </Link>
                        )}
                    </div>
                    {product.sku && <p className="mt-1 text-xs text-muted">SKU: {product.sku}</p>}

                    {/* Prices */}
                    <div className="mt-3 flex items-center gap-3">
                        <span className="text-2xl font-bold text-ink">{formatPrice(product.priceInCents).full}</span>

                        {onSale && <span className="text-base text-muted line-through">{formatPrice(product.comparePrice!).full}</span>}
                    </div>

                    {/* Stock */}
                    <p className={`mt-2 text-sm font-medium ${stockColor}`}>{stockLabel}</p>
                    
                    {/* Description */}
                    {product.description && 
                        <p className="mt-4 text-sm leading-relaxed text-muted">
                            {product.description}
                        </p>
                    }

                    {/* Color picker */}
                    {colors.length > 0 && (
                        <div className="mt-6">
                            {/* Color title */}
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                                {t('products.color', 'Color')}
                            </p>

                            {/* Color options */}
                            <div className="flex gap-2">
                                {colors.map((c) => (
                                    <button 
                                        key={c.hex}
                                        onClick={() => setselectedColor(c.name)}
                                        title={c.name}
                                        style={{ backgroundColor: c.hex }}
                                        className={`h-8 w-8 rounded-full border-2
                                            transition-transform hover:scale-110
                                            ${selectedColor === c.name ? 'border-accent' : 'border-border'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Videos */}
                    {product.videosUrl.length > 0 && (
                        product.videosUrl.map((url, i) => (
                            <div key={i} className="mt-6 aspect-video overflow-hidden rounded-xl">
                                <iframe 
                                    src={url}
                                    title={`${product.productName} video ${i}`}
                                    loading="lazy"
                                    className="h-full w-full"
                                    allowFullScreen
                                />
                            </div>
                        ))
                    )}

                    {/* Add to Cart */}
                    <div className="sticky bottom-4 z-10 mt-8 flex items-center gap-4 backdrop-blur-md bg-transparent p-2 rounded-md">
                        <QuantityStepper
                            quantity={quantity}
                            max={product.stock}
                            onChange={setQuantity}
                        />

                        {/* Add to cart button */}
                        <button
                            disabled={product.stock === 0 || addItem.isPending}
                            onClick={() => addItem.mutate({ productId: product.id, quantity })}
                            className="flex flex-1 items-center justify-center
                            gap-2 rounded-full bg-accent py-3.5 text-sm
                            font-semibold text-white transition-transform
                            hover:scale-[1.02] 
                            hover:cursor-pointer
                            disabled:opacity-50
                            disabled:hover:scale-100
                            disabled:hover:cursor-not-allowed"
                        >
                            <ShoppingBag size={16} />{t('products.addToCart', 'Add to Cart')}
                        </button>
                    </div>

                </div>
            </div>
        </motion.div>
    );
}

