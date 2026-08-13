import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useMotionValueEvent, useTransform } from 'motion/react';
import { NAV_ITEMS } from './navItems';
import { ShoppingBag, type LucideIcon } from 'lucide-react';
import type { TFunction } from 'i18next';
import { useState } from 'react';

export function AppNav({ cartCount }: { cartCount?: number }) {
    const { t } = useTranslation();
    const { scrollY } = useScroll();

    // Desktop: transparent at top, blurred surface once scrolled
    const headerOpacity = useTransform(scrollY, [0, 80], [0, 0.7]); // Interpolates scroll values and opacity values
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
            </motion.nav>

            {/* desktop: left sidebar */}
            <motion.header 
                style={{
                    backgroundColor: useTransform(headerOpacity, (v) => `color-mix(in srgb, var(--surface) ${v * 100}%, transparent)`),
                    backdropFilter: useTransform(headerBlur, (v) => `blur(${v}px)`),
                }}
                className="hidden md:flex md:sticky md:top-0 md:z-40 md:items-center md:justify-between md:bg-surface/70 md:backdrop-blur-lg md:px-6 md:py-3">
                    <div className="flex items-center gap-2 font-semibold text-ink">
                        <ShoppingBag size={20} className='text-accent' />
                        Soft&Stuff
                    </div>
                    
                    <nav className="flex items-center gap-1">
                        {NAV_ITEMS.map((item) => <NavItem key={item.to} {...item} t={t} cartCount={cartCount} horizontal />)}
                    </nav>
            </motion.header>
        </>
    );
}

interface NavItemProps {
    to: string; icon: LucideIcon; labelKey: string; t: TFunction; cartCount?: number; horizontal?: boolean;
}

function NavItem({ to, icon: Icon, labelKey, t, cartCount, horizontal }: NavItemProps) {
    return (
        <NavLink 
            to={to}
            className={({ isActive }) => 
                `relative flex items-center gap-2 rounded-md transition-colors duration-200 
                ${horizontal ? 'px-3 py-2 text-sm' : 'flex-col px-3 py-1 text-[0.6875rem]'}
                ${isActive ? 'text-accent' : 'text-muted hover:text-ink'}`
            }
        >
            <span className="relative">
                <Icon size={horizontal ? 18 : 22} strokeWidth={2} />

                {to === '/cart' && cartCount ? (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4
                    items-center justify-center rounded-full bg-accent text-[0.625rem]
                    font-semibold text-white">
                        {cartCount}
                    </span>
                ) : null}
            </span>
            {t(labelKey)}
        </NavLink>
    );
}

