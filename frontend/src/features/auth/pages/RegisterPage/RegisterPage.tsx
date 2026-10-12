import { useForm } from 'react-hook-form';
import { zodResolver } from '@/shared/utils/zodResolverWithCode';
import { useRegister } from '../../hooks/useRegister';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Mail, Lock, User, ShoppingBag } from 'lucide-react';
import { registerSchema, type RegisterInput  } from '../../schema/authSchema';
import styles from './RegisterPage.module.css';
import { FormField } from '@/shared/components/FormField/FormField';
import { useParseApiError } from '@/shared/hooks/useParseApiError';
import { useTranslation } from 'react-i18next';

export const RegisterPage = () => {
    const navigate = useNavigate();
    const { mutate: registerUser, isPending, error } = useRegister();
    const { t } = useTranslation();

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        mode: 'onChange',
    });

    const onSubmit = (data: RegisterInput) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { confirmPassword: _confirmPassword, ...payload } = data;
        registerUser(payload, { onSuccess: () => navigate('/') });
    };

    const { codes, hasCodes, fallbackMessage } = useParseApiError(error);

    return (
        <div className={styles.page}>
            <div className={styles.brandPanel}>
                <div className={styles.brandContent}>
                    <div className={styles.brandBadge}>
                        <ShoppingBag size={28} strokeWidth={2} />
                    </div>

                    <h2 className={styles.brandTitle}>{t('auth.register.brandTitle')}</h2>
                    <p className={styles.brandSubtitle}>{t('auth.register.brandSubtitle')}</p>
                </div>
            </div>

            <div className={styles.formPanel}>
                <div className={styles.wrap}>
                    <div className={styles.badge}>
                        <Package size={16} strokeWidth={2} />
                    </div>

                    <h1 className={styles.title}>{t('auth.register.title')}</h1>
                    <p className={styles.subtitle}>{t('auth.register.subtitle')}</p>

                    <div className={styles.card}>
                        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
                            <div className={styles.row}>
                                <FormField label={t('auth.register.firstName')} icon={User} placeholder={t('auth.register.firstNamePlaceholder')} autoComplete='given-name' error={errors.firstName} {...register('firstName')} />
                                <FormField label={t('auth.register.lastName')} icon={User} placeholder={t('auth.register.lastNamePlaceholder')} autoComplete='family-name' {...register('lastName')} />
                            </div>

                            <FormField label={t('auth.common.email')} icon={Mail} type='email' placeholder={t('auth.common.emailPlaceholder')} autoComplete='email' error={errors.email} {...register('email')} />
                            <FormField label={t('auth.common.password')} icon={Lock} type='password' placeholder={t('auth.register.passwordPlaceholder')} autoComplete='new-password' error={errors.password} {...register('password')} />
                            <FormField label={t('auth.register.confirmPassword')} icon={Lock} type='password' placeholder={t('auth.register.confirmPasswordPlaceholder')} autoComplete='new-password' error={errors.confirmPassword} {...register('confirmPassword')} />

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
                                {isPending ? t('auth.register.submitting') : t('auth.register.submit')}
                            </button>
                        </form>
                    </div>
                    
                    <p className={styles.footer}>
                        {t('auth.register.hasAccount')} <Link to='/login' className={styles.link}>{t('auth.register.signIn')}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};