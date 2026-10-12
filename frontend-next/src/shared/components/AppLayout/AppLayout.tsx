import { Outlet, ScrollRestoration } from 'react-router-dom';
import { AppNav } from '../AppNav/AppNav';
import { Footer } from '../Footer/Footer';
import { useCart } from '@/features/cart/hooks/useCart';

export function AppLayout() {
    const { cart } = useCart();
    const cartCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0);

    return (
        <div className="md:min-h-screen">
            <AppNav cartCount={cartCount} />
            <main className="min-h-dvh">
                <Outlet />
            </main>
            <Footer />
            <ScrollRestoration />
        </div>
    );
}