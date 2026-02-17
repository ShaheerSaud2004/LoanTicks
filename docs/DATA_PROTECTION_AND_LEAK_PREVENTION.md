# How Your Data Is Protected (So It Won’t Leak)

This doc explains how the app keeps sensitive data from leaking: **passwords**, **auth secrets**, **user/application data**, and **seed/demo data**.

---

## 1. Passwords

**How it’s protected:**

- **Never stored in plain text.**  
  In `models/User.ts`, every password is **hashed with bcrypt** (10 rounds) in a `pre('save')` hook before being written to MongoDB. The database only ever stores the hash, not the actual password.

- **Never sent back to the client.**  
  API responses and session objects do not include the `password` field. Only id, email, name, role (and similar) are exposed.

- **Not logged.**  
  Auth code in `lib/auth.ts` does not log emails or passwords. In development it may log generic messages like “User not found” or “Invalid password” only.

**So:**  
Passwords don’t leak from the DB, from API responses, or from app logs. They only exist in plain form in the user’s browser at login and in memory briefly on the server before hashing.

---

## 2. Auth secrets (sessions, cookies)

**How it’s protected:**

- **Secrets live only in environment variables.**  
  `AUTH_SECRET` or `NEXTAUTH_SECRET` are read from the server environment (e.g. Vercel env vars). They are **not** in source code or in the repo.

- **Used only on the server.**  
  NextAuth uses the secret to sign/verify session cookies. It’s never sent to the client or exposed in HTML/JS.

**So:**  
Session and cookie security depend on the secret; the secret is not in the codebase and is not logged, so it won’t leak from the app.

---

## 3. User and application data (PII / financial)

**How it’s protected:**

- **Access control.**  
  Routes and APIs are protected by auth and role checks. Customers see only their own data; employees/admins have scoped access. Unauthenticated or wrong-role requests are rejected.

- **Sensitive fields encrypted at rest (when implemented).**  
  Per `lib/encryption.ts` and the security docs, sensitive fields (e.g. SSN, bank account numbers) are intended to be encrypted with AES-256-GCM using a key from `ENCRYPTION_KEY`. Encryption key is only in server env, not in code or client.

- **No user emails/passwords in production logs.**  
  Auth and login paths avoid logging emails or any user credentials. Generic messages only.

- **HTTPS in production.**  
  On Vercel (or similar), traffic is over HTTPS so data in transit is encrypted.

**So:**  
PII and financial data are not exposed to the wrong users, and sensitive values are not written to logs. Encryption (when used) keeps them protected at rest; env keeps the key off the repo and out of client.

---

## 4. Seed script and demo accounts

**What the seed script does:**

- **Passwords in the script are only for creating users.**  
  `scripts/seed.ts` defines demo users with emails and passwords. Those passwords are **only** used to create User documents. When you call `user.save()`, the User model’s `pre('save')` hook hashes the password with bcrypt. So the **database never stores** the plain-text demo passwords.

- **Passwords are no longer printed.**  
  The seed script was updated so it does **not** log passwords to the console. It only logs role and email (e.g. `ADMIN: admin@loanaticks.com`). So running the script (locally or in CI) does not put passwords into terminal output or log aggregation.

- **Repo access = demo credentials in source.**  
  The demo passwords **do** exist in plain text in `scripts/seed.ts` in the repo. Anyone with read access to the repo can see them. That’s intentional for **demo** accounts only. For production, you should either:  
  - Use different, non-demo accounts and never commit their passwords, or  
  - Store production seed credentials outside the repo (e.g. secret manager) and inject them when running the script.

**So:**  
Demo data is not leaked via logs. DB only has hashed passwords. The only place plain-text demo passwords exist is in the seed script in the repo, by design for demo use.

---

## 5. Quick checklist (what we do so data doesn’t leak)

| Item | Protection |
|------|------------|
| User passwords | Bcrypt-hashed before save; never in API response or logs |
| Auth secret | Env only (`AUTH_SECRET` / `NEXTAUTH_SECRET`); never in code or client |
| Encryption key | Env only (`ENCRYPTION_KEY`); used only for sensitive field encryption |
| User/application PII | Auth + role checks; no emails/passwords in production logs |
| Seed script | No longer logs passwords; DB only stores hashed passwords |
| HTTPS | Used in production so data in transit is encrypted |

---

## 6. What you should do on your side

- **Set strong, unique values in production** for `AUTH_SECRET`/`NEXTAUTH_SECRET`, `ENCRYPTION_KEY`, and `MONGODB_URI` (e.g. in Vercel env vars), and never commit them.
- **Restrict repo access** so only trusted people see the code (and thus the demo passwords in `scripts/seed.ts`).
- **Don’t run the seed script with production DB** unless you intend to create those demo users; for real users, use signup or admin flows so passwords are never in the repo.
- **Keep dependencies and deployment config updated** so you get security fixes (e.g. NextAuth, Next.js, Node).

Following the above, **passwords, auth secrets, and sensitive data are not stored or logged in a way that allows them to leak** from the app; the only plain-text demo passwords are in the seed script in the repo by design for demo use.
