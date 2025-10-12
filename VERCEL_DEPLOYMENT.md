# 🚀 Deploy LOANATicks to Vercel

Your code has been successfully pushed to GitHub! Now let's deploy it to Vercel.

## 📋 Prerequisites

Before deploying, you'll need:
1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas** - Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

---

## Step 1: Set Up MongoDB Atlas (Free)

### 1.1 Create a MongoDB Atlas Account
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new **FREE** cluster (M0)

### 1.2 Configure Database Access
1. In Atlas, go to **Database Access** (left sidebar)
2. Click **Add New Database User**
3. Create a username and password (save these!)
4. Set user privileges to **Read and write to any database**
5. Click **Add User**

### 1.3 Configure Network Access
1. Go to **Network Access** (left sidebar)
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (0.0.0.0/0)
   - This is safe for development; restrict in production
4. Click **Confirm**

### 1.4 Get Connection String
1. Go to **Database** (left sidebar)
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Copy the connection string (it looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` with your database username
6. Replace `<password>` with your database password
7. Add `/loanaticks` before the `?` to specify the database:
   ```
   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/loanaticks?retryWrites=true&w=majority
   ```

---

## Step 2: Deploy to Vercel

### 2.1 Import from GitHub
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Authorize GitHub if needed
4. Find and import: `ShaheerSaud2004/LOANATicks`
5. Click **Import**

### 2.2 Configure Project
1. **Framework Preset:** Next.js (should auto-detect)
2. **Root Directory:** `loanaticks`
3. **Build Command:** `npm run build`
4. **Output Directory:** `.next`

### 2.3 Add Environment Variables
Click **Environment Variables** and add these:

**1. MONGODB_URI**
- **Key:** `MONGODB_URI`
- **Value:** Your MongoDB Atlas connection string from Step 1.4
- **Environment:** All (Production, Preview, Development)

**2. NEXTAUTH_SECRET**
- **Key:** `NEXTAUTH_SECRET`
- **Value:** Generate a secret:
  ```bash
  openssl rand -base64 32
  ```
- **Environment:** All

**3. NEXTAUTH_URL** (Optional - Vercel auto-sets this)
- **Key:** `NEXTAUTH_URL`
- **Value:** Your Vercel URL (e.g., `https://your-app.vercel.app`)
- **Environment:** Production

### 2.4 Deploy
1. Click **Deploy**
2. Wait 2-3 minutes for the build to complete
3. You'll get a URL like: `https://loanaticks.vercel.app`

---

## Step 3: Seed Production Database

After deployment, you need to seed your production database with demo users.

### Option A: Using Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
cd /Users/shaheersaud/LOANATicks/loanaticks
vercel link

# Run seed script on Vercel
vercel env pull .env.production
npm run seed
```

### Option B: Manual Database Seeding
1. Install [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect using your MongoDB Atlas connection string
3. Create database: `loanaticks`
4. Create collection: `users`
5. Insert these documents:

**Admin User:**
```json
{
  "name": "Admin User",
  "email": "admin@loanaticks.com",
  "password": "$2a$10$[hashed_password]",
  "role": "admin",
  "phone": "+1-555-0101",
  "createdAt": {"$date": "2025-10-12T00:00:00Z"},
  "updatedAt": {"$date": "2025-10-12T00:00:00Z"}
}
```

**Note:** For security, use the local seed script first, then export users to Atlas.

---

## Step 4: Test Your Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. You should see the login page with your logo
3. Try logging in with demo credentials:
   - **Admin:** admin@loanaticks.com / admin123
   - **Employee:** employee@loanaticks.com / employee123
   - **Customer:** customer@loanaticks.com / customer123

---

## 🎉 You're Live!

Your LOANATicks application is now deployed and accessible worldwide!

**Your URLs:**
- **Production:** `https://loanaticks.vercel.app` (or your custom domain)
- **GitHub:** https://github.com/ShaheerSaud2004/LOANATicks

---

## 🔧 Troubleshooting

### Build Failed
- Check Vercel build logs
- Ensure root directory is set to `loanaticks`
- Verify all dependencies are in `package.json`

### Can't Connect to Database
- Verify MongoDB Atlas connection string is correct
- Check that Network Access allows 0.0.0.0/0
- Ensure database user has read/write permissions
- Test connection string locally first

### Authentication Not Working
- Verify `NEXTAUTH_SECRET` is set in Vercel
- Check that `NEXTAUTH_URL` matches your Vercel URL
- Redeploy after adding environment variables

### "Internal Server Error"
- Check Vercel Function Logs in dashboard
- Verify environment variables are set for all environments
- Check MongoDB Atlas cluster is running

---

## 🌐 Custom Domain (Optional)

1. Go to your Vercel project settings
2. Click **Domains**
3. Add your custom domain (e.g., `loanaticks.com`)
4. Follow Vercel's DNS instructions
5. Update `NEXTAUTH_URL` environment variable to your custom domain

---

## 📊 Monitoring

**Vercel Dashboard** provides:
- Real-time analytics
- Function logs
- Performance metrics
- Error tracking

Access at: https://vercel.com/dashboard

---

## 🔄 Future Deployments

Every push to the `main` branch will automatically deploy to Vercel!

```bash
# Make changes
git add .
git commit -m "Your changes"
git push origin main

# Vercel auto-deploys! 🚀
```

---

## 📞 Support

**Developer:** Shaheer Saud  
**Email:** shaheersaud2004@gmail.com  
**GitHub:** https://github.com/ShaheerSaud2004/LOANATicks

---

**Built with ❤️ using Next.js, MongoDB, and Vercel**

