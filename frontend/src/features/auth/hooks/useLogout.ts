import { useMutation } from '@tanstack/react-query';
import { useAuthContext } from '@/core/auth/AuthContext';
import { logoutUser } from '@/features/auth/services/authApi';

export const useLogout = () => {
    const { setUser } = useAuthContext();

    return useMutation({
        mutationFn: logoutUser,
        onSuccess: () => setUser(null),
    });
}