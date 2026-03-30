import { create } from 'zustand';
import { persist, type StorageValue } from 'zustand/middleware';

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

type PersistedAuth = Pick<AuthState, 'accessToken' | 'refreshToken' | 'expiresAt' | 'user' | 'isAuthenticated'>;

// Cookie-based storage so the proxy can read auth state server-side.
// Zustand persist wraps values as { state: T, version?: number } which
// matches exactly what proxy.ts parses via parsed.state.isAuthenticated.
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const cookieStorage = {
  getItem: (name: string): StorageValue<PersistedAuth> | null => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie
      .split('; ')
      .find((c) => c.startsWith(`${name}=`));
    if (!match) return null;
    try {
      return JSON.parse(decodeURIComponent(match.split('=').slice(1).join('=')));
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: StorageValue<PersistedAuth>) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Strict`;
  },
  removeItem: (name: string) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; path=/; max-age=0`;
  },
};

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
      storage: cookieStorage,
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
