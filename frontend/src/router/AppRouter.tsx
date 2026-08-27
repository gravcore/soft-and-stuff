import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { GuestRoute } from '@/shared/components/GuestRoute/GuestRoute';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute/ProtectedRoute';
import { AdminRoute } from '@/shared/components/AdminRoute/AdminRoute';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage/LoginPage').then((m) => ({ default: m.LoginPage})));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const Home = lazy(() => import('@/features/home/pages/Home/Home').then((m) => ({ default: m.Home })));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const OAuthCallbackPage = lazy(() => import('@/features/auth/pages/OAuthCallbackPage/OAuthCallbackPage').then((m) => ({ default: m.OAuthCallbackPage })));
const Protected = lazy(() => import('@/shared/components/Protected/Protected').then((m) => ({ default: m.Protected })));
const AppLayout = lazy(() => import('@/shared/components/AppLayout/AppLayout').then((m) => ({ default: m.AppLayout })));
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const ProfileDetailPage = lazy(() => import('@/features/profile/pages/ProfileDetailPage/ProfileDetailPage').then((m) => ({ default: m.ProfileDetailPage })));
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const ProductListPage = lazy(() => import('@/features/products/pages/ProductListPage/ProductListPage').then((m) => ({ default: m.ProductListPage })));
const ProductDetailPage = lazy(() => import('@/features/products/pages/ProductDetailPage/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })));
const AdminProductListPage = lazy(() => import('@/features/products/pages/AdminProductListPage/AdminProductListPage').then((m) => ({ default: m.AdminProductListPage })));
const AdminProductFormPage = lazy(() => import('@/features/products/pages/AdminProductFormPage/AdminProductFormPage').then((m) => ({ default: m.AdminProductFormPage })));
const AdminBulkUploadPage = lazy(() => import('@/features/products/pages/AdminBulkUploadPage/AdminBulkUploadPage').then((m) => ({ default: m.AdminBulkUploadPage })));

const wrap = (Component: React.ComponentType) => <Suspense fallback={null}><Component /></Suspense>;

const router = createBrowserRouter([
    {
        element: wrap(AppLayout),
        children: [
            { path: '/', element: wrap(Home) },
            { path: '/products', element: wrap(ProductListPage) },
            { path: '/products/:slug', element: wrap(ProductDetailPage) },
            { path: '/settings', element: wrap(SettingsPage) },
            { 
                element: <ProtectedRoute />,
                children: [
                    { path: '/profile', element: wrap(ProfilePage) },
                    { path: '/profile/details', element: wrap(ProfileDetailPage) },
                    {
                        element: <AdminRoute />,
                        children: [
                            { path: '/admin/products', element: wrap(AdminProductListPage) },
                            { path: '/admin/products/new', element: wrap(AdminProductFormPage) },
                            { path: '/admin/products/bulk-upload', element: wrap(AdminBulkUploadPage) },
                            { path: '/admin/products/:id/edit', element: wrap(AdminProductFormPage) },
                        ],
                    },
                ],
            },
        ],
    },
    {
        element: <GuestRoute />,
        children: [
            { path: '/login', element: wrap(LoginPage) },
            { path: '/register', element: wrap(RegisterPage) },
        ],
    },
    { 
        element: <ProtectedRoute />, 
        children: [
            { path: '/protected', element: <Protected /> },
        ],
    },
    { path: '/oauth-callback', element: wrap(OAuthCallbackPage) },
    { path: '/forgot-password', element: wrap(ForgotPasswordPage) },
    { path: '/unauthorized', element: <div>403 - Access Denied</div> },
    { path: '*', element: <div>404 - Page Not Found</div> },
]);

export const AppRouter = () => <RouterProvider router={router} />;