/**
 * Run before loading auth so Vercel env is available.
 * Ensures AUTH_SECRET is set from NEXTAUTH_SECRET so Auth.js always sees one.
 */
if (typeof process !== 'undefined' && process.env && !process.env.AUTH_SECRET && process.env.NEXTAUTH_SECRET) {
  process.env.AUTH_SECRET = process.env.NEXTAUTH_SECRET;
}
export {};
