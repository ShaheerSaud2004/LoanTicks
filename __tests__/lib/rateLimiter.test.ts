import { describe, it, expect, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rateLimiter';

describe('Rate Limiter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow requests within limit', async () => {
    const limiter = rateLimit({
      windowMs: 60000, // 1 minute
      max: 5,
    });

    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        'x-forwarded-for': '127.0.0.1',
      },
    });

    // First 5 requests should pass
    for (let i = 0; i < 5; i++) {
      const result = await limiter(request);
      expect(result).toBeNull(); // Null means allowed
    }
  });

  it('should block requests exceeding limit', async () => {
    const limiter = rateLimit({
      windowMs: 60000,
      max: 2,
    });

    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        'x-forwarded-for': '127.0.0.1',
      },
    });

    // First 2 requests should pass
    await limiter(request);
    await limiter(request);

    // Third request should be blocked
    const result = await limiter(request);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.status).toBe(429);
    }
  });

  it('should handle missing IP address', async () => {
    const limiter = rateLimit({
      windowMs: 60000,
      max: 5,
    });

    const request = new NextRequest('http://localhost:3000/api/test');

    const result = await limiter(request);
    // Should handle gracefully
    expect(result).toBeDefined();
  });

  it('should use custom error message', async () => {
    const customMessage = 'Too many requests, please slow down';
    const limiter = rateLimit({
      windowMs: 60000,
      max: 1,
      message: customMessage,
    });

    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        'x-forwarded-for': '127.0.0.1',
      },
    });

    await limiter(request); // First request
    const result = await limiter(request); // Second request (should be blocked)

    if (result) {
      const json = await result.json();
      expect(json.error).toContain(customMessage);
    }
  });
});
