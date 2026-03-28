export const APP_CONFIG = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api-blueprint-qshw.onrender.com/api/v1',
  appName: 'Admin Portal',
  version: '1.0.0',
} as const;
