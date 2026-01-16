# 🔧 Fix Google OAuth Redirect URI Mismatch

## The Problem

Error: `redirect_uri_mismatch` means the redirect URI in Google Cloud Console doesn't match what NextAuth is sending.

## Quick Fix Steps

### Step 1: Check Your NEXTAUTH_URL in Vercel

1. Go to Vercel → Your Project → Settings → Environment Variables
2. Find `NEXTAUTH_URL`
3. Note the exact value (e.g., `https://loanticks.vercel.app` or `https://loanaticks.com`)

### Step 2: Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Click on your OAuth 2.0 Client ID: `33527178411-enkioea0soptbbm3ms74ib3ks0u474i9`
4. Scroll to **"Authorized redirect URIs"**
5. **DELETE all existing redirect URIs**
6. **Add these EXACT URIs** (replace with your actual domain):

```
http://localhost:3000/api/auth/callback/google
https://loanticks.vercel.app/api/auth/callback/google
https://loanaticks.com/api/auth/callback/google
```

**CRITICAL - Must be EXACT:**
- ✅ Start with `https://` (except localhost)
- ✅ End with `/api/auth/callback/google`
- ✅ NO trailing slash
- ✅ Case-sensitive
- ✅ Must match your `NEXTAUTH_URL` exactly

### Step 3: Verify NEXTAUTH_URL Matches

The redirect URI must be: `{NEXTAUTH_URL}/api/auth/callback/google`

**Example:**
- If `NEXTAUTH_URL=https://loanticks.vercel.app`
- Then redirect URI = `https://loanticks.vercel.app/api/auth/callback/google`

### Step 4: Wait and Test

1. **Wait 1-2 minutes** after updating Google Console (changes take time to propagate)
2. **Clear browser cache/cookies** for Google
3. **Redeploy your Vercel app** (or wait for auto-deploy)
4. Try signing in with Google again

## Common Mistakes ❌

❌ **Wrong:**
- `https://loanticks.vercel.app/api/auth/callback/google/` (trailing slash)
- `http://loanticks.vercel.app/api/auth/callback/google` (http instead of https)
- `https://loanticks.vercel.app/auth/callback/google` (missing `/api`)
- `https://LOANTICKS.VERCEL.APP/api/auth/callback/google` (wrong case)

✅ **Correct:**
- `https://loanticks.vercel.app/api/auth/callback/google` (exact match)

## What to Check

1. ✅ Redirect URI in Google Console matches: `{NEXTAUTH_URL}/api/auth/callback/google`
2. ✅ `NEXTAUTH_URL` is set correctly in Vercel
3. ✅ No trailing slashes
4. ✅ Using `https://` for production
5. ✅ Waited 1-2 minutes after updating
6. ✅ Cleared browser cache

## Still Not Working?

Check the exact error in browser console (F12 → Console tab) to see what redirect URI NextAuth is actually trying to use.
