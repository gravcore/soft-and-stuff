import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser } from "../../services/authApi";
import { useAuthContext } from "@/core/auth/AuthContext";
import { Spinner } from "@/shared/components/Spinner/Spinner";

export function OAuthCallbackPage() {
    const navigate = useNavigate();
    const { setUser } = useAuthContext();
    const ranOnce = useRef(false); // blocks the 2nd StrictMode run from firing a duplicate refresh

    useEffect(() => {
        if (ranOnce.current) return;
        ranOnce.current = true;
        
        fetchCurrentUser()
            .then((user) => { 
                setUser(user); 
                localStorage.setItem('isLoggedIn', 'true');
                navigate('/', { replace: true }); 
            })
            .catch(() => navigate('/login', { replace: true }));
    }, [navigate, setUser]);

    return <Spinner />;
}
