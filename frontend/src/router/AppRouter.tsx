import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage/LoginPage').then((m) => ({ default: m.LoginPage})));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const Home = lazy(() => import('@/features/home/pages/Home/Home').then((m) => ({ default: m.Home })));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const OAuthCallbackPage = lazy(() => import('@/features/auth/pages/OAuthCallbackPage/OAuthCallbackPage').then((m) => ({ default: m.OAuthCallbackPage })));
const ProtectedRoute = lazy(() => import('@/shared/components/ProtectedRoute/ProtectedRoute').then((m) => ({ default: m.ProtectedRoute })));
const Protected = lazy(() => import('@/shared/components/Protected/Protected').then((m) => ({ default: m.Protected })));
const AppLayout = lazy(() => import('@/shared/components/AppLayout/AppLayout').then((m) => ({ default: m.AppLayout })));
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const ProfileDetailPage = lazy(() => import('@/features/profile/pages/ProfileDetailPage/ProfileDetailPage').then((m) => ({ default: m.ProfileDetailPage })));
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const ProductListPage = lazy(() => import('@/features/products/pages/ProductListPage/ProductListPage').then((m) => ({ default: m.ProductListPage })));

const wrap = (Component: React.ComponentType) => <Suspense fallback={null}><Component /></Suspense>;

const router = createBrowserRouter([
    {
        element: wrap(AppLayout),
        children: [
            { path: '/', element: wrap(Home) },
            { path: '/products', element: wrap(ProductListPage) },
            { path: '/settings', element: wrap(SettingsPage) },
            { 
                element: wrap(ProtectedRoute),
                children: [
                    { path: '/profile', element: wrap(ProfilePage) },
                    { path: '/profile/details', element: wrap(ProfileDetailPage) },
                ],
            },
        ],
    },
    { 
        element: <ProtectedRoute />, 
        children: [
            { path: '/protected', element: <Protected /> },
        ],
    },
    { path: '/login', element: wrap(LoginPage) },
    { path: '/register', element: wrap(RegisterPage) },
    { path: '/oauth-callback', element: wrap(OAuthCallbackPage) },
    { path: '/forgot-password', element: wrap(ForgotPasswordPage) },
    { path: '/unauthorized', element: <div>403 - Access Denied</div> },
    { path: '*', element: <div>404 - Page Not Found</div> },
]);

export const AppRouter = () => <RouterProvider router={router} />;