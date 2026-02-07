# Vercel Production Environment

To fix **400** on `/api/auth/providers` and `/api/auth/error` and ensure login works on production:

## Required variables (Production + Preview if you use preview URLs)

1. **NEXTAUTH_URL**  
   Set to your **site’s base URL (origin only)** — **not** the login page URL:
   - Correct: `NEXTAUTH_URL=https://www.loanaticks.com` (no path, no trailing slash)
   - Wrong: `NEXTAUTH_URL=https://www.loanaticks.com/login`  
   NextAuth uses this as the app origin for callbacks and redirects. The login screen is at `/login` (set in the app). This value is also exposed to the client via `next.config` so that visiting the base URL (e.g. homepage) does not trigger auth errors from the client calling the wrong origin. Mismatch or including `/login` causes 400 or “NextAuth error” on the base URL.

2. **NEXTAUTH_SECRET**  
   A long random string (e.g. `openssl rand -base64 32`). Required for signing sessions.

3. **MONGODB_URI**  
   Your MongoDB connection string.

4. **ENCRYPTION_KEY**  
   Required in production for encrypting sensitive data. Use a 64-character hex string:  
   `openssl rand -hex 32`  
   Or a long passphrase (32+ chars); it will be derived with PBKDF2.

## Optional

- **OPENAI_API_KEY** or **OpenAIKey** – for chatbot.
- **EMAIL_USER** – sender email (e.g. your Outlook address). Required **with** **EMAIL_APP_PASSWORD** for approval/notification emails. Without EMAIL_USER, “Send approval email” will not send.

## After changing env vars

Redeploy the project so the new values are applied.
