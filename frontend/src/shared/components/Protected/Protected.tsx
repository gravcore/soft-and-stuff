import { useAuthContext } from "@/core/auth/AuthContext";

export function Protected() {
    const { user } = useAuthContext();

    return (
        <div>
            <div>Home protected</div>
            {user ? <div><p>Logged in as: {user.firstName} {user.email}</p> {user.avatarUrl && (<img src={user.avatarUrl} />)}</div> : <p>Not logged in</p>}
        </div>
    );
}