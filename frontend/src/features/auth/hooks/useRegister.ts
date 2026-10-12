import { useAuthContext } from "@/core/auth/AuthContext"
import { useMutation } from "@tanstack/react-query";
import { fetchCurrentUser, loginUser, registerUser } from "../services/authApi";

export const useRegister = () => {
    const { setUser } = useAuthContext();

    return useMutation({
        mutationFn: registerUser,
        onSuccess: async (_data, variables) => {
            // Login immediately after signup
            await loginUser({ email: variables.email, password: variables.password });
            setUser(await fetchCurrentUser());
        },
    });
};