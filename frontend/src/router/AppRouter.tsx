import { Protected } from '@/shared/components/Protected/Protected';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute/ProtectedRoute';
import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage})));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));

const wrap = (Component: React.ComponentType) => <Suspense fallback={null}><Component /></Suspense>;

const router = createBrowserRouter([
    { path: '/', element: <div>Home</div> },
    { 
        element: <ProtectedRoute />, 
        children: [
            { path: '/protected', element: <Protected /> },
        ],
    },
    { path: '/login', element: wrap(LoginPage) },
    { path: '/register', element: wrap(RegisterPage) },
    { path: '/unauthorized', element: <div>403 - Access Denied</div> },
    { path: '*', element: <div>404 - Page Not Found</div> },
]);

export const AppRouter = () => <RouterProvider router={router} />;