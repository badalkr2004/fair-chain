import axios from 'axios';
import { API_URL } from './constants';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor — attach token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('fc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor — handle 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Try to refresh token
      const refreshToken = localStorage.getItem('fc_refresh_token');
      if (refreshToken && !error.config._retry) {
        error.config._retry = true;
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
          localStorage.setItem('fc_token', data.token);
          if (data.refreshToken) {
            localStorage.setItem('fc_refresh_token', data.refreshToken);
          }
          error.config.headers.Authorization = `Bearer ${data.token}`;
          return apiClient(error.config);
        } catch {
          // Refresh failed — clear auth
          localStorage.removeItem('fc_token');
          localStorage.removeItem('fc_refresh_token');
          localStorage.removeItem('fc_user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
