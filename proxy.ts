import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'cookie';

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
    const parsed = parse(cookieStr);

    const options = {
      expires: parsed.Expires ? new Date(parsed.Expires) : undefined,
      path: parsed.Path,
      maxAge: parsed['Max-Age'] ? Number(parsed['Max-Age']) : undefined,
    };

    if (parsed.accessToken) {
      response.cookies.set('accessToken', parsed.accessToken, options);
    }

    if (parsed.refreshToken) {
      response.cookies.set('refreshToken', parsed.refreshToken, options);
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
  const response = NextResponse.next();

  if (!accessToken && refreshToken) {
    try {
      const sessionResponse = await checkSession(
        request.headers.get('cookie') ?? '',
      );

      if (sessionResponse.data.success) {
        isAuthenticated = true;
        setAuthCookies(response, sessionResponse.headers['set-cookie']);
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

    if (!accessToken && refreshToken) {
      try {
        const sessionResponse = await checkSession(
          request.headers.get('cookie') ?? '',
        );

        setAuthCookies(redirectResponse, sessionResponse.headers['set-cookie']);
      } catch {
        // Ignore refresh errors and continue redirect.
      }
    }

    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};