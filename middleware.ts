import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public paths that don't require authentication
const publicPaths = ['/', '/auth/login', '/auth/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for any Supabase auth cookies (project-specific pattern: sb-<ref>-access-token)
  const cookies = request.cookies.getAll();
  const hasSupabaseAuth = cookies.some(cookie =>
    cookie.name.startsWith('sb-') &&
    (cookie.name.includes('-access-token') ||
     cookie.name.includes('-refresh-token'))
  );

  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  const isAuthPage = pathname.startsWith('/auth/');
  const isDashboardPage = pathname.startsWith('/dashboard/') ||
                        pathname.startsWith('/client/') ||
                        pathname.startsWith('/admin/');

  if (isAuthPage && hasSupabaseAuth) {
    // Redirect authenticated users from auth pages to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isDashboardPage && !hasSupabaseAuth) {
    // Redirect unauthenticated users from protected pages to login
    const loginUrl = new URL('/auth/login', request.url);
    if (pathname !== '/dashboard') {
      loginUrl.searchParams.set('redirect', pathname);
    }
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
