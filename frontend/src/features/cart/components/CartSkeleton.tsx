interface CartSkeletonProps {
    count?: number;
}

export function CartSkeleton({ count = 2 }: CartSkeletonProps) {
    return (
        <div className="mx-auto max-w-2xl space-y-4 px-4 pt-6 md:mt-16">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl
                bg-surface-2" />
            ))}
        </div>
    );
}