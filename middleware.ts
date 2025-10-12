import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Public routes
  const isPublicRoute = pathname === '/login' || pathname === '/';

  // Redirect logged-in users away from login page
  if (isLoggedIn && pathname === '/login') {
    const redirectUrl = 
      userRole === 'admin' ? '/admin/dashboard' :
      userRole === 'employee' ? '/employee/dashboard' :
      '/customer/dashboard';
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  // Protect dashboard routes
  if (pathname.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (pathname.startsWith('/employee') && userRole !== 'employee' && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (pathname.startsWith('/customer') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Require authentication for all non-public routes
  if (!isPublicRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

