import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Note: We do NOT call auth() here. Middleware runs on Edge; JWT decoding uses the
// secret and can fail with "no matching decryption secret" when Edge has different
// env than Node. Auth and redirects for /admin, /employee, /customer are handled
// in the server-rendered pages (Node), which have consistent access to AUTH_SECRET/NEXTAUTH_SECRET.

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';

  // Redirect loanaticks.com (no www) to www
  if (host === 'loanaticks.com') {
    const url = new URL(request.url);
    url.host = 'www.loanaticks.com';
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};


