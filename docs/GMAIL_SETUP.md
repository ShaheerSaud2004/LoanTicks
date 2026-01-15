# 📧 Gmail Email Setup Guide

## Quick Setup

Your application is now configured to send emails using your Gmail account: **shaheersaud2004@gmail.com**

## Step 1: Generate Gmail App Password

Gmail requires an **App Password** (not your regular password) for third-party applications.

### Instructions:

1. **Go to your Google Account:**
   - Visit: https://myaccount.google.com
   - Sign in with: shaheersaud2004@gmail.com

2. **Enable 2-Step Verification** (if not already enabled):
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow the setup process

3. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Or: Google Account → Security → 2-Step Verification → App passwords
   - Select app: **Mail**
   - Select device: **Other (Custom name)**
   - Enter name: **LoanTicks**
   - Click **Generate**

4. **Copy the 16-character password:**
   - You'll see something like: `abcd efgh ijkl mnop`
   - Copy this password (remove spaces when using)

## Step 2: Add Environment Variables

### For Local Development (.env.local):

Create or update `.env.local` in your project root:

```env
GMAIL_USER=shaheersaud2004@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password-here
```

**Important:** 
- Use the **App Password** (16 characters), NOT your regular Gmail password
- Remove any spaces from the app password
- Never commit this file to git (it's already in .gitignore)

### For Vercel Production:

1. Go to **Vercel Dashboard**
2. Select your **LoanTicks** project
3. Go to **Settings** → **Environment Variables**
4. Add these two variables:

#### Variable 1:
- **Name:** `GMAIL_USER`
- **Value:** `shaheersaud2004@gmail.com`
- **Environment:** Production, Preview, Development

#### Variable 2:
- **Name:** `GMAIL_APP_PASSWORD`
- **Value:** `your-16-character-app-password` (no spaces)
- **Environment:** Production, Preview, Development

5. Click **Save**
6. **Redeploy** your application

## Step 3: Test Email Sending

1. Go to **Employee Dashboard**
2. Open any loan application
3. Click the **ARIVE POS** tab
4. Click **Send Email** button
5. Check the borrower's email inbox (and spam folder)

## Troubleshooting

### "Gmail not configured" error
- ✅ Check `GMAIL_USER` is set correctly
- ✅ Check `GMAIL_APP_PASSWORD` is set correctly
- ✅ Make sure there are no spaces in the app password
- ✅ Restart your dev server after adding variables

### "Invalid login" error
- ✅ Make sure you're using an **App Password**, not your regular password
- ✅ Verify 2-Step Verification is enabled
- ✅ Regenerate the app password if needed

### "Email not received"
- ✅ Check spam/junk folder
- ✅ Verify recipient email is correct
- ✅ Check Gmail account for any security alerts
- ✅ Verify app password hasn't been revoked

### Gmail sending limits
- **Free Gmail:** 500 emails per day
- **Google Workspace:** 2,000 emails per day
- If you hit limits, consider upgrading to Google Workspace or using a dedicated email service

## Security Notes

- ✅ App passwords are more secure than regular passwords
- ✅ You can revoke app passwords anytime
- ✅ Each app password is unique and can be deleted independently
- ✅ Never share your app password publicly

## Environment Variables Summary

| Variable | Value | Required |
|----------|-------|----------|
| `GMAIL_USER` | shaheersaud2004@gmail.com | ✅ Yes |
| `GMAIL_APP_PASSWORD` | Your 16-character app password | ✅ Yes |

## Next Steps

1. Generate Gmail App Password (see Step 1)
2. Add environment variables to `.env.local` (local) and Vercel (production)
3. Test email sending
4. Monitor email delivery

That's it! Your emails will now be sent from **shaheersaud2004@gmail.com** via Gmail SMTP.
