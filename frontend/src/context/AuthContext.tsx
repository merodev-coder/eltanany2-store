// frontend/src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosClient, { markUserAuthenticated, markAdminAuthenticated, clearAuthState } from '@/api/axiosClient';
import { getGuestCartItems, clearGuestCartCookies } from '@/utils/guestCart';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Using local state - sync with localStorage markers
  // Restore session: only call /auth/me if auth marker exists
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    isLoading: true,
  });

  useEffect(() => {
    const restoreSession = async () => {
      const hasUserSession = localStorage.getItem('auth_state') !== null;
      const hasAdminSession = localStorage.getItem('admin_auth_state') !== null;

      if (!hasUserSession && !hasAdminSession) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      if (hasUserSession) {
        try {
          const response = await axiosClient.get('/users/auth/me');
          if (response.data.success) {
            setState({
              user: response.data.data.user,
              isAuthenticated: true,
              isAdmin: response.data.data.isAdmin || false,
              isLoading: false,
            });
            return;
          }
        } catch {
          localStorage.removeItem('auth_state');
        }
      }

      if (hasAdminSession) {
        try {
          const adminResponse = await axiosClient.get('/admin/auth/me');
          if (adminResponse.data.success) {
            setState({
              user: adminResponse.data.data.admin,
              isAuthenticated: true,
              isAdmin: true,
              isLoading: false,
            });
            return;
          }
        } catch {
          localStorage.removeItem('admin_auth_state');
        }
      }

      setState((prev) => ({ ...prev, isLoading: false }));
    };

    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await axiosClient.post('/users/auth/login', { email, password });
      if (response.data.success) {
        markUserAuthenticated();

        // ── Sync guest cart to server on login ──────────
        const guestItems = getGuestCartItems();
        if (guestItems.length > 0) {
          try {
            await axiosClient.post('/users/cart/guest', { items: guestItems });
            clearGuestCartCookies();
          } catch (cartErr) {
            console.warn('Failed to sync guest cart on login:', cartErr);
          }
        }

        setState({
          user: response.data.data.user,
          isAuthenticated: true,
          isAdmin: response.data.data.isAdmin || false,
          isLoading: false,
        });
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  }, []);

  const adminLogin = useCallback(async (email: string, password: string) => {
    try {
      const response = await axiosClient.post('/admin/auth/login', { email, password });
      if (response.data.success) {
        markAdminAuthenticated();
        setState({
          user: response.data.data.admin,
          isAuthenticated: true,
          isAdmin: true,
          isLoading: false,
        });
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Admin login failed',
      };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, phone?: string) => {
    try {
      const response = await axiosClient.post('/users/auth/register', { name, email, password, phone });
      if (response.data.success) {
        markUserAuthenticated();

        // ── Sync guest cart to server on register ──────
        const guestItems = getGuestCartItems();
        if (guestItems.length > 0) {
          try {
            await axiosClient.post('/users/cart/guest', { items: guestItems });
            clearGuestCartCookies();
          } catch (cartErr) {
            console.warn('Failed to sync guest cart on register:', cartErr);
          }
        }

        setState({
          user: response.data.data.user,
          isAuthenticated: true,
          isAdmin: response.data.data.isAdmin || false,
          isLoading: false,
        });
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await Promise.allSettled([
        axiosClient.post('/users/auth/logout'),
        axiosClient.post('/admin/auth/logout'),
      ]);
    } catch {
      // ignore
    } finally {
      clearAuthState();
      setState({ user: null, isAuthenticated: false, isAdmin: false, isLoading: false });
    }
  }, []);

  const updateUser = useCallback((user: User) => {
    setState((prev) => ({ ...prev, user }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, adminLogin, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
