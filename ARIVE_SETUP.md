# 🚀 ARIVE POS Quick Setup

## What's New?

Your employee dashboard now has **ARIVE POS integration**! Employees can submit borrower information directly to ARIVE without leaving LoanTicks.

---

## 📋 Setup in 3 Steps

### Step 1: Get Your ARIVE POS URL

1. Log into **ARIVE**
2. Click **profile icon** (top right)
3. Hover over **Borrower Portal**
4. Click the **copy icon** 📋
5. You now have your unique POS URL!

**Example:**
```
https://your-organization.arive.com/pos/your-loan-officer-id
```

---

### Step 2: Add to Environment Variables

#### For Local Development

Create `.env.local` file in your project root:

```bash
# .env.local
NEXT_PUBLIC_ARIVE_POS_URL=https://your-organization.arive.com/pos/your-id
```

#### For Vercel Production

1. Go to your **Vercel Dashboard**
2. Select your **LoanTicks** project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name:** `NEXT_PUBLIC_ARIVE_POS_URL`
   - **Value:** Your ARIVE POS URL (from Step 1)
   - **Environment:** Production, Preview, Development

5. Click **Save**
6. **Redeploy** your application

---

### Step 3: Restart & Test

```bash
# Stop your dev server (Ctrl+C)
npm run dev
```

---

## ✅ How to Use

### For Employees

1. Go to **Employee Dashboard**
2. Click any loan application
3. Click **ARIVE POS** tab (new green tab!)
4. The ARIVE Borrower Portal loads
5. Submit borrower info directly

### What Employees See

✅ **Borrower Info Card** - Name, email, phone  
✅ **Loan Details Card** - Amount, value, LTV  
✅ **Full ARIVE Portal** - Complete 1003 application  
✅ **Instructions** - Step-by-step guide  
✅ **Open in New Tab** - Link to full ARIVE portal  

---

## 🎯 Features

| Feature | Description |
|---------|-------------|
| **Embedded Portal** | Full ARIVE POS in iframe |
| **1003 Application** | Borrowers complete URLA 2019 form |
| **Document Upload** | Submit all required docs |
| **Auto-Assignment** | Apps created via your URL assign to you |
| **Mobile Friendly** | Works on all devices |
| **Secure** | SSL encrypted, sandbox protected |

---

## 🔍 Testing

1. After setup, go to: `http://localhost:3000/employee/dashboard`
2. Click any application
3. Click **ARIVE POS** tab
4. You should see:
   - Green header "ARIVE Borrower Portal (POS)"
   - Instructions section
   - Embedded ARIVE iframe
   - Borrower info cards
   - Configuration status

---

## ⚠️ Troubleshooting

### Yellow Configuration Warning?

**Problem:** You see a yellow box saying "Set your ARIVE POS URL"

**Solution:**
1. Make sure you added `NEXT_PUBLIC_ARIVE_POS_URL` to environment variables
2. Restart your dev server: `npm run dev`
3. For Vercel: Redeploy after adding env variable

### Iframe Not Loading?

**Problem:** Blank iframe or error message

**Solution:**
1. Check your ARIVE POS URL is correct
2. Try opening the URL directly in browser
3. Verify ARIVE account is active
4. Check browser console for errors

### Applications Not Assigning to You?

**Problem:** Apps created via POS don't show in your ARIVE account

**Solution:**
- Use your **personal** POS URL (not organization URL)
- Each loan officer has a unique URL
- Get it from: Profile → Borrower Portal → Copy

---

## 📚 Full Documentation

For complete details, see: [`docs/ARIVE_INTEGRATION.md`](./docs/ARIVE_INTEGRATION.md)

Includes:
- Architecture diagrams
- Security & compliance info
- Zapier integration options
- Detailed troubleshooting
- FAQ section

---

## 🎉 Benefits

✅ **No Platform Switching** - Everything in one place  
✅ **Faster Processing** - Direct submission to ARIVE  
✅ **Better UX** - Employees stay in familiar interface  
✅ **Automatic Sync** - Real-time data updates  
✅ **Compliance Ready** - URLA 2019 & TRID compliant  

---

## 💡 Tips

1. **Share Your POS URL** - Add to email signature, website, social media
2. **Invite Directly** - Use ARIVE's invite feature for existing loans
3. **Use Split View** - Compare documents with ARIVE portal side-by-side
4. **Mobile Testing** - Test on phones/tablets for borrower experience

---

## 🆘 Support

- **ARIVE Support**: https://support.arive.com
- **Submit Ticket**: https://support.arive.com/helpdesk/tickets
- **User Guides**: https://support.arive.com/helpdesk/user-guides

---

**Ready to go!** 🚀 Your ARIVE integration is live and ready to use.

