import { isApiError } from '@/core/errors/api-error';
import type { NextRequest } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:5000/api/v1';

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const targetUrl = new URL(`${API_BASE_URL}/${path.join('/')}`);

  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  const forwardedHeaders = new Headers();
  const auth = request.headers.get('authorization');
  if (auth) forwardedHeaders.set('authorization', auth);
  const contentType = request.headers.get('content-type');
  if (contentType) forwardedHeaders.set('content-type', contentType);

  const hasBody = !['GET', 'HEAD'].includes(request.method);

  try {
    const upstream = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: forwardedHeaders,
      body: hasBody ? await request.text() : undefined,
    });

    const body = await upstream.text();
  
    return new Response(body, {
      status: upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type') ?? 'application/json',
      },
    });
  } catch (error) {
    if (isApiError(error)) {
      return new Response(
        JSON.stringify({ message: error.message }),
        {
          status: error.status,
          headers: { 'content-type': 'application/json' },
        },
      );
    }
  
    const err = error as Error & { cause?: NodeJS.ErrnoException };
    const code = err.cause?.code;
    const isFetchNetworkFailure =
      err instanceof TypeError &&
      (err.message === 'fetch failed' || err.message.includes('fetch'));
  
    if (isFetchNetworkFailure) {
      const isUnreachable =
        code === 'ECONNREFUSED' ||
        code === 'ENOTFOUND' ||
        code === 'EAI_AGAIN' ||
        code === 'ETIMEDOUT';
  
      const message = isUnreachable
        ? 'Cannot reach the API server. Is it running, and is API_BASE_URL correct?'
        : 'Request to the API server failed.';
  
      // 502 = bad gateway (proxy to upstream); 503 = service unavailable
      return new Response(JSON.stringify({ message, code: code ?? 'UNKNOWN' }), {
        status: 502,
        headers: { 'content-type': 'application/json' },
      });
    }
  
    return new Response(
      JSON.stringify({
        message: err.message ?? 'Internal server error',
      }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
