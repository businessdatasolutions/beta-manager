import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Base path for the app (must match BrowserRouter basename)
const BASE_PATH = import.meta.env.PROD ? '/beta-manager' : '';

// Response interceptor for handling 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear any stored auth state and redirect to login
      // Don't redirect if already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = `${BASE_PATH}/login`;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
