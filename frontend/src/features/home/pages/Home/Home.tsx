import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '@/core/auth/AuthContext';
import { useProducts, useCategories } from '@/features/products/hooks/useProducts';
import { ProductCard } from '@/features/products/components/ProductCard/ProductCard';
import { ProductGrid } from '@/features/products/components/ProductGrid/ProductGrid';

export function Home() {
    const { t } = useTranslation();
    const { user } = useAuthContext();
    const heroRef = useRef<HTMLDivElement>(null); // To track scroll position relative to this element

    // Parallax effect
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);

    const { data: featured, isLoading: loadingFeatured } = useProducts({ featured: true, limit: 4 });
    const { data: categories } = useCategories();

    return (
        <div>
            {/* HERO, the only eager-loaded, animated-on-load section */}
            <section ref={heroRef} className="relative overflow-hidden px-6 py-16 md:py-32">
                <motion.div
                    style={{ y: heroY }}
                    className="absolute inset-0 -z-10 bg-gradient-to-br to-accent/10 from-transparent"
                />

                <div className="mx-auto max-w-4xl text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="text-4xl font-bold tracking-tight text-ink md:text-6xl"
                    >
                        {t('home.heroTitle', 'Everything, in one place')}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="mx-auto mt-4 max-w-xl text-muted"
                    >
                        {user
                            ? t('home.heroSubtitleWelcome', { name: user.firstName })
                            : t('home.heroSubtitle')
                        }
                    </motion.p>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Link
                            to="/products"
                            className="group mt-8 inline-flex items-center gap-2 rounded-full
                            bg-accent px-6 py-3 text-sm font-semibold text-white transition-transform
                            hover:scale-105"
                        >
                            {t('home.shopAll', 'Shop all products')} <ArrowRight size={16} strokeWidth={4} className="transition-transform duration-200 group-hover:translate-x-1"/>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* CATEGORIES */}
            {categories && categories.length > 0 && (
                <section className="px-6 py-8">
                    <div className="mx-auto flex max-w-6xl gap-4 overflow-x-auto pb-2">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                to={`/products?category=${cat.slug}`}
                                className="flex shrink-0 flex-col items-center gap-2
                                rounded-xl bg-surface-2 px-6 py-4 transition-colors
                                hover:bg-surface"
                            >
                                {cat.imageUrl && <img src={cat.imageUrl} alt={cat.name} loading="lazy" className="h-12 w-12 rounded-full object-cover" />}
                                <span className="text-sm font-medium text-ink">{cat.name}</span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* FEATURED */}
            <section className="px-6 py-8">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-ink">{t('home.featured', 'Featured')}</h2>
                        <Link to="/products" className="text-sm text-accent hover:underline">{t('home.viewAll', 'View all')}</Link>
                    </div>

                    <ProductGrid products={featured?.products} loading={loadingFeatured} skeletonCount={4} />
                </div>
            </section>        
        </div>
    );
}