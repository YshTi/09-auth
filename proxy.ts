import { NextRequest, NextResponse } from 'next/server';

import { checkSession } from './lib/api/serverApi';

const privateRoutes = ['/profile', '/notes'];
const authRoutes = ['/sign-in', '/sign-up'];

const setAuthCookies = (
  response: NextResponse,
  setCookieHeader: string | string[] | undefined,
): void => {
  if (!setCookieHeader) return;

  const cookies = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : [setCookieHeader];

  for (const cookieStr of cookies) {
    const [cookiePair] = cookieStr.split(';');
    const [name, ...valueParts] = cookiePair.split('=');
    const value = valueParts.join('=');

    if (!name || !value) continue;

    if (name === 'accessToken' || name === 'refreshToken') {
      response.cookies.set(name, value, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
    }
  }
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPrivateRoute = privateRoutes.some(route =>
    pathname.startsWith(route),
  );

  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  let isAuthenticated = Boolean(accessToken);
  let refreshedCookies: string | string[] | undefined;

  if (!accessToken && refreshToken) {
    try {
      const sessionResponse = await checkSession(
        request.headers.get('cookie') ?? '',
      );

      if (sessionResponse.data.success) {
        isAuthenticated = true;
        refreshedCookies = sessionResponse.headers['set-cookie'];
      }
    } catch {
      isAuthenticated = false;
    }
  }

  if (!isAuthenticated && isPrivateRoute) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (isAuthenticated && isAuthRoute) {
    const redirectResponse = NextResponse.redirect(new URL('/', request.url));
    setAuthCookies(redirectResponse, refreshedCookies);
    return redirectResponse;
  }

  const response = NextResponse.next();
  setAuthCookies(response, refreshedCookies);

  return response;
}

export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};