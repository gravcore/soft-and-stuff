import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { SlidersHorizontal, Grid2x2, List, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useProducts, useCategories } from '@/features/products/hooks/useProducts';
import { useProductUIStore } from '../../store/productUIStore';
import { ProductGrid } from '../../components/ProductGrid/ProductGrid';
import { Pagination } from '../../components/Pagination/Pagination';
import { SortDropdown } from '../../components/SortDropdown/SortDropdown';
import { FiltersPanel } from '../../components/FiltersPanel/FiltersPanel';

// Price not in cents
const PRICE_MIN = 0;
const PRICE_MAX = 50000;

function parsePriceParam(raw: string | null, fallback: number) {
    if (raw === null) return fallback;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
}

export function ProductListPage() {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const { isFilterDrawerOpen, openFilterDrawer, closeFilterDrawer, viewMode, setViewMode } = useProductUIStore();

    const sortOptions = [
        { value: 'newest', label: t('sort.newest') },
        { value: 'price_asc', label: t('sort.priceAsc') },
        { value: 'price_desc', label: t('sort.priceDesc') },
        { value: 'popular', label: t('sort.popular') },
    ];

    const category = searchParams.get('category') ?? undefined;
    const sort = searchParams.get('sort')?.split(',') ?? ['newest'];
    const search = searchParams.get('search') ?? '';
    const page = Number(searchParams.get('page') ?? 1);
    const minPrice = parsePriceParam(searchParams.get('minPrice'), PRICE_MIN);
    const maxPrice = parsePriceParam(searchParams.get('maxPrice'), PRICE_MAX);
    const debouncedSearch = useDebounce(search, 400); // avoids firing a request on every keystroke

    const { data, isLoading, isFetching } = useProducts({
        category,
        sort,
        search: debouncedSearch || undefined,
        page,
        limit: 12,
        minPrice: minPrice !== PRICE_MIN ? Math.round(minPrice * 100) : undefined,
        maxPrice: maxPrice !== PRICE_MAX ? Math.round(maxPrice * 100) : undefined,
    });

    const { data: categories } = useCategories();

    const updateParam = (key: string, value: string | null) => {
        const next = new URLSearchParams(searchParams); // creates a copy
        if (value) next.set(key, value); else next.delete(key); // edit the copy
        if (key !== 'page') next.delete('page'); // always deleting the page to go to fallback page 1 on filter change
        setSearchParams(next); // pass the copy to actually trigger the render
    };

    // For the price range two keys
    const updatePriceRange = ([newMin, newMax]: [number, number]) => {
        const next = new URLSearchParams(searchParams);
        if (newMin !== PRICE_MIN) { next.set('minPrice', String(newMin)) } else { next.delete('minPrice'); }
        if (newMax !== PRICE_MAX) { next.set('maxPrice', String(newMax)) } else { next.delete('maxPrice'); }
        next.delete('page');
        setSearchParams(next);
    }

    return (
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:pb-6 md:mt-14">
            
            {/* Title + Filter/View buttons row */}
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-semibold text-ink">{t('products.title', 'Products')}</h1>

                {/* Filters and view mode buttons */}
                <div className="flex items-center gap-2">
                    
                    <button onClick={openFilterDrawer} className="flex items-center gap-1.5 rounded-full border border-border
                    px-3 py-2 text-sm text-ink md:hidden">
                        <SlidersHorizontal size={14} /> {t('products.filters', 'Filters')}
                    </button>

                    <div className="hidden items-center gap-1 rounded-md border border-border p-1 md:flex">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`rounded p-1.5 ${viewMode === 'grid' ? 'bg-surface-2 text-accent' : 'text-muted'}`}
                        >
                            <Grid2x2 size={16} />
                        </button>

                        <button
                            onClick={() => setViewMode('list')}
                            className={`rounded p-1.5 ${viewMode === 'list' ? 'bg-surface-2 text-accent' : 'text-muted'}`}
                        >
                            <List size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar (desktop) + main content, side by side */}
            <div className="md:flex md:items-start md:gap-8">

                <aside className="hidden md:block md:w-64 md:shrink-0
                md:rounded-2xl md:border md:border-border md:bg-surface
                md:p-5">
                    <h2 className="mb-4 text-sm font-semibold text-ink">
                        {t('products.filters', 'Filters')}
                    </h2>

                    <FiltersPanel 
                        categories={categories}
                        activeCategory={category}
                        onCategoryChange={(slug) => updateParam('category', slug)}
                        priceMin={PRICE_MIN}
                        priceMax={PRICE_MAX}
                        priceValue={[minPrice, maxPrice]}
                        onPriceChange={updatePriceRange}
                    />
                </aside>

                {/* Main column */}
                <div className="min-w-0 flex-1">

                    {/* Search input and sort dropdown */}
                    <div className="mb-6 flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />

                            <input
                                value={search}
                                onChange={(e) => updateParam('search', e.target.value || null)}
                                placeholder={t('products.searchPlaceholder', 'Search products...')}
                                className="w-full rounded-full border border-border bg-surface-2 
                                    py-2 pl-9 pr-4 text-sm text-ink outline-none focus:border-accent"
                            />
                        </div>
                        <SortDropdown sort={sort} onChange={(newSort) => updateParam('sort', newSort.join(','))} sortOptions={sortOptions} />
                    </div>

                    {/* Result */}
                    <div className={isFetching && !isLoading ? 'opacity-60 transition-opacity' : ''}>
                        <ProductGrid products={data?.products} loading={isLoading} />
                    </div>

                    {/* Pagination */}
                    {data && <Pagination page={data.meta.page} totalPages={data.meta.totalPages}
                    onPageChange={(p) => updateParam('page', String(p))} />}

                </div>
            </div>

            {/* Mobile filter drawer */}
            <AnimatePresence>
                {isFilterDrawerOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeFilterDrawer}
                            className="fixed inset-0 z-50 bg-black/40 md:hidden"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed bottom-0 inset-x-0 z-50 max-h-[80vh] overflow-y-auto
                            rounded-t-2xl bg-surface p-6 md:hidden"
                        >
                            <h2 className="mb-4 text-sm font-semibold text-ink">{t('products.filters', 'Filters')}</h2>

                            <FiltersPanel 
                                categories={categories}
                                activeCategory={category}
                                onCategoryChange={(slug) => { updateParam('category', slug); closeFilterDrawer(); }}
                                priceMin={PRICE_MIN}
                                priceMax={PRICE_MAX}
                                priceValue={[minPrice, maxPrice]}
                                onPriceChange={updatePriceRange}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

