import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple middleware without database access (Edge Runtime compatible)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function middleware(_request: NextRequest) {
  // Let all requests through - authentication will be handled at page level
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};

