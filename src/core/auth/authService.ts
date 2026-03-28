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

export interface AuthConfig {
  authMethod: 'email' | 'phone';
  passwordResetEnabled: boolean;
}

export interface SendOtpResponse {
  verificationId: string;
  expiresAt: number;
  resendIn: number;
}

export interface VerifyOtpResponse {
  subject: string;
  channel: string;
  verificationToken: string;
  expiresAt: number;
  hasAccount: boolean;
}

export const authService = {
  async getConfig(): Promise<AuthConfig> {
    return apiClient.get<AuthConfig>(ENDPOINTS.AUTH.CONFIG);
  },

  async login(payload: LoginPayload): Promise<AuthTokens> {
    const data = await apiClient.post<AuthTokens>(ENDPOINTS.AUTH.LOGIN, payload);
    useAuthStore.getState().setTokens(data.accessToken, data.refreshToken, data.expiresIn);
    return data;
  },

  async loginWithToken(verificationToken: string): Promise<AuthTokens> {
    const data = await apiClient.post<AuthTokens>(ENDPOINTS.AUTH.LOGIN, { verificationToken });
    useAuthStore.getState().setTokens(data.accessToken, data.refreshToken, data.expiresIn);
    return data;
  },

  async sendOtp(phone: string): Promise<SendOtpResponse> {
    const res = await apiClient.post<{ data: SendOtpResponse }>(ENDPOINTS.AUTH.SEND_OTP, { phone });
    return res.data;
  },

  async verifyOtp(verificationId: string, otp: string): Promise<VerifyOtpResponse> {
    const res = await apiClient.post<{ data: VerifyOtpResponse }>(ENDPOINTS.AUTH.VERIFY_OTP, { verificationId, otp });
    return res.data;
  },

  async resendOtp(verificationId: string): Promise<SendOtpResponse> {
    const res = await apiClient.post<{ data: SendOtpResponse }>(ENDPOINTS.AUTH.RESEND_OTP, { verificationId });
    return res.data;
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
