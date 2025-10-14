# 🚀 Vercel Deployment Guide

## ✅ Pre-Deployment Checklist

### 1. Code Quality
- [x] All linting errors fixed
- [x] TypeScript compilation successful
- [x] No console errors
- [x] All features tested locally

### 2. Environment Variables
Your app needs these environment variables to work:

```bash
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-app.vercel.app
```

## 📋 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Commit all changes:**
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

2. **Verify .gitignore:**
✅ Your `.gitignore` already excludes:
- `.env*.local`
- `.env`
- `node_modules`
- `.vercel`

### Step 2: Set Up Vercel Project

1. **Go to Vercel:**
   - Visit: https://vercel.com
   - Sign in with GitHub

2. **Import Repository:**
   - Click "Add New Project"
   - Select your GitHub repository: `LoanTicks`
   - Click "Import"

3. **Configure Build Settings:**
   Vercel should auto-detect Next.js settings:
   ```
   Framework Preset: Next.js
   Build Command: npm run build --turbopack
   Output Directory: .next
   Install Command: npm install
   ```

### Step 3: Add Environment Variables

**CRITICAL:** Add these in Vercel Dashboard → Settings → Environment Variables

#### 1. MONGODB_URI
```
Variable: MONGODB_URI
Value: mongodb+srv://username:password@cluster.mongodb.net/loanticks?retryWrites=true&w=majority
Environment: Production, Preview, Development
```

#### 2. NEXTAUTH_SECRET
Generate a secure secret:
```bash
# Run this command to generate:
openssl rand -base64 32
```

```
Variable: NEXTAUTH_SECRET
Value: [paste the generated secret]
Environment: Production, Preview, Development
```

#### 3. NEXTAUTH_URL
```
Variable: NEXTAUTH_URL
Value: https://your-app-name.vercel.app
Environment: Production
```

For preview/development, Vercel auto-sets this.

### Step 4: Deploy

1. **Click "Deploy"**
   - Vercel will build and deploy your app
   - Takes 2-5 minutes

2. **Check Build Logs**
   - Monitor for any errors
   - Ensure all dependencies install correctly

3. **Visit Your App**
   - Click the deployment URL
   - Test login with demo credentials

## 🔍 Verifying Deployment

### Test These Features:

1. **Login System**
   - [ ] Admin login works
   - [ ] Employee login works
   - [ ] Customer login works
   - [ ] Quick login buttons work

2. **Customer Features**
   - [ ] Can access dashboard
   - [ ] Can submit loan application
   - [ ] Success message displays correctly
   - [ ] Application saves to database

3. **Employee Features**
   - [ ] Can view all applications
   - [ ] Can approve/reject applications
   - [ ] Can add notes
   - [ ] Search and filter work

4. **Admin Features**
   - [ ] Full access to all dashboards
   - [ ] Can view all applications
   - [ ] All admin features work

## ⚠️ Common Issues & Solutions

### Issue 1: "MONGODB_URI is not defined"
**Solution:** Add environment variable in Vercel Dashboard
1. Go to Settings → Environment Variables
2. Add `MONGODB_URI`
3. Redeploy

### Issue 2: "NEXTAUTH_SECRET is required"
**Solution:** Generate and add secret
```bash
openssl rand -base64 32
```
Add to Vercel environment variables

### Issue 3: Login redirects fail
**Solution:** Update `NEXTAUTH_URL`
- Set to your Vercel deployment URL
- Example: `https://loan-ticks.vercel.app`
- Must be exact (no trailing slash)

### Issue 4: Database connection fails
**Solution:** Check MongoDB Atlas
1. Whitelist Vercel IP: `0.0.0.0/0` (all IPs)
2. Or add Vercel IPs specifically
3. Verify credentials in connection string

### Issue 5: Build fails with Turbopack error
**Solution:** Try standard build
Update `package.json`:
```json
"build": "next build"
```
Remove `--turbopack` flag for production

## 🔐 Security Checklist for Production

### Before Going Live:

- [ ] **Change all default passwords**
  - Update demo user passwords in seed script
  - Or remove demo users entirely

- [ ] **MongoDB Security**
  - [ ] Strong database password
  - [ ] IP whitelist configured
  - [ ] Database user has minimal permissions

- [ ] **Environment Variables**
  - [ ] All secrets are unique (not defaults)
  - [ ] `NEXTAUTH_SECRET` is strong and random
  - [ ] URLs are correct for production

- [ ] **Code Security**
  - [ ] No hardcoded secrets in code
  - [ ] No console.logs with sensitive data
  - [ ] Error messages don't leak info

- [ ] **Access Control**
  - [ ] Test all role permissions
  - [ ] Verify users can only see their data
  - [ ] Admin access is restricted

## 📊 Post-Deployment Setup

### 1. Seed Database (if needed)
```bash
# Run locally to seed production database
MONGODB_URI="production_uri" npm run seed
```

### 2. Monitor Your App
- Check Vercel Analytics
- Monitor error logs
- Watch for performance issues

### 3. Set Up Domain (Optional)
1. Go to Vercel → Settings → Domains
2. Add your custom domain
3. Configure DNS records
4. Update `NEXTAUTH_URL` to your domain

### 4. Enable Security Features
- [ ] Enable Vercel Firewall
- [ ] Set up DDoS protection
- [ ] Configure rate limiting
- [ ] Enable security headers

## 🎯 Environment Variables Reference

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` | ✅ Yes |
| `NEXTAUTH_SECRET` | Secret for JWT encryption | `random-32-char-string` | ✅ Yes |
| `NEXTAUTH_URL` | Production URL | `https://app.vercel.app` | ✅ Yes |

## 🔄 Continuous Deployment

Your app is now set up for continuous deployment:

1. **Push to GitHub** → Automatic deploy to Vercel
2. **Main branch** → Production deployment
3. **Other branches** → Preview deployments
4. **Pull requests** → Automatic preview URLs

## 📱 Quick Deploy Commands

```bash
# 1. Make changes locally
git add .
git commit -m "Your changes"
git push origin main

# 2. Vercel auto-deploys (no manual action needed)

# 3. Check deployment status
vercel --prod

# 4. View logs
vercel logs
```

## ✅ Deployment Complete!

**Your app is live at:** https://your-app.vercel.app

**Next Steps:**
1. Test all functionality
2. Share URL with team
3. Monitor for errors
4. Update documentation
5. Set up monitoring/alerts

## 🆘 Need Help?

### Vercel Support
- Documentation: https://vercel.com/docs
- Support: https://vercel.com/support
- Discord: https://vercel.com/discord

### Next.js Help
- Docs: https://nextjs.org/docs
- GitHub: https://github.com/vercel/next.js

### MongoDB Atlas
- Docs: https://docs.atlas.mongodb.com
- Support: https://www.mongodb.com/support

---

**Deployment Date:** October 14, 2025  
**Framework:** Next.js 15.5.4  
**Platform:** Vercel  
**Database:** MongoDB Atlas  
**Authentication:** NextAuth.js v5

