# 🌐 Multiple Domains Setup Guide

## Your Domains

You want both of these to work:
- ✅ `https://loanaticks.com` (custom domain)
- ✅ `https://loanticks.vercel.app` (Vercel default domain)

## Good News! ✅

Your app is already configured to support multiple domains:
- ✅ `trustHost: true` is set in `lib/auth.ts`
- ✅ This allows NextAuth to work with any domain

## Step 1: Set NEXTAUTH_URL to Primary Domain

Since `loanaticks.com` is your custom domain, set that as primary:

1. **Go to Vercel → Settings → Environment Variables**
2. **Find:** `NEXTAUTH_URL`
3. **Set to:** `https://loanaticks.com`
   - This will be your primary domain
   - Both domains will still work
4. **Make sure Production environment is selected**
5. **Save**

## Step 2: Verify Both Domains Work

After updating NEXTAUTH_URL:

1. **Test Custom Domain:**
   - Visit: `https://loanaticks.com`
   - Try logging in
   - Should work ✅

2. **Test Vercel Domain:**
   - Visit: `https://loanticks.vercel.app`
   - Try logging in
   - Should also work ✅

## How It Works

With `trustHost: true`:
- NextAuth automatically detects the domain from the request
- Works with any domain that's configured in Vercel
- No code changes needed!

## Step 3: Optional - Set Up Redirect

If you want `loanticks.vercel.app` to redirect to `loanaticks.com`:

1. **Go to Vercel → Settings → Domains**
2. **Click on:** `loanticks.vercel.app`
3. **Enable redirect** (if available)
4. **Or keep both working** (recommended for testing)

## Current Configuration

Your setup:
- ✅ `loanaticks.com` - Custom domain (primary)
- ✅ `www.loanaticks.com` - WWW subdomain
- ✅ `loanticks.vercel.app` - Vercel default domain
- ✅ All configured in Vercel
- ✅ `trustHost: true` in auth config

## Environment Variables Summary

**For Production:**
```env
NEXTAUTH_URL=https://loanaticks.com
NEXTAUTH_SECRET=your-secret
MONGODB_URI=your-mongodb-uri
GMAIL_USER=shaheersaud2004@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

**Note:** Even though `NEXTAUTH_URL` is set to `loanaticks.com`, both domains will work because of `trustHost: true`.

## Testing Checklist

After updating NEXTAUTH_URL:

- [ ] `https://loanaticks.com` loads
- [ ] `https://loanaticks.com/login` works
- [ ] Login works on `loanaticks.com`
- [ ] `https://loanticks.vercel.app` loads
- [ ] `https://loanticks.vercel.app/login` works
- [ ] Login works on `loanticks.vercel.app`
- [ ] Both domains redirect correctly after login

## Troubleshooting

### Login Works on One Domain But Not the Other

**Fix:**
1. Make sure both domains are added in Vercel → Settings → Domains
2. Check SSL certificates are valid for both
3. Clear browser cookies
4. Try incognito/private window

### Cookies Not Working Across Domains

**Note:** Cookies are domain-specific. If you log in on `loanaticks.com`, you won't be logged in on `loanticks.vercel.app` (and vice versa). This is normal browser behavior.

**Solution:** Use one primary domain (`loanaticks.com`) and redirect the Vercel domain to it if you want a single login session.

## Best Practice

**Recommended Setup:**
1. **Primary Domain:** `loanaticks.com` (set as NEXTAUTH_URL)
2. **Vercel Domain:** Keep for testing/backup
3. **Redirect:** Optionally redirect Vercel domain to custom domain

This way:
- Users always use `loanaticks.com`
- You can still test on `loanticks.vercel.app`
- Both work independently

## Summary

✅ **Both domains can work simultaneously**
✅ **Set NEXTAUTH_URL to `https://loanaticks.com`**
✅ **Both will work because `trustHost: true` is enabled**
✅ **No code changes needed**

Just update the environment variable and you're done! 🎉
