import axios from 'axios';

// In production (no VITE_API_URL), use relative paths (same origin)
// In development, use localhost backend
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8080' : '');

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Note: 401 errors are handled by the auth store and ProtectedRoute component
// No interceptor redirect needed - React Router handles navigation

export default apiClient;
