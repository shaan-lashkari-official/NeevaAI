import axios from 'axios';
import { auth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Wait for Firebase Auth to be ready before getting token
function waitForAuth(): Promise<typeof auth.currentUser> {
    return new Promise((resolve) => {
        if (auth.currentUser) {
            resolve(auth.currentUser);
            return;
        }
        const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe();
            resolve(user);
        });
    });
}

// Add Firebase ID token to requests
api.interceptors.request.use(async (config) => {
    try {
        const user = auth.currentUser || (await waitForAuth());
        if (user) {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (err) {
        console.error('Failed to get Firebase token:', err);
    }
    return config;
});

// Handle 401 errors — don't redirect, let AuthContext handle it
api.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
