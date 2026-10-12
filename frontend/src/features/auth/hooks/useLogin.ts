import { useAuthContext } from "@/core/auth/AuthContext"
import { useMutation } from "@tanstack/react-query";
import { fetchCurrentUser, loginUser } from "../services/authApi";

export const useLogin = () => {
    const { setUser } = useAuthContext();

    return useMutation({
        mutationFn: loginUser,
        onSuccess: async () => setUser(await fetchCurrentUser()),
    });
}