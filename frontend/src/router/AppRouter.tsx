import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage/LoginPage').then((m) => ({ default: m.LoginPage})));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const Home = lazy(() => import('@/features/home/pages/Home/Home').then((m) => ({ default: m.Home })));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const OAuthCallbackPage = lazy(() => import('@/features/auth/pages/OAuthCallbackPage/OAuthCallbackPage').then((m) => ({ default: m.OAuthCallbackPage })));
const ProtectedRoute = lazy(() => import('@/shared/components/ProtectedRoute/ProtectedRoute').then((m) => ({ default: m.ProtectedRoute })));
const Protected = lazy(() => import('@/shared/components/Protected/Protected').then((m) => ({ default: m.Protected })));

const wrap = (Component: React.ComponentType) => <Suspense fallback={null}><Component /></Suspense>;

const router = createBrowserRouter([
    { path: '/', element: <Home /> },
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