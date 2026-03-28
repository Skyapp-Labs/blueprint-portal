import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  photoUrl?: string;
  roles: { name: string }[];
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  user: AdminUser | null;
  isAuthenticated: boolean;
  setTokens: (accessToken: string, refreshToken: string, expiresIn: number) => void;
  setUser: (user: AdminUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      user: null,
      isAuthenticated: false,

      setTokens: (accessToken, refreshToken, expiresIn) =>
        set({
          accessToken,
          refreshToken,
          expiresAt: Date.now() + expiresIn,
          isAuthenticated: true,
        }),

      setUser: (user) => set({ user }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'admin-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
