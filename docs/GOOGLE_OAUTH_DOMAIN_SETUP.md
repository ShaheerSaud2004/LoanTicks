# Google OAuth: Which Domain to Use?

## Use one canonical site URL

Set **`NEXTAUTH_URL`** (and optionally **`AUTH_URL`**) in Vercel to the **exact** origin users use in the browser, for example:

```bash
NEXTAUTH_URL=https://www.loanaticks.com
AUTH_URL=https://www.loanaticks.com
```

Your middleware redirects `loanaticks.com` → `www.loanaticks.com`, so the canonical production URL should include **`www`** to match cookies and OAuth redirects.

## Google Cloud Console: Authorized redirect URIs

Add every origin where users can sign in (each becomes `{origin}/api/auth/callback/google`):

```
http://localhost:3000/api/auth/callback/google
https://<your-vercel-project>.vercel.app/api/auth/callback/google
https://www.loanaticks.com/api/auth/callback/google
https://loanaticks.com/api/auth/callback/google
```

The list must include the origin implied by `NEXTAUTH_URL`, or Google will return **`redirect_uri_mismatch`**.

## Vercel variables (example placeholders only)

```bash
NEXTAUTH_URL=https://www.loanaticks.com
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
NEXTAUTH_SECRET=<long random string, 32+ characters>
MONGODB_URI=<your MongoDB connection string>
```

Never commit real `GOOGLE_CLIENT_*` or `NEXTAUTH_SECRET` values to git.

## Summary

- **`NEXTAUTH_URL`**: Must match the live site origin (recommended: `https://www.loanaticks.com`).
- **Google Console**: Register redirect URIs for localhost, Vercel preview/production, and both apex and `www` if you use them.
