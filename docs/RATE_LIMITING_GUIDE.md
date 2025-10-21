# ⚡ Rate Limiting Implementation Guide

## ✅ What We Implemented

### **Rate Limiting System**
A robust rate limiting system to prevent abuse and protect against brute force attacks.

## 🔒 **Rate Limits Applied**

### **1. Login Attempts** (STRICT)
```
Limit: 5 attempts per 15 minutes
Applies to: /api/auth/[...nextauth]
Purpose: Prevent brute force password attacks

Example:
- User tries wrong password 5 times
- Gets locked out for 15 minutes
- Error: "Too many login attempts. Please try again in 15 minutes."
```

### **2. Application Submissions** (MODERATE)
```
Limit: 5 submissions per hour
Applies to: POST /api/loan-application
Purpose: Prevent spam applications

Example:
- Customer submits 5 applications in 1 hour
- 6th attempt blocked
- Error: "Too many application submissions. Please wait before submitting again."
```

### **3. API Requests** (MODERATE)
```
Limit: 20 requests per minute
Applies to: General API endpoints
Purpose: Prevent API abuse

Available for future endpoints
```

### **4. Password Reset** (VERY STRICT)
```
Limit: 3 attempts per hour
Purpose: Prevent password reset abuse

Available for future implementation
```

### **5. General Browsing** (LENIENT)
```
Limit: 100 requests per minute
Purpose: Prevent DoS attacks

Available for future implementation
```

## 📊 **How It Works**

### **1. In-Memory Store**
```typescript
// Stores rate limit data temporarily
const store = {
  "192.168.1.1-/api/auth": {
    count: 3,
    resetTime: 1728937200000
  }
}

// Auto-cleanup every 5 minutes
setInterval(() => {
  // Remove expired entries
}, 5 * 60 * 1000);
```

### **2. Request Flow**
```
1. Request comes in
   ↓
2. Extract IP address
   ↓
3. Check rate limit store
   ↓
4. Count < Limit?
   YES → Allow request
   NO  → Block with 429 error
```

### **3. Response Headers**
When rate limited, you get:
```json
{
  "error": "Too many requests",
  "retryAfter": "900 seconds"
}

Headers:
- Retry-After: 900
- X-RateLimit-Limit: 5
- X-RateLimit-Remaining: 0
- X-RateLimit-Reset: 1728937200000
```

## 🎯 **Usage Examples**

### **Example 1: Login Rate Limit**
```typescript
// User tries to login
POST /api/auth/callback/credentials

// First 5 attempts: ✅ Allowed
// 6th attempt within 15 min: ❌ Blocked

Response:
{
  "error": "Too many login attempts. Please try again in 15 minutes.",
  "retryAfter": "900 seconds"
}
```

### **Example 2: Application Submission**
```typescript
// Customer submits loan application
POST /api/loan-application

// First 5 within 1 hour: ✅ Allowed
// 6th within same hour: ❌ Blocked

Response:
{
  "error": "Too many application submissions. Please wait before submitting again.",
  "retryAfter": "3600 seconds"
}
```

## 🛠️ **How to Add Rate Limiting to New Routes**

### **Step 1: Import the rate limiter**
```typescript
import { apiRateLimiter } from '@/lib/rateLimiter';
```

### **Step 2: Apply to your route**
```typescript
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await apiRateLimiter(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Your normal route logic
  const data = await request.json();
  // ...
}
```

### **Step 3: Custom rate limiter**
```typescript
import { rateLimit } from '@/lib/rateLimiter';

const customRateLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 10, // 10 requests
  message: 'Custom error message'
});

export async function POST(request: NextRequest) {
  const rateLimitResponse = await customRateLimiter(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  
  // Your logic
}
```

## 🔍 **Testing Rate Limits**

### **Test Login Rate Limit**
```bash
# Try logging in 6 times with wrong password
curl -X POST http://localhost:3012/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"email": "wrong@email.com", "password": "wrong"}'

# Run this 6 times quickly
# 6th time should return 429 error
```

### **Test Application Rate Limit**
```bash
# Submit 6 applications in a row
for i in {1..6}; do
  curl -X POST http://localhost:3012/api/loan-application \
    -H "Content-Type: application/json" \
    -H "Cookie: your-session-cookie" \
    -d '{"data": "test"}'
done

# 6th should be blocked
```

## 📈 **Monitoring Rate Limits**

### **Add Logging (Recommended)**
```typescript
export function rateLimit(options: RateLimitOptions) {
  return async (request: NextRequest) => {
    // ... existing code ...
    
    if (store[key].count > max) {
      // Log rate limit hit
      console.warn(`Rate limit exceeded:`, {
        ip,
        path: request.nextUrl.pathname,
        count: store[key].count,
        limit: max
      });
      
      return NextResponse.json(/* error */);
    }
  };
}
```

### **Track Metrics**
You can track:
- How many times limits are hit
- Which IPs are being rate limited
- Which endpoints are being abused
- Time of day patterns

## 🚀 **Production Considerations**

### **1. Use Redis for Production**
Current implementation uses in-memory store (resets on server restart).

For production, use Redis:
```bash
npm install ioredis
```

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Store in Redis instead of memory
await redis.set(key, JSON.stringify(data), 'EX', windowMs / 1000);
```

### **2. IP Detection Improvements**
```typescript
// Handle proxies, CDNs, load balancers
const ip = 
  request.headers.get('cf-connecting-ip') || // Cloudflare
  request.headers.get('x-real-ip') || 
  request.headers.get('x-forwarded-for')?.split(',')[0] ||
  'unknown';
```

### **3. Whitelist Important IPs**
```typescript
const WHITELIST = [
  '10.0.0.1', // Office IP
  '192.168.1.1' // Admin IP
];

if (WHITELIST.includes(ip)) {
  return null; // Skip rate limiting
}
```

### **4. User-Based Rate Limiting**
Instead of IP, use user ID:
```typescript
const session = await auth();
const key = session?.user?.id || ip;
```

## 🛡️ **Security Benefits**

### **What Rate Limiting Prevents:**
✅ Brute force password attacks
✅ DDoS attacks
✅ API abuse and spam
✅ Credential stuffing
✅ Resource exhaustion
✅ Automated bot attacks

### **Real-World Example:**
```
Without rate limiting:
- Attacker tries 10,000 passwords in 1 minute
- Could crack weak passwords

With rate limiting (5 per 15 min):
- Attacker can only try 5 passwords
- Then blocked for 15 minutes
- Makes brute force impossible
```

## 📋 **Available Rate Limiters**

| Rate Limiter | Window | Max Requests | Use Case |
|--------------|--------|--------------|----------|
| `loginRateLimiter` | 15 min | 5 | Login attempts |
| `apiRateLimiter` | 1 min | 20 | General APIs |
| `generalRateLimiter` | 1 min | 100 | Browsing |
| `passwordResetRateLimiter` | 1 hour | 3 | Password reset |
| `applicationRateLimiter` | 1 hour | 5 | Loan submissions |

## ✨ **Next Steps**

### **Recommended Enhancements:**
1. **Add Redis** for persistent storage
2. **Log rate limit events** for monitoring
3. **Dashboard** to view rate limit stats
4. **Alert system** for suspicious activity
5. **Dynamic limits** based on user reputation

### **Future Rate Limits to Add:**
- Document upload endpoints
- Search/filter operations
- Report generation
- Email sending
- File downloads

---

**Implementation Date:** October 14, 2025  
**Status:** ✅ Active  
**Coverage:** Login, Application Submission  
**Next Review:** Monthly


