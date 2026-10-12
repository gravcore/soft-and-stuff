import { useState } from "react";
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { useDeleteProduct } from '../../hooks/useProductMutations';
import { useDebounce } from "@/shared/hooks/useDebounce";
import { formatPrice } from "../../utils/formatPrice";
import { useTranslation } from "react-i18next";

export function AdminProductListPage() {
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 400);
    const { data, isLoading } = useProducts({ search: debouncedSearch || undefined, limit: 50 });
    const deleteProduct = useDeleteProduct();
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const { t } = useTranslation();

    return (
        <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">
            
            {/* Products title and add new product button */}
            <div className="mb-5 flex items-center justify-between md:pt-16">
                <h1 className="text-xl font-semibold text-ink">{t('products.title', 'Products')}</h1>
                <Link to="/admin/products/new" className="flex h-10 w-10 items-center justify-center
                rounded-full bg-accent text-white">
                    <Plus size={18} />
                </Link>
            </div>

            {/* Search bar */}
            <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />

                <input 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('products.searchPlaceholder', 'Search products by name or SKU')}
                    className="w-full rounded-full border border-border bg-surface-2 py-2.5 pl-9 pr-4 text-sm text-ink outline-none focus:border-accent"
                />
            </div>

            {/* Result */}
            {isLoading ? (
                <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-surface-2" />)}
                </div>
            ) : (
                <div className="space-y-2">
                    {data?.products.map((p) => (

                        <div key={p.id} className="flex items-center gap-3
                        rounded-xl bg-surface-2 p-3">
                            
                            {/* Product image */}
                            <img src={p.imagesUrl[0]} alt={p.productName} 
                            className="h-14 w-14 rounded-lg object-cover" />

                            {/* Product details */}
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-ink">
                                    {p.productName}
                                </p>

                                <p className="text-xs text-muted">{p.sku ?? t('products.noSku', 'No SKU')}</p>

                                {/* Price and stock */}
                                <div className="mt-1 flex items-center gap-2">

                                    <span className="text-sm font-semibold text-ink">{formatPrice(p.priceInCents).full}</span>

                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[0.6875rem] font-medium
                                            ${p.stock === 0 ? 'bg-danger/15 text-danger' : p.stock <= 5 ? 
                                                'bg-amber-500/15 text-amber-500' : 'bg-green-500/15 text-green-500'
                                            }`}
                                    >
                                        {p.stock === 0 ? t('products.outOfStock', 'Out of stock') : t('products.stock', { stock: p.stock })}
                                    </span>
                                </div>

                            </div>

                            {/* Edit a product button */}
                            <Link to={`/admin/products/${p.id}/edit`} className="p-2 text-muted hover:text-ink">
                                <Pencil size={16} />
                            </Link>

                            {/* Confirmation */}
                            <button 
                                onClick={() => setConfirmId(p.id)}
                                className="p-2 text-danger hover:text-ink"
                            >
                                <Trash2 size={16} />
                            </button>

                        </div>
                    ))}
                </div>
            )}


            {/* Delete confirmation button */}
            <AnimatePresence>
                {confirmId && (
                    <>
                        {/* Background */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setConfirmId(null)}
                            className="fixed inset-0 z-50 bg-black/50"
                        />

                        {/* Content */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}    
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed left-1/2 top-1/2 z-50 w-[90%]
                            max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl
                            bg-surface p-6"
                        >
                            {/* Title */}
                            <p className="text-sm font-medium text-ink">{t('products.deleteThisProduct', 'Delete this product?')}</p>

                            {/* Description */}
                            <p className="mt-1 text-xs text-muted">{t('products.thisCantBeUndoneFromHere', 'This can be undone from here')}</p>

                            {/* Buttons */}
                            <div className="mt-4 flex gap-2">
                                <button onClick={() => setConfirmId(null) } className="flex-1 rounded-full border border-border py-2 text-sm text-ink">
                                    {t('products.cancel', 'Cancel')}
                                </button>

                                <button onClick={() => { deleteProduct.mutate(confirmId); setConfirmId(null); }} className="flex-1 rounded-full bg-danger py-2 text-sm font-semibold text-white">
                                    {t('products.delete', 'Delete')}
                                </button>
                            </div>

                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}