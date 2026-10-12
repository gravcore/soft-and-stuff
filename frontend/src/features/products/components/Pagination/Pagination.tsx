import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    // Build list of pages buttons to show:
    // first page, last page, current page, and 1 neighbor on each side
    const getPageNumbers = (): (number | 'ellipsis')[] => {
        const delta = 1; // how many neighbors to show around the current page
        const range: (number | 'ellipsis')[] = [];

        const rangeStart = Math.max(2, page - delta); // 1 is always added separately so omit that
        const rangeEnd = Math.min(totalPages - 1, page + delta); // last page is always added separately so omit that

        range.push(1); // always show first page
        if (rangeStart > 2) range.push('ellipsis'); // if gap exist between page 1 and rangeStart add "..."

        for (let i = rangeStart; i <= rangeEnd; i++) range.push(i); // add every page number from rangeStart to rangeEnd

        if (rangeEnd < totalPages - 1) range.push('ellipsis'); // if gap exists between rangeEnd and last page add "..."

        if (totalPages > 1) range.push(totalPages); // allways add the last page number at the end

        return range;
    }

    const pageButtonClass = (isActive: boolean) =>
        `flex h-9 min-w-9 items-center justify-center rounded-full px-2
        text-sm font-medium transition-colors ${isActive ? 'bg-accent text-white' : 'text-ink hover:bg-surface-2'}`;

    return (
        <div className="mt-8 flex items-center justify-center gap-1">
            <button
                onClick={() => onPageChange(1)}
                disabled={page <= 1}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 disabled:opacity-30"
            >
                <ChevronsLeft size={16} />
            </button>

            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 disabled:opacity-30"
            >
                <ChevronLeft size={16} />
            </button>

            {getPageNumbers().map((p, i) => 
                p === 'ellipsis' ? (
                    <button
                        key={`ellipsis-${i}`}
                        onClick={() => onPageChange(i === 1 ? Math.max(1, page - 5) : Math.min(totalPages, page + 5))}
                        // i === 1 first ellipsis > jump back -5 when click, otherwise second ellipsis > jump forward +5
                        className="flex h-9 w-9 items-center justify-center rounded-full text-sm text-muted transition-colors hover:bg-surface-2"
                    >   
                            ...
                    </button>
                ) : (
                    <button key={p} onClick={() => onPageChange(p)} className={pageButtonClass(p === page)}>
                        {p}
                    </button>
                )
            )}
            
            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 disabled:opacity-30"
            >
                <ChevronRight size={16} />
            </button>

            <button
                onClick={() => onPageChange(totalPages)} 
                disabled={page >= totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 disabled:opacity-30"
            >
                <ChevronsRight size={16} />
            </button>
        </div>
    );
}