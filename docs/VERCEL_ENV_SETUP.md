# 🚀 Quick Vercel Environment Variables Setup

## ⚠️ CRITICAL: Your site is down because NEXTAUTH_URL is set to localhost

## Step 1: Go to Vercel Dashboard

1. Visit: https://vercel.com
2. Sign in
3. Select your project: **LoanTicks** (or `loantickssss`)

## Step 2: Add Environment Variables

Go to: **Settings → Environment Variables**

### Required Variables:

#### 1. NEXTAUTH_URL (CRITICAL - This is your issue!)
```
Variable Name: NEXTAUTH_URL
Value: https://loantickssss.vercel.app
Environment: Production (and Preview if you want)
```

**Important:** 
- Use `https://` (not `http://`)
- Use your exact Vercel domain: `loantickssss.vercel.app`
- NO trailing slash
- Must be set for Production environment

#### 2. NEXTAUTH_SECRET
```
Variable Name: NEXTAUTH_SECRET
Value: [Generate a secure secret - see below]
Environment: Production, Preview, Development
```

**Generate a secret:**
```bash
openssl rand -base64 32
```

#### 3. MONGODB_URI
```
Variable Name: MONGODB_URI
Value: mongodb+srv://your-connection-string
Environment: Production, Preview, Development
```

#### 4. ENCRYPTION_KEY (Optional for now - we have fallback)
```
Variable Name: ENCRYPTION_KEY
Value: [64-character hex string - optional]
Environment: Production, Preview, Development
```

**Generate encryption key:**
```bash
openssl rand -hex 32
```

## Step 3: Redeploy

After adding environment variables:

1. Go to **Deployments** tab
2. Click the **three dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger auto-deploy

## Step 4: Verify

1. Wait for deployment to complete (2-5 minutes)
2. Visit: https://loantickssss.vercel.app
3. Try logging in

## 🔍 Quick Checklist

- [ ] NEXTAUTH_URL = `https://loantickssss.vercel.app` (Production)
- [ ] NEXTAUTH_SECRET = Generated secret (All environments)
- [ ] MONGODB_URI = Your MongoDB connection string (All environments)
- [ ] Redeployed after adding variables

## ⚠️ Common Mistakes

1. **Using localhost in production** ❌
   - Wrong: `NEXTAUTH_URL=http://localhost:3000`
   - Right: `NEXTAUTH_URL=https://loantickssss.vercel.app`

2. **Missing https://** ❌
   - Wrong: `NEXTAUTH_URL=loantickssss.vercel.app`
   - Right: `NEXTAUTH_URL=https://loantickssss.vercel.app`

3. **Trailing slash** ❌
   - Wrong: `NEXTAUTH_URL=https://loantickssss.vercel.app/`
   - Right: `NEXTAUTH_URL=https://loantickssss.vercel.app`

4. **Not setting for Production environment** ❌
   - Make sure to select "Production" when adding the variable

## 📝 Your Local .env.local (Keep for Development)

Your local `.env.local` should still have:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-local-secret
MONGODB_URI=your-mongodb-uri
```

This is fine for local development. The Vercel environment variables are separate and used only in production.
