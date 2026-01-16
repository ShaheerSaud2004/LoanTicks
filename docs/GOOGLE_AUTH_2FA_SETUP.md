# Google OAuth and Two-Factor Authentication (2FA) Setup Guide

This guide explains how to set up Google OAuth authentication and Two-Factor Authentication (2FA) for your LoanTicks application.

---

## Part 1: Google OAuth Setup

### Prerequisites
- A Google Cloud Platform (GCP) account
- Access to Google Cloud Console
- Your application domain (e.g., `loanaticks.com` or `loanticks.vercel.app`)

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter project name: `LoanTicks Authentication`
5. Click **"Create"**

### Step 2: Enable Google+ API

1. In the Google Cloud Console, go to **"APIs & Services" > "Library"**
2. Search for **"Google+ API"** (or use **"Google Identity Services"** for newer implementations)
3. Click on it and click **"Enable"**

### Step 3: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services" > "Credentials"**
2. Click **"+ CREATE CREDENTIALS"** > **"OAuth client ID"**
3. If prompted, configure the OAuth consent screen first:
   - Choose **"External"** user type
   - Fill in:
     - **App name**: `LoanTicks`
     - **User support email**: Your email
     - **Developer contact information**: Your email
   - Click **"Save and Continue"**
   - Add scopes: `email`, `profile`, `openid`
   - Click **"Save and Continue"**
   - Add test users (optional for development)
   - Click **"Save and Continue"**
   - Review and click **"Back to Dashboard"**

4. Now create the OAuth client:
   - **Application type**: `Web application`
   - **Name**: `LoanTicks Web Client`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for local development)
     - `https://loanticks.vercel.app` (your Vercel URL)
     - `https://loanaticks.com` (your custom domain, if configured)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://loanticks.vercel.app/api/auth/callback/google`
     - `https://loanaticks.com/api/auth/callback/google`
   - Click **"Create"**

5. **Copy the Client ID and Client Secret** - you'll need these for environment variables

### Step 4: Install NextAuth.js Google Provider

```bash
npm install next-auth
```

The Google provider is already included in NextAuth.js, no additional package needed.

### Step 5: Update NextAuth Configuration

Update `lib/auth.ts` to include Google provider:

```typescript
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      // ... existing credentials provider
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  // ... rest of your config
};
```

### Step 6: Set Environment Variables

**Local Development (.env.local):**
```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Vercel Production:**
1. Go to your Vercel project dashboard
2. Navigate to **"Settings" > "Environment Variables"**
3. Add:
   - `GOOGLE_CLIENT_ID` = Your Google Client ID
   - `GOOGLE_CLIENT_SECRET` = Your Google Client Secret

### Step 7: Update Login Page

Add a "Sign in with Google" button to `app/login/page.tsx`:

```tsx
import { signIn } from 'next-auth/react';

// In your login form:
<button
  type="button"
  onClick={() => signIn('google', { callbackUrl: window.location.origin })}
  className="w-full py-3.5 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-900 font-semibold rounded-xl transition-all flex items-center justify-center gap-3"
>
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
  Sign in with Google
</button>
```

---

## Part 2: Two-Factor Authentication (2FA) Setup

### Option A: Using NextAuth.js with TOTP (Time-based One-Time Password)

### Step 1: Install Required Packages

```bash
npm install otplib qrcode
npm install --save-dev @types/qrcode
```

### Step 2: Create 2FA Utilities

Create `lib/twoFactor.ts`:

```typescript
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// Generate a secret for a user
export function generateSecret(email: string): string {
  return authenticator.generateSecret();
}

// Generate QR code URL for Google Authenticator
export async function generateQRCode(secret: string, email: string): Promise<string> {
  const serviceName = 'LoanTicks';
  const otpAuthUrl = authenticator.keyuri(email, serviceName, secret);
  
  return await QRCode.toDataURL(otpAuthUrl);
}

