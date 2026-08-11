import { useEffect, useState } from "react";
import styles from './OtpTimer.module.css';
import { useTranslation } from "react-i18next";

interface OtpTimerProps {
    expiresAt: number | null;
    totalSeconds: number;
    onExpire: () => void;
}

export function OtpTimer({ expiresAt, totalSeconds, onExpire }: OtpTimerProps) {
    const [secondsLeft, setSecondsLeft] = useState(0);
    const { t } = useTranslation();

    useEffect(() => {
        if (!expiresAt) return;
        const tick = () => {
            const left = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
            setSecondsLeft(left);
            if (left === 0) {
                onExpire();
                clearInterval(interval); // stop ticking once expired
            }
        };
        tick();

        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [expiresAt, onExpire]);

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const percentLeft = (secondsLeft / totalSeconds) * 100;
    const urgent = secondsLeft <= 30; // For turning red last 30s

    return (
        <div className={styles.wrap}>
            <div className={styles.barTrack}>
                <div
                    className={`${styles.barFill} ${urgent ? styles.urgent : ''}`}
                    style={{ width: `${percentLeft}%` }}
                >
                </div>
            </div>
            <span className={`${styles.time} ${urgent ? styles.urgentText : ''}`}>
                {secondsLeft > 0
                    ? `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
                    : t('auth.forgot.expired')
                }
            </span>
        </div>          
    );
};