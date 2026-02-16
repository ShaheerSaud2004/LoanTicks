import { loginRateLimiter } from '@/lib/rateLimiter';
import { NextRequest } from 'next/server';

// Use Node.js runtime so Vercel injects env vars at request time
export const runtime = 'nodejs';

// Load auth inside the request so process.env.AUTH_SECRET/NEXTAUTH_SECRET are set by Vercel
async function getHandlers() {
  await import('@/lib/ensureAuthEnv');
  const { handlers } = await import('@/lib/auth');
  return handlers;
}

async function POST_WITH_RATE_LIMIT(request: NextRequest) {
  try {
    const rateLimitResponse = await loginRateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;
    const handlers = await getHandlers();
    return handlers.POST(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Auth route error:', message);
    return new Response(
      JSON.stringify({
        error: 'Configuration',
        message: message.includes('AUTH_SECRET') || message.includes('NEXTAUTH_SECRET')
          ? 'Set AUTH_SECRET or NEXTAUTH_SECRET in Vercel → Settings → Environment Variables (Production), then Redeploy → Clear cache and redeploy.'
          : message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET(request: NextRequest) {
  const handlers = await getHandlers();
  return handlers.GET(request);
}
export const POST = POST_WITH_RATE_LIMIT;

