# Vercel Production Environment

**Do you need NEXTAUTH_SECRET?** Yes. NextAuth (Auth.js) requires a secret to sign and encrypt session cookies. There is no secure way to use NextAuth without it in production. The app is configured to use **Node.js runtime** for the auth API route so Vercel injects env vars correctly.

To fix **400** on `/api/auth/session`, **Configuration** on login, and ensure login works on production:

## Required variables (Production + Preview if you use preview URLs)

1. **NEXTAUTH_URL**  
   Set to your **site’s base URL (origin only)** — **not** the login page URL:
   - Correct: `NEXTAUTH_URL=https://www.loanaticks.com` (no path, no trailing slash)
   - Wrong: `NEXTAUTH_URL=https://www.loanaticks.com/login`  
   NextAuth uses this as the app origin for callbacks and redirects. The login screen is at `/login` (set in the app). This value is also exposed to the client via `next.config` so that visiting the base URL (e.g. homepage) does not trigger auth errors from the client calling the wrong origin. Mismatch or including `/login` causes 400 or “NextAuth error” on the base URL.

2. **NEXTAUTH_SECRET** (or **AUTH_SECRET**)  
   A long random string (e.g. `openssl rand -base64 32`). Required for signing sessions. Set **one** of these; the app checks both.  
   **If login returns “Configuration” on https://www.loanaticks.com/login** or you see “Server configuration error…” in runtime logs:
   - In Vercel → Project → **Settings** → **Environment Variables**, add or edit **NEXTAUTH_SECRET** (or **AUTH_SECRET**).
   - Value: paste the secret with **no leading or trailing spaces**.
   - Enable it for **Production** (and **Preview** if you use preview URLs).
   - **Redeploy**: Deployments → ⋮ on latest deployment → **Redeploy** (optionally **Clear cache and redeploy**). Env vars are applied at deploy time; a redeploy is required after adding or changing them.
   - If it still fails, add **AUTH_SECRET** with the **same value** as NEXTAUTH_SECRET (Auth.js checks both). Ensure the value has no leading/trailing spaces; if it contains `+` or `/`, try wrapping the value in quotes in Vercel.

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
