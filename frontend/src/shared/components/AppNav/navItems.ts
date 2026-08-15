import { Home, Grid3x3, ShoppingCart } from 'lucide-react';

export const NAV_ITEMS = [
    { to: '/', icon: Home, labelKey: 'nav.home' },
    { to: '/categories', icon: Grid3x3, labelKey: 'nav.categories' },
    { to: '/cart', icon: ShoppingCart, labelKey: 'nav.cart' },
] as const;