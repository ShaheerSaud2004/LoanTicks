# 📧 Email Setup Guide

## Overview

The ARIVE section now includes an email button that sends preliminary approval emails to borrowers with a link to complete their application in the ARIVE portal.

## Current Implementation

### Development Mode
- Currently logs emails to the console
- No actual emails are sent
- Perfect for testing the email template

### Production Setup Required

To send actual emails in production, you need to configure an email service. Here are recommended options:

## Option 1: Resend (Recommended for Next.js)

### 1. Sign up for Resend
- Visit: https://resend.com
- Create a free account (100 emails/day free tier)

### 2. Get API Key
- Go to API Keys section
- Create a new API key
- Copy the key

### 3. Install Resend
```bash
npm install resend
```

### 4. Update API Route
Update `app/api/send-arive-email/route.ts`:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Replace the email sending section with:
const { data, error } = await resend.emails.send({
  from: 'LOANATICKS <noreply@yourdomain.com>',
  to: borrowerEmail,
  subject: emailSubject,
  html: emailBody,
});

if (error) {
  return NextResponse.json({ error: error.message }, { status: 500 });
}
```

### 5. Add Environment Variable
In Vercel:
- Variable: `RESEND_API_KEY`
- Value: Your Resend API key
- Environment: Production, Preview

## Option 2: SendGrid

### 1. Sign up for SendGrid
- Visit: https://sendgrid.com
- Create account (100 emails/day free tier)

### 2. Get API Key
- Go to Settings → API Keys
- Create API key with "Mail Send" permissions

### 3. Install SendGrid
```bash
npm install @sendgrid/mail
```

### 4. Update API Route
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

await sgMail.send({
  to: borrowerEmail,
  from: 'noreply@yourdomain.com',
  subject: emailSubject,
  html: emailBody,
});
```

### 5. Add Environment Variable
- Variable: `SENDGRID_API_KEY`
- Value: Your SendGrid API key

## Option 3: AWS SES

### 1. Set up AWS SES
- Configure verified domain/email
- Get AWS credentials

### 2. Install AWS SDK
```bash
npm install @aws-sdk/client-ses
```

### 3. Update API Route
```typescript
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({ region: 'us-east-1' });

await sesClient.send(new SendEmailCommand({
  Source: 'noreply@yourdomain.com',
  Destination: { ToAddresses: [borrowerEmail] },
  Message: {
    Subject: { Data: emailSubject },
    Body: { Html: { Data: emailBody } },
  },
}));
```

## Email Template Features

The email template includes:
- ✅ Professional design with gradient header
- ✅ Preliminary approval message
- ✅ Clear call-to-action button
- ✅ ARIVE portal link
- ✅ Step-by-step instructions
- ✅ Mobile-responsive design

## Testing

### In Development
1. Click "Send Email" button in ARIVE section
2. Check console for email content
3. Verify all information is correct

### In Production
1. Configure email service (see options above)
2. Add API key to environment variables
3. Test with a real email address
4. Verify email is received and formatted correctly

## Email Content

The email includes:
- **Subject:** "🎉 Preliminary Approval - Complete Your Loan Application"
- **Message:** Personalized greeting with borrower name
- **Approval Notice:** Clear preliminary approval notification
- **Next Steps:** Instructions to create account and complete application
- **ARIVE Link:** Direct link to borrower portal
- **Application Details:** Link to complete 1003 form

## Security Notes

- ✅ Email addresses are validated before sending
- ✅ Only employees and admins can send emails
- ✅ ARIVE URL is validated and uses HTTPS
- ✅ Email content is sanitized (HTML template)

## Troubleshooting

### Email not sending
1. Check environment variables are set correctly
2. Verify API key is valid
3. Check email service account limits
4. Review server logs for errors

### Email not received
1. Check spam/junk folder
2. Verify email address is correct
3. Check email service delivery logs
4. Ensure domain is verified (if required)

## Next Steps

1. Choose an email service provider
2. Set up account and get API key
3. Update `app/api/send-arive-email/route.ts` with service integration
4. Add API key to Vercel environment variables
5. Test email sending in production
