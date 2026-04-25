export const APP_CONFIG = {
  apiBaseUrl: process.env.API_BASE_URL ?? 'http://localhost:5000/api/v1',
  appName: process.env.APP_NAME ?? 'Blueprint Portal',
  version: process.env.APP_VERSION ?? '1.0.0',
  portalPort: process.env.PORT ?? 4000,
} as const;
