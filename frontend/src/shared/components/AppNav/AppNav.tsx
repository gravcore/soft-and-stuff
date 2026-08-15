import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useMotionValueEvent, useTransform, MotionValue } from 'motion/react';
import { NAV_ITEMS } from './navItems';
import { LogIn, ShoppingBag, type LucideIcon } from 'lucide-react';
import type { TFunction } from 'i18next';
import { useState } from 'react';
import { useAuthContext } from '@/core/auth/AuthContext';

export function AppNav({ cartCount }: { cartCount?: number }) {
    const { t } = useTranslation();
    const { scrollY } = useScroll();
    const { user } = useAuthContext();

    // Desktop: transparent at top, blurred surface once scrolled
    const headerOpacity = useTransform(scrollY, [0, 80], [0, 0.7]); // Interpolates scroll values and opacity values
    const iconSize = useTransform(scrollY, [0, 80], [35, 30]); // Interpolates scroll values and height values
    const headerPadding = useTransform(scrollY, [0, 80], [12, 8]);
    const headerBlur = useTransform(scrollY, [0, 80], [0, 16]); // Interpolates px of blur

    // Mobile: hide on scroll down, reveal on scroll up
    const [hidden, setHidden] = useState(false);
    useMotionValueEvent(scrollY, 'change', (current) => {
        const previous = scrollY.getPrevious() ?? 0;
        const diff = current - previous;
        if (current < 50) { setHidden(false); return; } // always show near the very top, avoids jitter on tiny scrolls
        if (diff > 0) setHidden(true); // scrolling down -> hide
        else if (diff < 0) setHidden(false); // scrolling up -> reveal
    });

    return (
        <>
            {/* mobile: fixed bottom bar */}
            <motion.nav 
                animate={{ y: hidden ? '100%' : '0%' }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="md:hidden fixed bottom-0 inset-x-0 z-40 flex justify-around border-t border-border bg-surface/70 backdrop-blur-lg py-2">
                    {NAV_ITEMS.map((item) => <NavItem key={item.to} {...item} t={t} cartCount={cartCount} />)}
                    
                    {user 
                        ? <NavItem key="/profile" to="/profile" imgUrl={user.avatarUrl ?? ''} imgAlt={user.firstName} labelKey="nav.profile" t={t} /> 
                        : (
                            <Link to="/login" className="flex flex-col items-center gap-1 px-3 py-1 text-[0.6875rem] text-accent">
                                <LogIn size={25} strokeWidth={2} />
                                {t('nav.login')}
                            </Link>
                        )
                    }
            </motion.nav>

            {/* desktop: left sidebar */}
            <motion.header 
                style={{
                    backgroundColor: useTransform(headerOpacity, (v) => `color-mix(in srgb, var(--surface) ${v * 100}%, transparent)`),
                    backdropFilter: useTransform(headerBlur, (v) => `blur(${v}px)`),
                    paddingTop: headerPadding, paddingBottom: headerPadding,
                }}
                className={`hidden md:flex md:w-full md:fixed md:top-0 md:z-40 md:items-center md:justify-between md:bg-surface/70 md:backdrop-blur-lg md:px-6`}>
                    <div className="flex items-center gap-2 font-semibold text-ink">
                        <ShoppingBag size={20} className='text-accent' />
                        <Link to="/">
                            {t('common.brandTitle')}
                        </Link>
                    </div>
                    
                    <nav className="flex items-center gap-1">
                        {NAV_ITEMS.map((item) => <NavItem key={item.to} {...item} t={t} cartCount={cartCount} horizontal />)}
                        
                        {user 
                            ? <NavItem key="/profile" to="/profile" imgUrl={user.avatarUrl ?? ''} imgAlt={user.firstName} iconSize={iconSize} t={t} horizontal /> 
                            : (
                                <Link to="/login" className="ml-2 flex items-center gap-1.5 rounded-full border border-accent px-3.5 y-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-white">
                                    <LogIn size={16} />
                                    {t('nav.login')}
                                </Link>
                            )
                        }
                    </nav>
            </motion.header>
        </>
    );
}

interface NavItemProps {
    to: string; icon?: LucideIcon; imgUrl?: string; imgAlt?: string; iconSize?: MotionValue<number>; labelKey?: string; t: TFunction; cartCount?: number; horizontal?: boolean;
}

function NavItem({ to, icon: Icon, imgUrl, imgAlt, iconSize, labelKey, t, cartCount, horizontal }: NavItemProps) {
    
    // Get the current active page from the browser
    const { pathname } = useLocation();
    const isActive = pathname === to || (to !== '/' && pathname.startsWith(`${to}/`));
        
    return (
        <NavLink
            to={to}
            className={`relative flex items-center gap-2 rounded-md transition-colors duration-200 
                ${horizontal ? 'px-3 py-2 text-sm' : 'flex-col px-3 py-1 text-[0.6875rem]'}
                ${isActive ? 'text-accent' : 'text-muted hover:text-ink'}`}
        >

            <span className="relative">
                {Icon && <Icon size={horizontal ? 18 : 22} strokeWidth={2} />}
                {imgUrl && <motion.img src={imgUrl} alt={imgAlt} style={horizontal && iconSize ? { width: iconSize, height: iconSize} : { width: 24, height: 24}}
                    className="rounded-full object-cover border border-border"
                />}

                {to === '/cart' && cartCount ? (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4
                    items-center justify-center rounded-full bg-accent text-[0.625rem]
                    font-semibold text-white">
                        {cartCount}
                    </span>
                ) : null}
            </span>

            {labelKey && t(labelKey)}
        </NavLink>
    );
}

