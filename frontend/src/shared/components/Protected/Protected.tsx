import { useAuthContext } from "@/core/auth/AuthContext";

export function Protected() {
    const { user } = useAuthContext();

    return (
        <div>
            <div>Home protected</div>
            {user ? <p>Logged in as: {user.firstName} {user.email}</p> : <p>Not logged in</p>}
        </div>
    );
}