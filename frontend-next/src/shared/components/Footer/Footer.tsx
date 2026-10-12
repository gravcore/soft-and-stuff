import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="mt-16 border-t border-border px-6 py-10">
            <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-4">
                <div>
                    <p className="font-semibold text-ink">{t('common.brandTitle')}</p>
                    <p className="mt-2 text-xs text-muted">{t('footer.tagline', 'Everything, in one place')}</p>
                </div>
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{t('footer.shop', 'Shop')}</p>
                    <ul className="space-y-1.5 text-sm text-muted">
                        <li><Link to="/products" className="hover:text-ink">{t('nav.categories')}</Link></li>
                    </ul>
                </div>
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{t('footer.support', 'Support')}</p>
                    <ul className="space-y-1.5 text-sm text-muted">
                        <li><a href="#" className="hover:text-ink">{t('footer.contact', 'Contact')}</a></li>
                        <li><a href="#" className="hover:text-ink">{t('footer.returns', 'Returns')}</a></li>
                    </ul>
                </div>
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{t('footer.legal', 'Legal')}</p>
                    <ul className="space-y-1.5 text-sm text-muted">
                        <li><a href="#" className="hover:text-ink">{t('footer.privacy', 'Privacy Policy')}</a></li>
                        <li><a href="#" className="hover:text-ink">{t('footer.terms', 'Terms of Service')}</a></li>
                    </ul>
                </div>
            </div>
            <p className="mx-auto mt-8 max-w-6xl text-xs text-muted">© {new Date().getFullYear()} {t('common.brandTitle')}. {t('footer.rights', 'All rights reserved.')}</p>
        </footer>
    );
}