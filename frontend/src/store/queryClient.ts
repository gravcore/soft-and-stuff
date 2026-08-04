import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // No auto-fetch on remount/focus/etc in this time
            gcTime: 10 * 60 * 1000, // Unused data stays in memory this time
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});