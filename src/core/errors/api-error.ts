export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly message: string,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}
