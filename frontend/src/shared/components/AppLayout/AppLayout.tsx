import { Outlet } from 'react-router-dom';
import { AppNav } from '../AppNav/AppNav';

export function AppLayout() {
    return (
        <div className="md:min-h-screen">
            <AppNav />
            <main>
                <Outlet />
            </main>
        </div>
    );
}