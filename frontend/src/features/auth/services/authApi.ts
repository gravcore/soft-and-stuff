import httpClient, { setAccessToken } from "@/shared/services/httpClient";
import type { AuthUser } from "@/core/auth/AuthContext";

interface RegisterInput {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
}

interface LoginInput {
    email: string;
    password: string;
}

// Normalize snake_case coming from the backend
interface RawUser { id: string; email: string; user_role: 'customer' | 'admin'; first_name: string; last_name: string | null; }
const mapUser = (raw: RawUser): AuthUser => 
    ({ id: raw.id, email: raw.email, role: raw.user_role, firstName: raw.first_name, lastName: raw.last_name });

export const registerUser = async (input: RegisterInput): Promise<{user: AuthUser}> => {
    const { data } = await httpClient.post<{ data: { user: RawUser }}>('/auth/register', input);
    return { user: mapUser(data.data.user) };
};

export const loginUser = async (input: LoginInput): Promise<{ accessToken: string }> => {
    const { data } = await httpClient.post<{ data: { accessToken: string }}>('/auth/login', input);
    setAccessToken(data.data.accessToken);
    return data.data;
};

export const fetchCurrentUser = async (): Promise<AuthUser> => {
    const { data } = await httpClient.get<{ data: { user: RawUser }}>('/auth/me');
    return mapUser(data.data.user);
};

export const logoutUser = async (): Promise<void> => {
    await httpClient.post('/auth/logout');
    setAccessToken(null);
};
