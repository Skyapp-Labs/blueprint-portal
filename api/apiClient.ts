import { APP_CONFIG } from '@/config/app.config';
import { ApiError } from '@/core/errors/api-error';
import { useAuthStore } from '@/store/auth.store';

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
};

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${APP_CONFIG.apiBaseUrl}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

async function parseResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      (isJson && typeof body === 'object' && body !== null && 'message' in body)
        ? String((body as Record<string, unknown>).message)
        : res.statusText;
    throw new ApiError(res.status, message, body);
  }

  return body as T;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...init } = options;
  const token = useAuthStore.getState().accessToken;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(buildUrl(path, params), { ...init, headers });

  // Auto-refresh on 401
  if (res.status === 401 && token) {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (refreshToken) {
      try {
        const refreshRes = await fetch(buildUrl('/auth/refresh'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json() as { accessToken: string; refreshToken: string; expiresIn: number };
          useAuthStore.getState().setTokens(data.accessToken, data.refreshToken, data.expiresIn);
          headers['Authorization'] = `Bearer ${data.accessToken}`;
          const retryRes = await fetch(buildUrl(path, params), { ...init, headers });
          return parseResponse<T>(retryRes);
        }
      } catch {
        // ignore
      }
    }
    useAuthStore.getState().logout();
  }

  return parseResponse<T>(res);
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'DELETE' }),
};
