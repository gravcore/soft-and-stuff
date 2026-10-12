export type Access = 'public' | 'guest' | 'auth' | 'admin';

export type RouteRule = { access: Access; localePrefix: 'as-needed' | 'never' };

export const ROUTE_RULES: Record<string, RouteRule> = {
    '/':                    { access: 'public', localePrefix: 'as-needed' },
    '/produts':             { access: 'public', localePrefix: 'as-needed' },
    '/login':               { access: 'guest',  localePrefix: 'never'     },
    '/register':            { access: 'guest',  localePrefix: 'never'     },
    '/forgot-password':     { access: 'public', localePrefix: 'never'     },
    '/oauth-callback':      { access: 'public', localePrefix: 'never'     },
    '/unauthorized':        { access: 'public', localePrefix: 'never'     },
    '/cart':                { access: 'public', localePrefix: 'never'     },
    '/checkout':            { access: 'public', localePrefix: 'never'     },
    '/order-confirmation':  { access: 'public', localePrefix: 'never'     },
    '/order-status':        { access: 'public', localePrefix: 'never'     },
    '/profile':             { access: 'auth',   localePrefix: 'never'     },
    '/admin':               { access: 'admin',  localePrefix: 'never'     },
}

const DEFAULT_RULE: RouteRule = { access: 'public', localePrefix: 'as-needed' };

export function resolveRoute(pathname: string): RouteRule {
    if (pathname === '/' || pathname.startsWith('/?')) return ROUTE_RULES['/']; // exact comparation to avoid match others that contain '/'

    // Find best coincidence of the rule
    let bestKey = '';
    for (const key of Object.keys(ROUTE_RULES)) {
        if (key === '/') continue; // skips home rule, already solved above

        const matches = pathname === key || pathname.startsWith(`${key}/`) || pathname.startsWith(`${key}?`) || pathname.startsWith(`${key}#`); // exact or start comparation

        // Wins the bigger rule key coincidence
        if (matches && key.length > bestKey.length) bestKey = key;
    }

    return bestKey ? ROUTE_RULES[bestKey] : DEFAULT_RULE;
}