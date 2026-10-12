import axios from 'axios';

// Instance for the server, don't save session tokens, and not need interceptors
const httpClientServer = axios.create({
    baseURL: process.env.BACKEND_URL,
    timeout: 10_000,
});

export default httpClientServer;