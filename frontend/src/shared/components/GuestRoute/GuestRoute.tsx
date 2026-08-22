import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "@/core/auth/AuthContext";
import { Spinner } from "../Spinner/Spinner";

export function GuestRoute() {
    const { user, isLoading } = useAuthContext();

    if (isLoading) return <Spinner />
    if (user) return <Navigate to="/profile" />

    return <Outlet />
}