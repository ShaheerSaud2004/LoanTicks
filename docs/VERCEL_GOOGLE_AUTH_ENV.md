# Vercel Environment Variables for Google OAuth

Add these in Vercel → Project → Settings → Environment Variables (Production, Preview, and Development as needed). **Never commit real client IDs or secrets to the repository.**

## Required (Google sign-in)

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 Client Secret from Google Cloud Console |

## How to add

1. Open your [Vercel project](https://vercel.com/dashboard).
2. **Settings** → **Environment Variables** → **Add New**.
3. Paste the name and value, select environments, save.
4. **Redeploy** the project so new values are available at runtime.

## Security

- Store secrets only in Vercel (or a secrets manager), not in git or chat logs.
- If a secret was ever committed to a repo, **rotate it** in Google Cloud and update Vercel.

## Optional: GitHub sign-in

If you enable GitHub OAuth in the app, add either the Auth.js-style names or the explicit names (the code accepts both):

| Variable | Alternative |
|----------|-------------|
| `AUTH_GITHUB_ID` | `GITHUB_ID` |
| `AUTH_GITHUB_SECRET` | `GITHUB_SECRET` |

Callback URL in GitHub OAuth App settings: `https://www.loanaticks.com/api/auth/callback/github` (and preview URLs if you use them).
