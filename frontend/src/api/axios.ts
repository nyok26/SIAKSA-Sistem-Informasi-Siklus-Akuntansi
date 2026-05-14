import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT and Company ID to every request
api.interceptors.request.use((config) => {
  const { token, activeCompanyId } = useAuthStore.getState();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (activeCompanyId) config.headers['x-company-id'] = activeCompanyId;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
