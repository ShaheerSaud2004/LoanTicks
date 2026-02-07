# 🔧 Site Down - Quick Fix Guide

## Issue: ERR_FAILED / Site Can't Be Reached

Your site `loanticks.vercel.app` is showing "ERR_FAILED" error. Here's how to fix it:

## ✅ Step 1: Fixed Build Configuration

I've updated `vercel.json` to remove the `--turbopack` flag from the build command, which was likely causing build failures on Vercel.

**What changed:**
- ❌ Before: `"buildCommand": "next build --turbopack"`
- ✅ After: `"buildCommand": "next build"`

## 🔑 Step 2: Check Vercel Environment Variables

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

### Required Variables (MUST HAVE):

#### 1. NEXTAUTH_URL ⚠️ CRITICAL
**IMPORTANT:** Choose ONE based on which domain you're using:

**Option A: Using Vercel Domain (`loanticks.vercel.app`)**
```
Variable Name: NEXTAUTH_URL
Value: https://loanticks.vercel.app
Environment: ✅ Production (MUST be checked!)
```

**Option B: Using Custom Domain (`loanaticks.com`)**
```
Variable Name: NEXTAUTH_URL
Value: https://loanaticks.com
Environment: ✅ Production (MUST be checked!)
```

**⚠️ If your custom domain isn't working, switch to the Vercel domain!**

**Common mistakes:**
- ❌ `http://loanticks.vercel.app` (missing https)
- ❌ `loanticks.vercel.app` (missing https://)
- ❌ `https://loanticks.vercel.app/` (trailing slash)
- ❌ `http://localhost:3000` (localhost in production)
- ✅ `https://loanticks.vercel.app` (correct)

#### 2. NEXTAUTH_SECRET ⚠️ Currently only set for Production
```
Variable Name: NEXTAUTH_SECRET
Value: [Generate a secure 32+ character secret]
Environment: ✅ Production, ✅ Preview, ✅ Development (ALL THREE!)
```

**Current Issue:** You only have this set for Production. Add it for Preview and Development too!

**Generate secret:**
```bash
openssl rand -base64 32
```

#### 3. MONGODB_URI ⚠️ Currently only set for Production
```
Variable Name: MONGODB_URI
Value: mongodb+srv://username:password@cluster.mongodb.net/loanticks?retryWrites=true&w=majority
Environment: ✅ Production, ✅ Preview, ✅ Development (ALL THREE!)
```

**Current Issue:** You only have this set for Production. Add it for Preview and Development too!

### Optional Variables (Nice to Have):

#### 4. GOOGLE_CLIENT_ID (for Google OAuth)
```
Variable Name: GOOGLE_CLIENT_ID
Value: [Your Google OAuth Client ID]
Environment: Production, Preview, Development
```

#### 5. GOOGLE_CLIENT_SECRET (for Google OAuth)
```
Variable Name: GOOGLE_CLIENT_SECRET
Value: [Your Google OAuth Client Secret]
Environment: Production, Preview, Development
```

#### 6. ENCRYPTION_KEY (optional - has fallback)
```
Variable Name: ENCRYPTION_KEY
Value: [64-character hex string]
Environment: Production, Preview, Development
```

## 🚀 Step 3: Redeploy

After fixing environment variables:

1. **Commit and push the vercel.json fix:**
   ```bash
   git add vercel.json
   git commit -m "Fix: Remove turbopack from Vercel build command"
   git push origin main
   ```

2. **Or manually redeploy in Vercel:**
   - Go to **Deployments** tab
   - Click **three dots** (⋯) on latest deployment
   - Click **Redeploy**

## 🔍 Step 4: Check Build Logs

1. Go to **Vercel Dashboard → Deployments**
2. Click on the latest deployment
3. Check **Build Logs** tab for errors

**Common build errors:**
- ❌ "MONGODB_URI is not defined" → Add MONGODB_URI
- ❌ "NEXTAUTH_SECRET is required" → Add NEXTAUTH_SECRET
- ❌ "NEXTAUTH_URL mismatch" → Update NEXTAUTH_URL
- ❌ TypeScript errors → Check code for type errors
- ❌ Import errors → Check file paths

## ✅ Step 5: Verify Deployment

1. Wait 2-5 minutes after redeploy
2. Visit: https://loanticks.vercel.app
3. Check if site loads
4. Try logging in

## 🐛 Troubleshooting

### If site still doesn't work:

1. **Check Vercel Function Logs:**
   - Go to **Vercel Dashboard → Your Project → Logs**
   - Look for runtime errors

2. **Test locally first:**
   ```bash
   npm run build
   npm start
   ```
   If local build fails, fix those errors first.

3. **Check MongoDB connection:**
   - Verify MONGODB_URI is correct
   - Check MongoDB Atlas IP whitelist (should allow all IPs: 0.0.0.0/0)

4. **Verify NextAuth setup:**
   - NEXTAUTH_URL must match your Vercel domain exactly
   - NEXTAUTH_SECRET must be set

## 📋 Quick Checklist

- [ ] Fixed `vercel.json` (removed `--turbopack` from build)
- [ ] NEXTAUTH_URL = `https://loanticks.vercel.app` (Production)
- [ ] NEXTAUTH_SECRET is set (all environments)
- [ ] MONGODB_URI is set (all environments)
- [ ] Committed and pushed changes
- [ ] Redeployed on Vercel
- [ ] Checked build logs for errors
- [ ] Site loads successfully

## 🆘 Still Not Working?

If the site still doesn't work after following all steps:

1. Share the **Build Logs** from Vercel
2. Share the **Function Logs** from Vercel
3. Check if there are any TypeScript/ESLint errors locally:
   ```bash
   npm run lint
   npm run build
   ```
