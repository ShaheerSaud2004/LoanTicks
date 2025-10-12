import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple middleware without database access (Edge Runtime compatible)
export function middleware(request: NextRequest) {
  // Let all requests through - authentication will be handled at page level
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};

