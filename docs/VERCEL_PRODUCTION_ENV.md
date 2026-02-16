# Vercel Production Environment

**Do you need NEXTAUTH_SECRET?** Yes. NextAuth (Auth.js) requires a secret to sign and encrypt session cookies (see [NextAuth Errors](https://next-auth.js.org/configuration/pages#errors) — NO_SECRET, JWT_SESSION_ERROR). There is no secure way to use NextAuth without it in production. This app:

- Passes **secret** in the auth config (from `AUTH_SECRET` or `NEXTAUTH_SECRET`).
- Uses **JWT sessions** (`session.strategy: 'jwt'`) so the Credentials provider works (CALLBACK_CREDENTIALS_JWT_ERROR).
- Uses **Node.js runtime** for the auth API route so Vercel injects env vars at request time.

---

## ⚠️ "Configuration" / "Server configuration error" when clicking Admin Login

**If your secret contains `+` or `/`** (e.g. `Zk7+vN9xQ8mP2wL5rA3tY6nH4jB8cD1fG0sV7kM9uX2`), Vercel can corrupt it unless you **wrap the value in double quotes**.

1. In Vercel → **Settings** → **Environment Variables**:
   - Edit **NEXTAUTH_SECRET** (or add **AUTH_SECRET** with the same value).
   - Set the **Value** to the secret **in double quotes**, e.g.  
     `"Zk7+vN9xQ8mP2wL5rA3tY6nH4jB8cD1fG0sV7kM9uX2"`  
   - No spaces inside the quotes; the quotes are required so `+` and `/` are preserved.
2. Enable the variable for **Production** (and Preview if you use it).
3. **Redeploy**: **Deployments** → ⋮ on latest deployment → **Redeploy** → **Clear cache and redeploy**.

After redeploy, try Admin Login again.

---

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

---

## Still seeing "NEXTAUTH_SECRET Server configuration error"?

If login returns **Configuration** and logs show this error even though NEXTAUTH_SECRET (and/or AUTH_SECRET) is set in Vercel:

1. **Set both secrets for Production**  
   NextAuth v5 (Auth.js) checks `AUTH_SECRET` first, then `NEXTAUTH_SECRET`. In **Settings → Environment Variables**:
   - Add or edit **AUTH_SECRET** and **NEXTAUTH_SECRET**.
   - Use the **same value** for both (e.g. from `openssl rand -base64 32`).
   - Enable **Production** (and Preview if you use it) for **both** variables.

2. **Avoid value corruption**  
   - No leading or trailing spaces when pasting the secret.  
   - If the secret contains `+` or `/` (common in base64), in Vercel set the value **in quotes**, e.g. `"Zk7+vN9xQ8mP2wL5rA3tY6nH4jB8cD1fG..."`.

3. **Redeploy so env vars are applied**  
   Env vars are applied at **deploy time**, not at runtime. After any change:
   - Go to **Deployments** → ⋮ on the latest deployment → **Redeploy**.
   - Prefer **Redeploy** with **Clear cache and redeploy** so the new env is picked up.

4. **Confirm Production**  
   Ensure the URL you’re testing (e.g. `https://www.loanaticks.com`) is served by a **Production** deployment, not a Preview, so the Production env vars are used.

---

## Quick login shows "Invalid email or password" or CallbackRouteError

If Vercel logs show **"Authorization error: Error: Invalid email or password"** and **CallbackRouteError**, the **secret/configuration is working** — the failure is that the demo user doesn’t exist in the production DB (or the password is wrong).

Quick login (Admin / Employee / Customer) uses demo users that must exist in the **production** database. If you see "Invalid email or password" (not "Configuration"):

1. **Seed the production database** with the same users as local:
   - Set `MONGODB_URI` in Vercel to your **production** MongoDB connection string.
   - Run the seed script **once** against that DB (e.g. from your machine with `MONGODB_URI` pointing to production): `npm run seed`
   - Demo users: `admin@loanaticks.com` / `Admin123!@#$`, `employee@loanaticks.com` / `Employee123!@#`, `customer@loanaticks.com` / `Customer123!@#`.

2. The app now explicitly uses `AUTH_SECRET || NEXTAUTH_SECRET` for session signing, so set at least one (or both with the same value) for Production and redeploy.
