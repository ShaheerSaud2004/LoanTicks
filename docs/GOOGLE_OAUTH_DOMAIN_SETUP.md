# Google OAuth: Which Domain to Use?

## Answer: Add BOTH Domains! ✅

You should add **both** redirect URIs in Google Cloud Console so both domains work:

1. **Vercel domain:** `https://loanticks.vercel.app/api/auth/callback/google`
2. **Custom domain:** `https://loanaticks.com/api/auth/callback/google`

## Setup Instructions

### Step 1: Set NEXTAUTH_URL in Vercel

Set `NEXTAUTH_URL` to your **primary domain** (custom domain):

```
NEXTAUTH_URL=https://loanaticks.com
```

**Why?** This is your main domain, so use it as the primary.

### Step 2: Add BOTH Redirect URIs in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Click your OAuth Client ID
4. In **"Authorized redirect URIs"**, add **ALL** of these:

```
http://localhost:3000/api/auth/callback/google
https://loanticks.vercel.app/api/auth/callback/google
https://loanaticks.com/api/auth/callback/google
```

### Step 3: Why Both?

- **Vercel domain** (`loanticks.vercel.app`): Works for preview deployments and testing
- **Custom domain** (`loanaticks.com`): Your production domain
- **Localhost**: For local development

## How It Works

With `trustHost: true` in your NextAuth config:
- ✅ Both domains will work
- ✅ NextAuth automatically detects which domain is being used
- ✅ Google OAuth will work on whichever domain the user visits

## Recommended Setup

**Vercel Environment Variables:**
```
NEXTAUTH_URL=https://loanaticks.com  (Primary - your custom domain)
GOOGLE_CLIENT_ID=33527178411-enkioea0soptbbm3ms74ib3ks0u474i9.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

**Google Cloud Console - Authorized redirect URIs:**
```
http://localhost:3000/api/auth/callback/google
https://loanticks.vercel.app/api/auth/callback/google
https://loanaticks.com/api/auth/callback/google
```

## Summary

- **NEXTAUTH_URL**: Set to `https://loanaticks.com` (your custom domain)
- **Google Console**: Add redirect URIs for **both** domains
- **Result**: Both domains will work for Google OAuth! ✅
