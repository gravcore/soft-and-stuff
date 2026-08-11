import { forwardRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { FieldError } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import styles from './FormField.module.css';
import { useTranslation } from 'react-i18next';

export interface ZodFieldError extends FieldError {
    params?: { code?: string };
}

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    // React.InputHTMLAttributes<HTMLInputElement>
    // React     -> the React types namespace (comes from @types/react), where all these built-in prop-type helpers live
    // InputHTMLAttributes<T> -> a generic type built into React's types, describing every standard prop a real <input> element accepts (placeholder, type, autoComplete, name, value, onChange, onBlur, disabled, required, maxLength, etc.) - all already typed correctly by React itself, so we don't write them out by hand
    // <HTMLInputElement> -> the generic param telling InputHTMLAttributes exactly which DOM element's props to describe (as opposed to InputHTMLAttributes<HTMLTextAreaElement> or similar) - also what makes event types like onChange's event correctly typed as a ChangeEvent<HTMLInputElement>
    // extends -> FormFieldProps inherits ALL of those input props automatically, then adds label/icon/error on top - so this component accepts everything a real <input> would, plus our 3 custom ones
    
    label: string;
    icon: LucideIcon;
    error?: ZodFieldError;
}

// forwardRef function wrapper to inject ref through the component, mandatory to pass ref
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
    ({ label, icon: Icon, error, type, ...inputProps }, ref) => {
        const { t } = useTranslation();

        const [showPassword, setShowPassword] = useState(false);

        const isPassword = type === 'password';
        const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

        return(<label className={styles.field}>
            <span className={styles.fieldLabel}>{label}</span>
            <span className={`${styles.inputWrap} ${error ? styles.inputWrapError : ''}`}>
                <Icon size={18} className={styles.inputIcon} />
                <input {...inputProps} type={inputType} ref={ref} className={styles.input} />
                {isPassword && (
                    <button
                        type='button'
                        className={styles.togglePassword}
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? t('auth.register.hidePassword') : t('auth.register.showPassword')}
                        title={showPassword ? t('auth.register.hidePassword') : t('auth.register.showPassword')} 
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </span>

            {error && <span className={styles.fieldError}>{t(`auth.errors.${error.params?.code}`, error.message ?? '')}</span>}
        </label>)
});

// Readable name for this component in React DevTools
FormField.displayName = 'FormField';