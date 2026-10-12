import { useForm } from 'react-hook-form';
import { zodResolver } from '@/shared/utils/zodResolverWithCode';
import { useLogin } from '../../hooks/useLogin';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Mail, Lock, ShoppingBag } from 'lucide-react';
import { loginSchema, type LoginInput  } from '../../schema/authSchema';
import styles from './LoginPage.module.css';
import { useParseApiError } from '@/shared/hooks/useParseApiError';
import { useTranslation } from 'react-i18next';
import { useGoogleButton } from '../../hooks/useGoogleButton';

export const LoginPage = () => {
    const navigate = useNavigate();
    const { mutate: login, isPending, error } = useLogin();
    const { t } = useTranslation();
    const googleButtonRef = useGoogleButton();

    const { register, handleSubmit, formState: { errors }} = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        mode: 'onBlur', // Checks until the user clicks/tabs
    });

    const onSubmit = (data: LoginInput) => {
        login(data, { onSuccess: () => navigate('/') });
    }

    const { codes, hasCodes, fallbackMessage } = useParseApiError(error);

    return(
        <div className={styles.page}>
            <div className={styles.brandPanel}>
                <div className={styles.brandContent}>
                    <div className={styles.brandBadge}>
                       <ShoppingBag size={28} strokeWidth={2} />
                    </div>
                    <h2 className={styles.brandTitle}>{t('auth.login.brandTitle')}</h2>
                    <p className={styles.brandSubtitle}>{t('auth.login.brandSubtitle')}</p>
                </div>
            </div>

            <div className={styles.formPanel}>
                <div className={styles.wrap}>
                    <div className={styles.badge}>
                        <Package size={26} strokeWidth={2} />
                    </div>
                    <h1 className={styles.title}>{t('auth.login.title')}</h1>
                    <p className={styles.subtitle}>{t('auth.login.subtitle')}</p>

                    <div className="mb-5" ref={googleButtonRef} />

                    <div className={styles.card}>
                        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
                            <label className={styles.field}>
                                <span className={styles.fieldLabel}>{t('auth.common.email')}</span>
                                <span className={`${styles.inputWrap} ${errors.email ? styles.inputWrapError : ''}`}>
                                    <Mail size={18} className={styles.inputIcon} />
                                    <input
                                        {...register('email')} 
                                        type="email"
                                        placeholder={t('auth.common.emailPlaceholder')}
                                        autoComplete='email'
                                        className={styles.input} 
                                    />
                                </span>
                                {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
                            </label>

                            <label className={styles.field}>
                                <span className={styles.fieldLabel}>{t('auth.common.password')}</span>
                                <span className={`${styles.inputWrap} ${errors.password ? styles.inputWrapError : ''}`}>
                                    <Lock size={18} className={styles.inputIcon} />
                                    <input
                                        {...register('password')} 
                                        type="password"
                                        placeholder={t('auth.login.passwordPlaceholder')}
                                        autoComplete='current-password'
                                        className={styles.input}
                                    />
                                </span>
                                {errors.password && <span className={styles.fieldError}>{errors.password.message}</span>}
                            </label>

                            <Link to='/forgot-password' className={styles.forgot}>{t('auth.login.forgotPassword')}</Link>

                            {error && (
                                hasCodes ? (
                                    <ul className={styles.errorList}>
                                        {codes.map((code, i) => <li key={i} className={styles.error}>{t(`auth.errors.${code}`, code)}</li>)}
                                    </ul>
                                ) : (
                                    <p className={styles.error}>{fallbackMessage}</p>
                                )
                            )}

                            <button type="submit" disabled={isPending} className={styles.submit}>
                                {isPending ? t('auth.login.submitting') : t('auth.login.submit')}
                            </button>
                        </form>
                    </div>

                    <div className={styles.divider}><span>{t('auth.login.orContinueWith')}</span></div>

                    <div className={styles.social}>
                        <button
                            type='button'
                            className={styles.socialBtn}
                            onClick={() => { window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/google`; }}
                        >
                            {t('auth.common.google')}
                        </button>
                        <button className={styles.socialBtn}>{t('auth.common.apple')}</button>
                    </div>

                    <div className={styles.footer}>
                        {t('auth.login.noAccount')} <Link to='/register' className={styles.link}>{t('auth.login.createOne')}</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

