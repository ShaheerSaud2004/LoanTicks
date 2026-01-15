import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/auth';
import { loginRateLimiter } from '@/lib/rateLimiter';
import { logAuthEvent } from '@/lib/auditLogger';

/**
 * Login API endpoint with rate limiting
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await loginRateLimiter(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Attempt login
    const result = await signIn('credentials', {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    // Get IP address for logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    if (result?.error) {
      // Log failed login attempt
      await logAuthEvent({
        userId: 'unknown',
        userRole: 'customer',
        action: 'login_failed',
        ipAddress,
        userAgent,
        details: { email: email.trim().toLowerCase() },
      });

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Log successful login
    // Note: We don't have user ID yet, but NextAuth will handle session
    await logAuthEvent({
      userId: 'unknown', // Will be updated after session is created
      userRole: 'customer',
      action: 'login',
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
