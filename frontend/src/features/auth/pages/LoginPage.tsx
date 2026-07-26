import { useLogin } from '../hooks/useLogin';
import { useNavigate, Link } from 'react-router-dom';

export const LoginPage = () => {
    const navigate = useNavigate();
    const { mutate: login, isPending, error } = useLogin();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        login(
            { email: form.get('email') as string, password: form.get('password') as string },
            { onSuccess: () => navigate('/') }
        );
    };

    return (
        <div>
            <h1>Sign in</h1>
            <form onSubmit={handleSubmit}>
                <label>Email <input type="email" name='email' required autoComplete='email' /></label>
                <label>Password <input type="password" name='password' required autoComplete='current-password' /></label>
                { error && <p>{(error as Error).message}</p>}
                <button type="submit" disabled={isPending}>{isPending ? 'Signing in...' : 'Sign in' }</button>
            </form>
            <p>No account? <Link to="/register">Create one</Link></p>
        </div>
    );
};