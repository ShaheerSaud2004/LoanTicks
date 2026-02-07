# Outlook Email Setup (Notifications & Approval Emails)

The app sends notifications, account creation emails, home loan emails, and approval emails using either **Outlook** or Gmail.

## Preferred: Outlook

Set these in **Vercel** (Settings → Environment Variables) and in **local** `.env.local`:

| Variable | Value | Notes |
|----------|--------|------|
| `EMAIL_USER` | `RUQAYYAYASIN@outlook.com` | Sender address |
| `EMAIL_APP_PASSWORD` | Your Outlook app password | No spaces; generate in Microsoft account |

### Getting an Outlook App Password

1. Go to [Microsoft Account Security](https://account.microsoft.com/security)
2. Under **Security basics**, use **Advanced security options**
3. Under **App passwords**, create a new app password
4. Copy the 16-character password (e.g. `sjyi tdkh elwi vkkz` → use `sjyitdkhelwivkkz` in env, no spaces)

The app uses Outlook SMTP (`smtp.office365.com`, port 587) when `EMAIL_USER` and `EMAIL_APP_PASSWORD` are set.

## Fallback: Gmail

If Outlook is not set, the app can use Gmail:

| Variable | Value |
|----------|--------|
| `GMAIL_USER` | your@gmail.com |
| `GMAIL_APP_PASSWORD` | Gmail app password |

## Where This Email Is Used

- **Arive POS (Admin/Employee):** “Send” button sends an approval email to the customer: “You are approved – please sign up on this link and fill it out.”
- **Account creation:** (when wired) welcome/verification emails
- **Home loan / notifications:** (when wired) status and notification emails

## Security

- **Never commit** app passwords or `.env.local` to git.
- Store `EMAIL_USER` and `EMAIL_APP_PASSWORD` only in Vercel Environment Variables and local `.env.local`.
