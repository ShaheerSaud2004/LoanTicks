# 🧪 LOANATicks - Testing Guide

## ✅ How to Test Login (Step by Step)

### Step 1: Open the Site
Go to: **https://loanaticks.vercel.app**

You should be automatically redirected to: **https://loanaticks.vercel.app/login**

### Step 2: Use These EXACT Credentials

#### Test Admin Login:
```
Email: admin@loanaticks.com
Password: admin123
```

#### Test Employee Login:
```
Email: employee@loanaticks.com
Password: employee123
```

#### Test Customer Login:
```
Email: customer@loanaticks.com
Password: customer123
```

### Step 3: What Should Happen

1. **After clicking "Sign In to Account":**
   - Button should show "Authenticating..." with a spinner
   - Page should redirect to the appropriate dashboard

2. **Expected Redirects:**
   - Admin → `/admin/dashboard`
   - Employee → `/employee/dashboard`
   - Customer → `/customer/dashboard`

3. **On Dashboard:**
   - You should see your name
   - You should see a "Logout" button
   - You should see role-specific content

### Step 4: Test Logout

1. Click the **"Logout"** button in the top-right
2. You should be redirected back to `/login`
3. Try logging in again with different credentials

---

## 🔍 Troubleshooting

### If Login Button Does Nothing:
1. Open browser console (F12 → Console tab)
2. Try to login
3. Look for error messages
4. Send screenshot to developer

### If You See "Invalid email or password":
- Double-check you're using EXACT credentials above
- Make sure there are no extra spaces
- Try copy-pasting the email and password

### If Page Shows 500 Error:
- Wait 30 seconds and refresh
- The server might be cold-starting (MongoDB Atlas free tier)

### If Stuck on Loading:
- Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Clear browser cache
- Try in incognito/private mode

---

## 📊 Current Status

✅ **Login Page:** https://loanaticks.vercel.app/login  
✅ **Auth API:** https://loanaticks.vercel.app/api/auth/providers  
✅ **Database:** MongoDB Atlas (Connected)  
✅ **Demo Users:** Seeded and ready  

---

## 🚨 If STILL Not Working

### Check 1: Are demo users in database?
Run locally:
```bash
cd /Users/shaheersaud/LOANATicks
npm run seed
```

### Check 2: Check Vercel logs
```bash
vercel logs https://loanaticks.vercel.app
```

### Check 3: Test locally
```bash
npm run dev
# Visit http://localhost:3000
# Try logging in locally
```

---

## ✅ Expected Flow

```
1. Visit loanaticks.vercel.app
   └─> Redirects to /login

2. Enter credentials & click "Sign In"
   └─> POST to /api/auth/callback/credentials
       └─> MongoDB checks user & password
           └─> If valid: Creates session (JWT)
               └─> Redirects to dashboard
           └─> If invalid: Shows error message

3. On Dashboard
   └─> Can see content
   └─> Can logout
```

---

**Last Updated:** Oct 12, 2025  
**Developer:** Shaheer Saud | shaheersaud2004@gmail.com

