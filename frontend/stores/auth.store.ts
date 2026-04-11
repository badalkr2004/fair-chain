import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  login: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isHydrated: false,

  login: (user, token, refreshToken) => {
    localStorage.setItem('fc_token', token);
    localStorage.setItem('fc_user', JSON.stringify(user));
    if (refreshToken) localStorage.setItem('fc_refresh_token', refreshToken);
    set({ user, token, refreshToken: refreshToken || null, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('fc_token');
    localStorage.removeItem('fc_refresh_token');
    localStorage.removeItem('fc_user');
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
  },

  setUser: (user) => {
    localStorage.setItem('fc_user', JSON.stringify(user));
    set({ user });
  },

  hydrate: () => {
    if (typeof window === 'undefined') {
      set({ isHydrated: true });
      return;
    }
    const token = localStorage.getItem('fc_token');
    const refreshToken = localStorage.getItem('fc_refresh_token');
    const userStr = localStorage.getItem('fc_user');
    const user = userStr ? JSON.parse(userStr) : null;
    set({
      user,
      token,
      refreshToken,
      isAuthenticated: !!token && !!user,
      isHydrated: true,
    });
  },
}));
