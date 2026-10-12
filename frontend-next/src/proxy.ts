import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing, routingNoPrefix } from '@/i18n/routing';
import { resolveRoute } from './routeAccess';

// Create an instance of next-intl middleware to add language
const intlPrefixed = createMiddleware(routing);
const intlNoPrefix = createMiddleware(routingNoPrefix);

export default async function proxy(request: NextRequest) {
    
    // Take off the language part of the path
    const { pathname } = request.nextUrl; // pathname with language /es/products
    const localePattern = new RegExp(`^/(${routing.locales.join('|')})(?=/|$)`); // finds /es/
    const pathnameWithoutLocale = pathname.replace(localePattern, '') || '/'; // replace /es -> /products

    const rule = resolveRoute(pathnameWithoutLocale); // Get the rule for this path

    // Check session
    const refreshToken = request.cookies.get('refreshToken')?.value;
    const hasSession = Boolean(refreshToken);

    // Only guests allowed
    if (rule.access === 'guest' && hasSession) {
        return NextResponse.redirect(new URL('/profile', request.url));
    }

    // User not logged-in
    if ((rule.access === 'auth' || rule.access === 'admin') && !hasSession) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('next', pathnameWithoutLocale); // next saves where the user wanted to go without language prefix
        return NextResponse.redirect(loginUrl);
    }

    // User is not admin
    if (rule.access === 'admin') {

        // Check user info
        const meResponse = await fetch(`${process.env.BACKEND_URL}/api/v1/auth/me`, {
            headers: { cookie: request.headers.get('cookie') ?? '' },
        });

        // Return to login if user has no valid session
        if (!meResponse.ok) {
            const loginRedirect = NextResponse.redirect(new URL('/login', request.url));
            
            // If refreshToken is invalid, delete it
            if (meResponse.status === 401 || meResponse.status === 403) {
                loginRedirect.cookies.delete('refreshToken');
            }

            return loginRedirect;            
        }

        // Valid session but check if is admin
        const { data } = await meResponse.json() as unknown as { data: { user: { role: string } } };
        if (data.user.role !== 'admin') {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
    }

    return (rule.localePrefix === 'never' ? intlNoPrefix : intlPrefixed)(request); // add language prefix if needed or never on this request
}

export const config = {
    matcher: ['/((?!api|_next|.*\\..*).*)'],
}