import { useTranslation } from 'react-i18next';
import { PriceRangeFilter } from '../PriceRangeFilter/PriceRangeFilter';

interface Category { id: string; slug: string; name: string; }

interface FiltersPanelProps {
    categories?: Category[];
    activeCategory?: string;
    onCategoryChange: (slug: string | null) => void;
    priceMin: number;
    priceMax: number;
    priceValue: [number, number];
    onPriceChange: (value: [number, number]) => void;
}

export function FiltersPanel({ categories, activeCategory, onCategoryChange, priceMin, priceMax, priceValue, onPriceChange }: FiltersPanelProps) {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            {/* Category section */}
            <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                    {t('products.category', 'Category')}
                </h3>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => onCategoryChange(null)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors
                            ${!activeCategory ? 'bg-accent text-white' : 'bg-surface-2 text-muted hover:text-ink'}`}
                    >   
                        {t('products.all', 'All')}
                    </button>

                    {categories?.map((c) => (
                        <button 
                            key={c.id}
                            onClick={() => onCategoryChange(c.slug)}
                            className={`rounded-full px-3 py-1.5 text-xs
                                font-medium transition-colors
                                ${activeCategory === c.slug ? 'bg-accent text-white' : 'bg-surface-2 text-muted hover:text-ink'}`}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Divider, purely visual */}
            <div className="h-px bg-border" />

            {/* Price section */}
            <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                    {t('products.priceRange', 'Price')}
                </h3>

                <PriceRangeFilter min={priceMin} max={priceMax} value={priceValue} onChange={onPriceChange} />
            </div>
        </div>
    );
}