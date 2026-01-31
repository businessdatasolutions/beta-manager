import { create } from 'zustand';
import { login as apiLogin, logout as apiLogout, getMe, type LoginCredentials } from '../api/auth';

interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

// Get persisted email from localStorage
const getPersistedEmail = (): string | null => {
  try {
    return localStorage.getItem('auth_email');
  } catch {
    return null;
  }
};

// Persist email to localStorage
const persistEmail = (email: string | null): void => {
  try {
    if (email) {
      localStorage.setItem('auth_email', email);
    } else {
      localStorage.removeItem('auth_email');
    }
  } catch {
    // Ignore localStorage errors
  }
};

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  email: getPersistedEmail(),
  isLoading: true, // Start as loading to check auth on mount
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiLogin(credentials);
      persistEmail(response.email);
      set({
        isAuthenticated: true,
        email: response.email,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      set({
        isAuthenticated: false,
        email: null,
        isLoading: false,
        error: message,
      });
      persistEmail(null);
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await apiLogout();
    } catch {
      // Ignore logout errors - clear state anyway
    }
    persistEmail(null);
    set({
      isAuthenticated: false,
      email: null,
      isLoading: false,
      error: null,
    });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const user = await getMe();
      persistEmail(user.email);
      set({
        isAuthenticated: true,
        email: user.email,
        isLoading: false,
        error: null,
      });
      return true;
    } catch {
      persistEmail(null);
      set({
        isAuthenticated: false,
        email: null,
        isLoading: false,
        error: null,
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
