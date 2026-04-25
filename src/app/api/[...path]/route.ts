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
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
