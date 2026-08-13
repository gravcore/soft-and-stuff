import { useAuthContext } from "@/core/auth/AuthContext";

export function Home() {
    const { user } = useAuthContext();
    
    return (
        <div>
            <h1>Welcome - Home</h1>
            <p>Hi, {user ? user.firstName : 'person'}</p>
            { user && <img src={user.avatarUrl ?? ''} alt={user.firstName} /> }
            { user && <img src={user.avatarUrl ?? ''} alt={user.firstName} /> }
            { user && <img src={user.avatarUrl ?? ''} alt={user.firstName} /> }
            { user && <img src={user.avatarUrl ?? ''} alt={user.firstName} /> }
            { user && <img src={user.avatarUrl ?? ''} alt={user.firstName} /> }
            { user && <img src={user.avatarUrl ?? ''} alt={user.firstName} /> }
            { user && <img src={user.avatarUrl ?? ''} alt={user.firstName} /> }
            { user && <img src={user.avatarUrl ?? ''} alt={user.firstName} /> }
            { user && <img src={user.avatarUrl ?? ''} alt={user.firstName} /> }
            { user && <img src={user.avatarUrl ?? ''} alt={user.firstName} /> }
            { user && <img src={user.avatarUrl ?? ''} alt={user.firstName} /> }
            { user && <img src={user.avatarUrl ?? ''} alt={user.firstName} /> }
            { user && <img src={user.avatarUrl ?? ''} alt={user.firstName} /> }
            { user && <img src={user.avatarUrl ?? ''} alt={user.firstName} /> }
            { user && <img src={user.avatarUrl ?? ''} alt={user.firstName} /> }
            { user && <img src={user.avatarUrl ?? ''} alt={user.firstName} /> }
            { user && <img src={user.avatarUrl ?? ''} alt={user.firstName} /> }
            { user && <img src={user.avatarUrl ?? ''} alt={user.firstName} /> }
            { user && <img src={user.avatarUrl ?? ''} alt={user.firstName} /> }
            { user && <img src={user.avatarUrl ?? ''} alt={user.firstName} /> }
        </div>
    );
}