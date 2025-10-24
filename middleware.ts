import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Client-side authentication will handle most of the protection
  // This is just a basic server-side check
  
  const path = request.nextUrl.pathname;
  
  // Public paths that don't require authentication
  const isPublicPath = path === '/' || path.startsWith('/_next') || path.startsWith('/api');
  
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // For protected routes, we'll rely on client-side auth checks
  // since we're using localStorage for this simple example
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};