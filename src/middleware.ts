import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'super-secret-ecommerce-demo-key-at-least-32-chars!'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect Admin Pages (/admin/...)
  if (pathname.startsWith('/admin')) {
    const token =
      request.cookies.get('nexa_auth_token')?.value ||
      request.cookies.get('aura_auth_token')?.value;

    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('error', 'admin_required');
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      if (payload.role !== 'ADMIN') {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        loginUrl.searchParams.set('error', 'admin_forbidden');
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('error', 'session_expired');
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect Admin API routes (/api/admin/...)
  if (pathname.startsWith('/api/admin')) {
    const token =
      request.cookies.get('nexa_auth_token')?.value ||
      request.cookies.get('aura_auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      );
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      if (payload.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Forbidden: Administrator privileges required' },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or expired session' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
