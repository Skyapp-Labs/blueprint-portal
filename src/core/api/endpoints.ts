export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    SESSIONS: '/auth/sessions',
    REVOKE_SESSION: (id: string) => `/auth/sessions/${id}/revoke`,
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ME: '/users/me',
  },
  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    DEACTIVATE: (id: string) => `/users/${id}/deactivate`,
    ACTIVATE: (id: string) => `/users/${id}/activate`,
    INVITE: '/users/invite',
    RESEND_INVITE: (id: string) => `/users/${id}/resend-invite`,
    REVOKE_INVITE: (id: string) => `/users/${id}/invite`,
  },
  // Settings
  SETTINGS: {
    BASE: '/settings',
    BY_KEY: (key: string) => `/settings/${key}`,
  },
} as const;
