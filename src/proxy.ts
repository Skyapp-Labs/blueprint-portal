import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Read persisted auth from cookie / localStorage via a special cookie we set
  const authCookie = request.cookies.get('admin-auth');
  let isAuthenticated = false;

  if (authCookie?.value) {
    try {
      const parsed = JSON.parse(decodeURIComponent(authCookie.value)) as {
        state?: { isAuthenticated?: boolean; expiresAt?: number };
      };
      const state = parsed.state;
      isAuthenticated =
        !!state?.isAuthenticated &&
        (state.expiresAt ? state.expiresAt > Date.now() : true);
    } catch {
      isAuthenticated = false;
    }
  }

  if (!isPublic && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublic && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/users', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
