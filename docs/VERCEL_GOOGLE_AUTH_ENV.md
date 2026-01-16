# Vercel Environment Variables for Google OAuth

Based on your Google Cloud Console setup, add these environment variables in Vercel:

## Required Environment Variables

### 1. Google OAuth Client ID
**Variable Name:** `GOOGLE_CLIENT_ID`  
**Value:** `33527178411-enkioea0soptbbm3ms74ib3ks0u474i9.apps.googleusercontent.com`

### 2. Google OAuth Client Secret
**Variable Name:** `GOOGLE_CLIENT_SECRET`  
**Value:** `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`

## How to Add in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Click **"Add New"**
4. Add each variable:
   - **Name:** `GOOGLE_CLIENT_ID`
   - **Value:** `33527178411-enkioea0soptbbm3ms74ib3ks0u474i9.apps.googleusercontent.com`
   - **Environment:** Select all (Production, Preview, Development)
   - Click **"Save"**

5. Repeat for the secret:
   - **Name:** `GOOGLE_CLIENT_SECRET`
   - **Value:** `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`
   - **Environment:** Select all (Production, Preview, Development)
   - Click **"Save"**

## Important Notes

⚠️ **Security Warning:**
- The Client Secret is sensitive - never commit it to git
- Vercel encrypts these values automatically
- Only add them in Vercel's dashboard, not in your code

## Verification

Your Google Cloud Console shows these are already configured:
- ✅ Authorized JavaScript origins include your domains
- ✅ Authorized redirect URIs are set correctly
- ✅ Client secret is enabled

After adding these to Vercel, redeploy your application for the changes to take effect.
