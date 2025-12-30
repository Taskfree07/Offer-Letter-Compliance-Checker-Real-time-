/**
 * API Helper - Axios instance with JWT token management
 * Automatically adds Authorization header to all requests
 */
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

console.log('🌐 API Base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          });

          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth API endpoints
export const authAPI = {
  // Register new user
  register: (email, password, name) =>
    api.post('/api/auth/register', { email, password, name }),

  // Login with email/password
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }),

  // Verify Microsoft OAuth token
  verifyMicrosoft: (accessToken) =>
    api.post('/api/auth/microsoft/verify', { access_token: accessToken }),

  // Get current user info
  getCurrentUser: () =>
    api.get('/api/auth/me'),

  // Update user profile
  updateProfile: (data) =>
    api.put('/api/auth/me', data),

  // Logout
  logout: () =>
    api.post('/api/auth/logout'),
};

// Document API endpoints (will be protected)
export const documentAPI = {
  // Upload document
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/onlyoffice/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Get document config
  getConfig: (docId) =>
    api.get(`/api/onlyoffice/config/${docId}`),

  // Get document variables
  getVariables: (docId) =>
    api.get(`/api/onlyoffice/variables/${docId}`),

  // Update variables
  updateVariables: (docId, variables) =>
    api.post(`/api/onlyoffice/update-variables/${docId}`, { variables }),
};
