import { apiClient } from '@/core/api/apiClient';
import { ENDPOINTS } from '@/core/api/endpoints';
import { useAuthStore } from '@/store/auth.store';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthTokens> {
    const data = await apiClient.post<AuthTokens>(ENDPOINTS.AUTH.LOGIN, payload);
    useAuthStore.getState().setTokens(data.accessToken, data.refreshToken, data.expiresIn);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // always clear locally even if server fails
    } finally {
      useAuthStore.getState().logout();
    }
  },

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const data = await apiClient.post<AuthTokens>(ENDPOINTS.AUTH.REFRESH, { refreshToken });
    useAuthStore.getState().setTokens(data.accessToken, data.refreshToken, data.expiresIn);
    return data;
  },
};
