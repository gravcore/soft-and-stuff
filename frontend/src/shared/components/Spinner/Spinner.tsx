import styles from './Spinner.module.css';

export function Spinner() {
    return (
        <div className={styles.wrap}>
            <div className={styles.spinner}></div>
        </div>
    );
}