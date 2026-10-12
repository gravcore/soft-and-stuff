import type { ReactNode } from 'react';
import { Package, ShoppingBag } from 'lucide-react';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
    brandTitle: string;
    brandSubtitle: string;
    title: string;
    subtitle: string;
    brandSide?: 'left' | 'right'; // control order on desktop
    children: ReactNode;
    footer: ReactNode;
}

export function AuthLayout({ brandTitle, brandSubtitle, title, subtitle, brandSide = 'right', children, footer }: AuthLayoutProps) {
    return (
        <div className={styles.page}>
            <div className={styles.brandPanel} style={{ order: brandSide === 'left' ? -1 : 0 }}>
                <div className={styles.brandContent}>
                    <div className={styles.brandBadge}><ShoppingBag size={28} strokeWidth={2} /></div>
                    <h2 className={styles.brandTitle}>{brandTitle}</h2>
                    <p className={styles.brandSubtitle}>{brandSubtitle}</p>
                </div>
            </div>

            <div className={styles.formPanel}>
                <div className={styles.wrap}>
                    <div className={styles.badge}><Package size={25} strokeWidth={2} /></div>
                    <h1 className={styles.title}>{title}</h1>
                    <p className={styles.subtitle}>{subtitle}</p>

                    <div className={styles.card}>{children}</div>

                    {footer}
                </div>
            </div>
        </div>
    );
}