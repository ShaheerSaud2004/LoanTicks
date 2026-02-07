# Vercel Production Environment

To fix **400** on `/api/auth/providers` and `/api/auth/error` and ensure login works on production:

## Required variables (Production + Preview if you use preview URLs)

1. **NEXTAUTH_URL**  
   Set to the **exact** URL users see in the browser:
   - If your site is `https://www.loanaticks.com` → `NEXTAUTH_URL=https://www.loanaticks.com`
   - If your site is `https://loanaticks.com` (no www) → `NEXTAUTH_URL=https://loanaticks.com`  
   **No trailing slash** (use `https://www.loanaticks.com` not `https://www.loanaticks.com/`). Mismatch causes 400 on auth routes.

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
