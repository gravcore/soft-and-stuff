import { create } from 'zustand';

interface ProductUIState {
    isFilterDrawerOpen: boolean;
    viewMode: 'grid' | 'list';
    openFilterDrawer: () => void;
    closeFilterDrawer: () => void;
    setViewMode: (mode: 'grid' | 'list') => void; 
}

export const useProductUIStore = create<ProductUIState>((set) => ({
    isFilterDrawerOpen: false,
    viewMode: 'grid',
    openFilterDrawer: () => set({ isFilterDrawerOpen: true }),
    closeFilterDrawer: () => set({ isFilterDrawerOpen: false }),
    setViewMode: (mode) => set({ viewMode: mode }),
}));