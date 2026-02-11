import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Disabled for now - auth is handled client-side via AuthProvider
  // TODO: Implement cookie-based auth with Supabase
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith('/auth/');

  if (isAuthPage) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [],
};
