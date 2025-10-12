# 🚀 Quick Setup Guide

Follow these steps to get LoanTicks running on your machine in under 5 minutes!

## Prerequisites Check

Make sure you have:
- ✅ Node.js 18 or higher (`node --version`)
- ✅ MongoDB installed or MongoDB Atlas account
- ✅ Terminal/Command Prompt access

## Setup Steps

### 1️⃣ Install Dependencies

```bash
cd /Users/shaheersaud/LoanTicks/loanticks
npm install
```

### 2️⃣ Configure Environment

Create `.env.local` file:

```bash
cp .env.example .env.local
```

**For Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/loanticks
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-your-generated-secret
```

**Generate a secret:**
```bash
openssl rand -base64 32
```

### 3️⃣ Start MongoDB

**Local MongoDB:**
```bash
# macOS/Linux
mongod

# Or if installed via Homebrew
brew services start mongodb-community
```

**MongoDB Atlas:**
- Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Create free cluster
- Get connection string
- Update `MONGODB_URI` in `.env.local`

### 4️⃣ Seed Demo Users

```bash
npm run seed
```

You should see:
```
✓ Created admin: admin@loanticks.com
✓ Created employee: employee@loanticks.com
✓ Created customer: customer@loanticks.com
✅ Database seeded successfully!
```

### 5️⃣ Start Development Server

```bash
npm run dev
```

Open browser: **http://localhost:3000**

## 🎉 You're Ready!

### Login with Demo Accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@loanticks.com | admin123 |
| **Employee** | employee@loanticks.com | employee123 |
| **Customer** | customer@loanticks.com | customer123 |

## 🐛 Common Issues

### "Module not found" error
```bash
rm -rf node_modules package-lock.json
npm install
```

### MongoDB connection refused
- Check if MongoDB is running: `ps aux | grep mongod`
- Start MongoDB: `mongod` or `brew services start mongodb-community`

### Port 3000 already in use
```bash
# Use different port
PORT=3001 npm run dev
```

### Authentication not working
- Check `.env.local` exists and has correct values
- Restart dev server: `Ctrl+C` then `npm run dev`
- Clear browser cookies

## ✅ Verification Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` file created with correct values
- [ ] MongoDB running (local or Atlas)
- [ ] Database seeded (`npm run seed`)
- [ ] Dev server running (`npm run dev`)
- [ ] Can access http://localhost:3000
- [ ] Can login with demo credentials

## 📞 Need Help?

Check the main README.md for detailed documentation or contact:
- **Developer:** Shaheer Saud
- **Email:** shaheersaud2004@gmail.com

