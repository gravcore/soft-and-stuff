import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Check, ChevronDown, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCreateCategory } from '../../hooks/useProductMutations';
import { useCategorySearch } from '../../hooks/useProducts';

export function CategoryCombobox({ value, initialName, initialImageUrl, onChange }: { value: string; initialName?: string; initialImageUrl?: string | null;  onChange: (id: string, name: string) => void }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    
    const [selectedCategory, setSelectedCategory] = useState<{ name: string; imageUrl: string | null } | null>(initialName ? { name: initialName, imageUrl: initialImageUrl ?? null } : null);
    const [prevInitial, setPrevInitial] = useState({ name: initialName, imageUrl: initialImageUrl });

    const containerRef = useRef<HTMLDivElement>(null);
    const createCategory = useCreateCategory();

    const { data: results, isFetching } = useCategorySearch(search);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node))
                setOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (initialName !== prevInitial.name || initialImageUrl !== prevInitial.imageUrl) {
        setPrevInitial({ name: initialName, imageUrl: initialImageUrl });

        if (initialName) setSelectedCategory({ name: initialName, imageUrl: initialImageUrl ?? null });
    }

    // Return true if at least one matches the condition
    const exactMatch = (results ?? []).some((c) => c.name.toLowerCase() === search.trim().toLowerCase());

    const canCreate = search.trim().length > 0 && !exactMatch && !isFetching;

    function selectCategory(id: string, name: string, imageUrl: string | null) {
        onChange(id, name);
        setSelectedCategory({ name, imageUrl });
        setSearch('');
        setOpen(false);
    }

    function handleCreate() {
        const name = search.trim();
        createCategory.mutate(name, {
            onSuccess: (category) => {
                selectCategory(category.id, category.name, category.imageUrl);
            }
        });
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && canCreate) {
            e.preventDefault();
            handleCreate();
        }
    }

    return (
        <div ref={containerRef} className="relative">

            {/* Trigger button, shows either category name or a placeholder */}
            <button
                type="button"
                onClick={() => setOpen((p) => !p)}
                className="flex w-full items-center gap-2
                rounded-lg border border-border bg-surface-2 px-3 py-2.5
                text-sm text-ink outline-none focus:border-accent"
            >

                {/* Thumbnail */}
                {selectedCategory && (
                    selectedCategory.imageUrl ? (
                        <img src={selectedCategory.imageUrl} alt=""
                        className="h-6 w-6 shrink-0 rounded object-cover" />
                    ) : (
                        <div className="flex h-6 w-6 shrink-0 items-center
                        justify-center rounded bg-surface-2">
                            <Tag size={12} className="text-muted" />
                        </div>
                    )
                )}

                <span
                    className={`flex-1 text-left ${selectedCategory ? 'text-ink' : 'text-muted'}`}    
                >
                    {selectedCategory?.name || t('products.admin.selectCategory', 'Select a category')}
                </span>
                <ChevronDown size={16} className="text-muted shrink-0" />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 mt-2 w-full overflow-hidden
                        rounded-2xl border border-border bg-surface shadow-lg"
                    >

                        {/* Search input */}
                        <div className="relative border-b border-border p-2">
                            <Search size={14} className="absolute left-4 top-1/2
                            -translate-y-1/2 text-muted" />

                            <input
                                autoFocus
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={t('products.admin.searchCategory', 'Search or type a new category...')}
                                className="w-full rounded-lg bg-transparent py-1.5 pl-8 pr-2 text-sm
                                text-ink outline-none"
                            />

                        </div>

                        {/* Results area */}
                        <div className="max-h-48 overflow-y-auto">

                            {isFetching && <p className="px-4 py-3 text-xs text-muted">
                                    {t('products.admin.searching', 'Searching...')}
                                </p>}

                            {/* Matching categories */}   
                            {!isFetching && (results ?? []).map((c) => (
                                <button key={c.id} type="button" onClick={() => selectCategory(c.id, c.name, c.imageUrl)}
                                className="flex w-full items-center gap-2 px-4 py-2.5
                                text-left text-sm text-ink hover:bg-surface-2">

                                    {/* Image square */}
                                    {c.imageUrl ? (
                                        <img src={c.imageUrl} alt="" className="h-6 w-6 shrink-0 rounded object-cover" />
                                    ) : (
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-surface-2">
                                            <Tag size={12} className="text-muted" />
                                        </div>
                                    )}

                                    <span className="flex-1">{c.name}</span>
                                    {c.id === value && <Check size={14} className="text-accent" /> }
                                </button>
                            ))}

                            {/* No results came back for what was typed  */}
                            {!isFetching && (results ?? []).length === 0 && search.trim().length > 0 && (
                                <p className="px-4 py-3 text-xs text-muted">
                                    {t('products.admin.noCategories', 'No categories found')}
                                </p>
                            )}

                            {/* Inline create new category option appears when no exact match exists */}
                            {canCreate && (
                                <button
                                    type="button"
                                    onClick={handleCreate}
                                    disabled={createCategory.isPending}
                                    className="flex w-full items-center
                                    gap-2 border-t border-border px-4 py-2.5
                                    text-left text-sm text-accent
                                    hover:bg-surface-2 disabled:opacity-50 hover:cursor-pointer"
                                >
                                    <Plus size={14} />
                                    
                                    {createCategory.isPending 
                                        ? t('products.admin.creatingCategory') 
                                        : t('products.admin.createCategory', 'Create "{{name}}"', { name: search.trim() })}
                                </button>
                            )}
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}