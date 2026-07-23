import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const httpClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10_000,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

let accessToken: string | null = null;
export const setAccessToken = (token: string | null) => { accessToken = token; };

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
});

httpClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;

        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;

            try {
                const { data } = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {}, { withCredentials: true });
                setAccessToken(data.data.accessToken);
                original.headers.Authorization = `Bearer ${data.data.accessToken}`;
                return httpClient(original);
            } catch {
                setAccessToken(null);
                window.location.href = '/login';
            };

            return Promise.reject(error);
        }
    }
);

export default httpClient;