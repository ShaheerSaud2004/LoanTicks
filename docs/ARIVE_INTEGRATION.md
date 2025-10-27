# ARIVE POS Integration Guide

## Overview

LoanTicks now integrates with ARIVE's Borrower Portal (POS) directly in the employee dashboard. Employees can view and submit borrower information to ARIVE without leaving the application.

---

## Features

✅ **Embedded ARIVE POS** - Full iframe integration in employee application view  
✅ **Borrower Portal Access** - Complete 1003 loan applications directly  
✅ **Document Management** - Upload and manage borrower documents  
✅ **Real-time Sync** - All submissions sync with ARIVE automatically  
✅ **Loan Officer URLs** - Each officer gets their unique POS link  

---

## Setup Instructions

### 1. Get Your ARIVE POS URL

Every Loan Officer in ARIVE has a unique Borrower Portal (POS) URL that automatically assigns applications to them.

**To find your POS URL in ARIVE:**

1. Log into your ARIVE account
2. Click the **profile icon** in the upper right corner
3. Hover your cursor over **Borrower Portal**
4. Click the **copy icon** (double square)
5. Your unique POS URL is now copied!

**Example URL format:**
```
https://your-organization.arive.com/pos/your-loan-officer-id
```

### 2. Configure Environment Variable

Add your ARIVE POS URL to your environment variables:

**For Development (.env.local):**
```bash
NEXT_PUBLIC_ARIVE_POS_URL=https://your-organization.arive.com/pos/your-id
```

**For Production (Vercel):**
1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add new variable:
   - **Name:** `NEXT_PUBLIC_ARIVE_POS_URL`
   - **Value:** Your ARIVE POS URL
   - **Environments:** Select Production, Preview, Development

### 3. Restart Your Development Server

```bash
npm run dev
```

---

## How to Use

### Accessing ARIVE POS

1. Navigate to **Employee Dashboard**
2. Click on any loan application
3. Click the **ARIVE POS** tab
4. The ARIVE Borrower Portal loads in an iframe

### Submitting Borrower Information

1. In the ARIVE POS tab, you'll see:
   - **Borrower Information** (name, email, phone)
   - **Loan Details** (amount, property value, LTV)
   - **Full ARIVE Portal** (embedded)

2. The borrower can:
   - Create an account or log in
   - Complete the 1003 loan application
   - Upload required documents
   - Track application status

### Inviting Borrowers

**Option 1: Share Your POS URL**
- Copy your POS URL from ARIVE
- Share via email signature, website, social media
- Borrowers create account and start application

**Option 2: Direct Loan Invitation (in ARIVE)**
- Open the loan file in ARIVE
- Click **+Invite Borrower**
- Choose invitation type:
  - **Full Application** - Complete 1003 form
  - **Document Only** - Skip form, upload docs only
- Preview/edit email and send

---

## ARIVE Portal Features

### For Borrowers

✅ **1003 Loan Application** - Complete URLA 2019 compliant form  
✅ **Document Upload** - Submit all required documents  
✅ **Task List** - Track and complete client needs  
✅ **Secure Portal** - Encrypted and compliant  
✅ **Mobile Friendly** - Works on any device  

### For Loan Officers

✅ **Auto-Assignment** - Loans created via your URL assign to you  
✅ **Application Tracking** - Monitor borrower progress  
✅ **Document Review** - View uploaded documents  
✅ **Communication** - Email borrowers directly  
✅ **Status Updates** - Real-time application status  

---

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LoanTicks Platform                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Employee Dashboard                          │    │
│  │                                                      │    │
│  │  ┌──────────┬──────────┬──────────┬──────────────┐ │    │
│  │  │  Split   │Documents │   Info   │  ARIVE POS  │ │    │
│  │  │  View    │   Only   │          │   ←─────    │ │    │
│  │  └──────────┴──────────┴──────────┴──────────────┘ │    │
│  │                                                      │    │
│  │  ┌────────────────────────────────────────────┐    │    │
│  │  │                                             │    │    │
│  │  │        ARIVE Borrower Portal (iframe)      │    │    │
│  │  │                                             │    │    │
│  │  │  • 1003 Loan Application                   │    │    │
│  │  │  • Document Upload                         │    │    │
│  │  │  • Task Management                         │    │    │
│  │  │  • Borrower Communication                  │    │    │
│  │  │                                             │    │    │
│  │  └────────────────────────────────────────────┘    │    │
│  │                                                      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ iframe embed
                            ▼
              ┌──────────────────────────┐
              │                          │
              │     ARIVE Platform       │
              │                          │
              │  • Loan Processing       │
              │  • Document Management   │
              │  • Compliance Checks     │
              │  • Underwriting          │
              │                          │
              └──────────────────────────┘
