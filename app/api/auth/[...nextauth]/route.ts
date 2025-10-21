import { handlers } from '@/lib/auth';
import { loginRateLimiter } from '@/lib/rateLimiter';
import { NextRequest } from 'next/server';

// Apply rate limiting to login POST requests
async function POST_WITH_RATE_LIMIT(request: NextRequest) {
  // Check rate limit
  const rateLimitResponse = await loginRateLimiter(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  
  // If rate limit passed, proceed with authentication
  return handlers.POST(request);
}

export const GET = handlers.GET;
export const POST = POST_WITH_RATE_LIMIT;