// Verify TOTP token
export function verifyToken(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch (error) {
    return false;
  }
}
```

### Step 3: Update User Model

Add 2FA fields to `models/User.ts`:

```typescript
twoFactorSecret?: string;
twoFactorEnabled: boolean;
twoFactorBackupCodes?: string[]; // Encrypted backup codes
```

### Step 4: Create 2FA Setup API Route

Create `app/api/auth/2fa/setup/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateSecret, generateQRCode } from '@/lib/twoFactor';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate secret
    const secret = generateSecret(user.email);
    user.twoFactorSecret = secret;
    await user.save();

    // Generate QR code
    const qrCode = await generateQRCode(secret, user.email);

    return NextResponse.json({ 
      secret,
      qrCode,
      message: 'Scan QR code with Google Authenticator'
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json({ error: 'Failed to setup 2FA' }, { status: 500 });
  }
}
```

### Step 5: Create 2FA Verification API Route

Create `app/api/auth/2fa/verify/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/twoFactor';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await request.json();
    
    await connectDB();
    const user = await User.findById(session.user.id);
    
    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ error: '2FA not configured' }, { status: 400 });
    }

    const isValid = verifyToken(token, user.twoFactorSecret);
    
    if (isValid) {
      user.twoFactorEnabled = true;
      await user.save();
      return NextResponse.json({ success: true, message: '2FA enabled successfully' });
    } else {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json({ error: 'Failed to verify 2FA' }, { status: 500 });
  }
}
```

### Step 6: Update NextAuth Callbacks

Update `lib/auth.ts` to check 2FA during login:

```typescript
callbacks: {
  async signIn({ user, account, profile }) {
    // Check if user has 2FA enabled
    if (account?.provider === 'credentials') {
      const dbUser = await User.findById(user.id);
      if (dbUser?.twoFactorEnabled) {
        // Store in session that 2FA verification is needed
        // You'll need to implement a middleware or page to handle this
      }
    }
    return true;
  },
  // ... other callbacks
}
```

### Step 7: Create 2FA Setup Page

Create `app/settings/2fa/page.tsx` for users to enable 2FA:

```tsx
'use client';

import { useState } from 'react';
import { generateQRCode } from '@/lib/twoFactor';

export default function TwoFactorSetup() {
  const [qrCode, setQrCode] = useState<string>('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/setup', { method: 'POST' });
      const data = await response.json();
      if (data.qrCode) {
        setQrCode(data.qrCode);
      }
    } catch (error) {
      console.error('Setup error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (data.success) {
        alert('2FA enabled successfully!');
      } else {
        alert('Invalid token. Please try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Enable Two-Factor Authentication</h1>
      
      {!qrCode ? (
        <button
          onClick={handleSetup}
          disabled={loading}
          className="w-full py-3 bg-yellow-500 text-white rounded-lg font-semibold"
        >
          {loading ? 'Generating...' : 'Generate QR Code'}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <p className="mb-4">Scan this QR code with Google Authenticator:</p>
            <img src={qrCode} alt="2FA QR Code" className="mx-auto border-2 border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block mb-2 font-semibold">Enter 6-digit code:</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              maxLength={6}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="000000"
            />
          </div>
          <button
            onClick={handleVerify}
            disabled={loading || token.length !== 6}
            className="w-full py-3 bg-green-500 text-white rounded-lg font-semibold"
          >
            {loading ? 'Verifying...' : 'Verify & Enable 2FA'}
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Option B: Using Auth0 or Clerk (Easier Alternative)

### Auth0 Setup

1. Sign up at [auth0.com](https://auth0.com)
2. Create a new application
3. Configure callback URLs
4. Install: `npm install @auth0/nextjs-auth0`
5. Follow [Auth0 Next.js guide](https://auth0.com/docs/quickstart/webapp/nextjs)

### Clerk Setup

1. Sign up at [clerk.com](https://clerk.com)
2. Create a new application
3. Install: `npm install @clerk/nextjs`
4. Follow [Clerk Next.js guide](https://clerk.com/docs/quickstarts/nextjs)

---

## Security Best Practices

1. **Always use HTTPS** in production
2. **Store 2FA secrets encrypted** in the database
3. **Generate backup codes** when enabling 2FA
4. **Rate limit** 2FA verification attempts
5. **Log all 2FA events** for audit purposes
6. **Allow users to disable 2FA** with proper verification
7. **Use secure session management** for 2FA verification state

---

## Testing

1. Test Google OAuth with a test Google account
2. Test 2FA setup and verification flow
3. Test backup codes
4. Test 2FA disable functionality
5. Test error handling (invalid tokens, expired sessions, etc.)

---

## Troubleshooting

### Google OAuth Issues
- **"redirect_uri_mismatch"**: Check that redirect URIs in Google Console match exactly
- **"invalid_client"**: Verify Client ID and Secret are correct
- **CORS errors**: Ensure authorized origins include your domain

### 2FA Issues
- **Invalid token**: Check time sync on server (TOTP is time-sensitive)
- **QR code not scanning**: Ensure service name doesn't have special characters
- **Token verification fails**: Verify secret is stored correctly in database

---

## Additional Resources

- [NextAuth.js Google Provider Docs](https://next-auth.js.org/providers/google)
- [OTPLib Documentation](https://github.com/yeojz/otplib)
- [Google Authenticator Setup](https://support.google.com/accounts/answer/1066447)
- [2FA Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html)