```

---

## Security & Compliance

### Iframe Security

The ARIVE iframe is configured with secure sandbox attributes:
```html
allow="camera; microphone; fullscreen; payment"
sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-downloads"
```

### Data Flow

1. **LoanTicks → ARIVE**: Borrower info displayed (read-only)
2. **ARIVE → Borrower**: Secure portal for data entry
3. **Borrower → ARIVE**: Direct submission (encrypted)
4. **ARIVE**: Processes and stores data securely

### Compliance

✅ **TILA-RESPA Integrated Disclosure (TRID)** compliant  
✅ **URLA 2019** form standard  
✅ **SSL/TLS** encryption in transit  
✅ **SOC 2** compliant infrastructure  
✅ **HMDA** reporting ready  

---

## Zapier Integration (Optional)

While the iframe handles borrower interaction, you can use Zapier to sync data between LoanTicks and ARIVE:

### Available Triggers
- New loan application submitted
- Document uploaded
- Application status changed
- Borrower message received

### Available Actions
- Create loan in ARIVE
- Update loan status
- Send borrower invitation
- Upload document

**Note:** Zapier is for data sync, not for embedding the POS portal.

---

## Troubleshooting

### Issue: Iframe doesn't load

**Solution:**
1. Check your `NEXT_PUBLIC_ARIVE_POS_URL` environment variable
2. Verify the URL is correct and accessible
3. Check browser console for CORS errors
4. Ensure ARIVE domain allows iframe embedding

### Issue: URL not configured

**Solution:**
- You'll see a yellow configuration warning
- Set the environment variable as shown above
- Restart your development server

### Issue: Borrowers can't access portal

**Solution:**
1. Verify POS URL is correct
2. Check ARIVE account is active
3. Ensure borrower has invitation email
4. Try accessing POS URL directly in browser

### Issue: Applications don't assign to loan officer

**Solution:**
- Make sure you're using your personal POS URL (not organization URL)
- Get your unique URL from ARIVE profile → Borrower Portal
- Each loan officer has a different URL

---

## FAQ

**Q: Do I need ARIVE API credentials?**  
A: No, the iframe integration works with just the POS URL.

**Q: Can borrowers see other applications?**  
A: No, borrowers only see their own applications when logged in.

**Q: Is the iframe secure?**  
A: Yes, it uses secure sandbox attributes and HTTPS.

**Q: Can I customize the ARIVE portal appearance?**  
A: Yes, customize settings in your ARIVE account under User Settings > POS App Config.

**Q: Does this work with Spanish applications?**  
A: Yes, ARIVE supports Spanish applications if enabled in your settings.

**Q: What if my POS URL changes?**  
A: Update the `NEXT_PUBLIC_ARIVE_POS_URL` environment variable and redeploy.

---

## Resources

- **ARIVE Support**: https://support.arive.com
- **Schedule Demo**: https://arive.com/demo
- **User Guides**: https://support.arive.com/helpdesk/user-guides/pos
- **Submit Ticket**: https://support.arive.com/helpdesk/tickets

---

## Next Steps

1. ✅ Get your ARIVE POS URL from your account
2. ✅ Add environment variable `NEXT_PUBLIC_ARIVE_POS_URL`
3. ✅ Restart development server
4. ✅ Test the integration in Employee Dashboard
5. ✅ Share POS URL with borrowers
6. ✅ Process applications through ARIVE

---

**Last Updated:** October 27, 2025  
**Integration Version:** 1.0  
**ARIVE Compatibility:** All plans

