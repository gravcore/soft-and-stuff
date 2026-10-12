import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useRequestOtp, useSetNewPassword, useVerifyOtp } from "../../hooks/useForgotPasswordFlow";
import { useForm } from "react-hook-form";
import { type ForgotPasswordInput, forgotPasswordSchema, type ResetPasswordInput, resetPasswordSchema, type VerifyOtpInput, verifyOtpSchema } from "../../schema/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParseApiError } from "@/shared/hooks/useParseApiError";
import { AuthLayout } from "@/shared/components/AuthLayout/AuthLayout";
import { ArrowLeft, Mail, Lock } from "lucide-react";
import { useState } from "react";
import styles from './ForgotPasswordPage.module.css';
import { FormField, type ZodFieldError } from "@/shared/components/FormField/FormField";
import { OtpTimer } from "../../components/OtpTimer/OtpTimer";
import { OtpInput } from "../../components/OtpInput/OtpInput";

type Step = 'email' | 'otp' | 'password';

export const ForgotPasswordPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [totalSeconds, setTotalSeconds] = useState(0);
    const [expiresAt, setExpiresAt] = useState<number | null>(null);

    const requestOtp = useRequestOtp();
    const verifyOtp = useVerifyOtp();
    const setNewPassword = useSetNewPassword();

    // --- Step 1: email ---
    const emailForm = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });
    const onSubmitEmail = (data: ForgotPasswordInput) => {
        requestOtp.mutate(data.email, {
            onSuccess: (res) => {
                setEmail(data.email);
                setExpiresAt(Date.now() + res.expiresInSeconds * 1000);
                setTotalSeconds(res.expiresInSeconds);
                setStep('otp');
            },
        });
    };

    // --- Step 2: otp + timer
    const otpForm = useForm<VerifyOtpInput>({ resolver: zodResolver(verifyOtpSchema) });
    const onSubmitOtp = (data: VerifyOtpInput) => {
        verifyOtp.mutate({ email, otp: data.otp }, {
            onSuccess: () => setStep('password')
        });
    };

    const resendOtp = () => {
        requestOtp.mutate(email, {
            onSuccess: (res) => {
                setExpiresAt(Date.now() + res.expiresInSeconds * 1000);
                setTotalSeconds(res.expiresInSeconds);
            }, 
        });
        otpForm.reset();
    };

    // --- Step 3: new password ---
    const passwordForm = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });
    const onSubmitPassword = (data: ResetPasswordInput) => {
        setNewPassword.mutate({ email, newPassword: data.newPassword }, {
            onSuccess: () => navigate('/login', { replace: true })
        });
    };

    const { codes: emailCodes, hasCodes: emailHasCodes, fallbackMessage: emailFallback } = useParseApiError(requestOtp.error);
    const { codes: otpCodes, hasCodes: otpHasCodes, fallbackMessage: otpFallback } = useParseApiError(verifyOtp.error);
    const { codes: pwCodes, hasCodes: pwHasCodes, fallbackMessage: pwFallback } = useParseApiError(setNewPassword.error);

    return (
        <AuthLayout 
            brandSide="right"
            brandTitle={t('auth.forgot.brandTitle')}
            brandSubtitle={t('auth.forgot.brandSubtitle')}
            title={t(`auth.forgot.${step}Title`)}
            subtitle={t(`auth.forgot.${step}Subtitle`)}
            footer={
                <p className={styles.footer}>
                    <Link to="/login" className={styles.link}><ArrowLeft size={14} /> {t('auth.forgot.backToLogin')}</Link>
                </p>
            }
        >
            {step === 'email' && (
                <form key="email" onSubmit={emailForm.handleSubmit(onSubmitEmail)} className={`${styles.form} ${styles.stepEnter}`} noValidate>
                    <FormField 
                        label={t('auth.common.email')} icon={Mail} type="email"
                        placeholder={t('auth.common.emailPlaceholder')} autoComplete="email"
                        error={emailForm.formState.errors.email}
                        {...emailForm.register('email')}
                    />
                    {requestOtp.error && (
                        emailHasCodes ? 
                            <ul className={styles.errorList}>
                                {emailCodes.map((c, i) => <li key={i} className={styles.error}>{t(`auth.errors.${c}`, c)}</li>)}
                            </ul>
                        : <p className={styles.error}>{emailFallback}</p>
                    )}
                    <button type="submit" className={styles.submit} disabled={requestOtp.isPending}>
                        {requestOtp.isPending ? t('auth.forgot.sending') : t('auth.forgot.sendCode')}
                    </button>
                </form>
            )}

            {step === 'otp' && (
                <div key="otp" className={styles.stepEnter}>
                    <p className={styles.sentTo}>{t('auth.forgot.codeSentTo')} <strong>{email}</strong></p>

                    <OtpTimer 
                        expiresAt={expiresAt} totalSeconds={totalSeconds}
                        onExpire={() => otpForm.setError('otp', { message: t('auth.forgot.codeExpired') })}
                    />

                    <form onSubmit={otpForm.handleSubmit(onSubmitOtp)} className={styles.form} noValidate>
                        <OtpInput 
                            onChange={(val) => otpForm.setValue('otp', val, { shouldValidate: true })}
                            error={!!otpForm.formState.errors.otp}
                        />
                        
                        {otpForm.formState.errors.otp && <p className={styles.error}>{t(`auth.errors.${(otpForm.formState.errors.otp as ZodFieldError).params?.code}`, otpForm.formState.errors.otp.message ?? '')}</p> }

                        {verifyOtp.error && (
                            otpHasCodes ?
                                <ul className={styles.errorList}>
                                    {otpCodes.map((c, i) => <li key={i} className={styles.error}>{t(`auth.errors.${c}`, c)}</li>)}
                                </ul>
                            : 
                                <p className={styles.error}>{otpFallback}</p>
                        )}

                        <button type="submit" className={styles.submit} disabled={verifyOtp.isPending}>
                            {verifyOtp.isPending ? t('auth.forgot.verifying') :  t('auth.forgot.verify')}
                        </button>
                        <button type="button" className={styles.resend} onClick={resendOtp} disabled={requestOtp.isPending}>
                            {t('auth.forgot.resendCode')}
                        </button>
                    </form>
                </div>
            )}

            {step === 'password' && (
                <form key="password" onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className={`${styles.form} ${styles.stepEnter}`} noValidate>
                    <FormField
                        label={t('auth.forgot.newPassword')} icon={Lock} type="password"
                        placeholder={t('auth.forgot.newPasswordPlaceholder')} autoComplete="new-password"
                        error={passwordForm.formState.errors.newPassword}
                        {...passwordForm.register('newPassword')}
                    />
                    <FormField
                        label={t('auth.forgot.confirmPassword')} icon={Lock} type="password"
                        placeholder={t('auth.forgot.confirmPasswordPlaceholder')} autoComplete="new-password"
                        error={passwordForm.formState.errors.confirmPassword}
                        {...passwordForm.register('confirmPassword')}
                    />
                    {setNewPassword.error && (
                        pwHasCodes ?
                            <ul className={styles.errorList}>
                                {pwCodes.map((c, i) => <li key={i} className={styles.error}>{t(`auth.errors.${c}`, c)}</li>)}
                            </ul>
                        : 
                            <p className={styles.error}>{pwFallback}</p>
                    )}
                    <button type="submit" className={styles.submit} disabled={setNewPassword.isPending}>
                        {setNewPassword.isPending ? t('auth.forgot.saving') : t('auth.forgot.savePassword')}
                    </button>
                </form>
            )}
        </AuthLayout>
    );
};