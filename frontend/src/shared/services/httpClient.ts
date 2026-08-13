import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const httpClient: AxiosInstance = axios.create({
    baseURL: `${BASE_URL}/api/v1`,
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
                const { data } = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {}, { withCredentials: true, headers: { 'X-CSRF-Token': await ensureCsrfToken() } });
                setAccessToken(data.data.accessToken);
                original.headers.Authorization = `Bearer ${data.data.accessToken}`;
                return httpClient(original);
            } catch {
                setAccessToken(null);
            };
        }

        return Promise.reject(error);
    }
);

// ====== CSRF protection ======
let csrfToken: string | null = null;

async function ensureCsrfToken() {
    if (csrfToken) return csrfToken;
    const { data } = await axios.get(`${BASE_URL}/api/v1/auth/csrf-token`, { withCredentials: true });
    csrfToken = data.token;
    return csrfToken;
}

httpClient.interceptors.request.use(async (config) => {
    if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
        config.headers['X-CSRF-Token'] = await ensureCsrfToken();
    }
    return config;
});

httpClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 403 && !csrfToken && !error.config._csrfRetry) {
            error.config._csrfRetry = true;
            csrfToken = null;
            error.config.headers['X-CSRF-Token'] = await ensureCsrfToken();
            return httpClient(error.config); // retry
        }
        return Promise.reject(error);
    }
);
// ====== CSRF protection ======

export default httpClient;