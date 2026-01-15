import { handlers } from '@/lib/auth';
import { loginRateLimiter } from '@/lib/rateLimiter';
import { NextRequest } from 'next/server';

// Apply rate limiting to login POST requests
async function POST_WITH_RATE_LIMIT(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResponse = await loginRateLimiter(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    // If rate limit passed, proceed with authentication
    return handlers.POST(request);
  } catch (error) {
    console.error('Auth route error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Authentication error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export const GET = handlers.GET;
export const POST = POST_WITH_RATE_LIMIT;

