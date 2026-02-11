import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public paths that don't require authentication
const publicPaths = ['/', '/auth/login', '/auth/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('supabase-auth-token')?.value;

  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  const isAuthPage = pathname.startsWith('/auth/');
  const isDashboardPage = pathname.startsWith('/dashboard/') || pathname.startsWith('/client/');

  if (isAuthPage && token) {
    // Redirect authenticated users from auth pages to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isDashboardPage && !token) {
    // Redirect unauthenticated users from protected pages to login
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/client/:path*',
    '/auth/:path*',
  ],
};
