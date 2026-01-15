import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Note: The "middleware" deprecation warning in Next.js 16.0.10 is a known issue
// This middleware file is the correct implementation and will continue to work
// The warning can be safely ignored or will be fixed in future Next.js versions
export default async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Security headers
  const response = NextResponse.next();
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  // Public routes - always allow root and login
  if (pathname === '/login' || pathname === '/') {
    return response;
  }

  // For all other routes, require authentication
  // But don't redirect to login - let them access the waitlist page
  if (!session) {
    // Only redirect protected routes to login, not public pages
    if (pathname.startsWith('/admin') || pathname.startsWith('/employee') || pathname.startsWith('/customer')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // For other routes without session, allow access (they'll be handled by page-level auth)
    return response;
  }

  // Role-based access control
  const role = session.user?.role;

  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (pathname.startsWith('/employee') && role !== 'employee' && role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (pathname.startsWith('/customer') && role !== 'customer') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};


