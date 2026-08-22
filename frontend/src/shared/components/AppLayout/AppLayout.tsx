import { Outlet } from 'react-router-dom';
import { AppNav } from '../AppNav/AppNav';
import { Footer } from '../Footer/Footer';

export function AppLayout() {
    return (
        <div className="md:min-h-screen">
            <AppNav />
            <main className="min-h-dvh">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}