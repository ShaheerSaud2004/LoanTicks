#!/usr/bin/env node

/**
 * Legacy helper: POST /api/cleanup-database now requires an **admin** session
 * (and optional header `x-cleanup-secret` if CLEANUP_DATABASE_SECRET is set).
 *
 * Prefer direct DB cleanup from your machine:
 *   CLEANUP_CONFIRM=YES npx tsx scripts/cleanup-test-data.ts
 *
 * Optional: INCLUDE_SEED_ACCOUNTS=true to also remove seed users (admin@ / employee@ / customer@).
 */

console.log(`
Database cleanup (demo/test users only)

1) CLI (uses MONGODB_URI from .env.local):
   CLEANUP_CONFIRM=YES npm run cleanup:test-data

2) HTTP (must be logged in as admin in the browser; same-origin fetch from /admin):
   POST /api/cleanup-database
   Body (optional): { "includeSeedAccounts": true }
   Header (if set in Vercel): x-cleanup-secret: <CLEANUP_DATABASE_SECRET>
`);

process.exit(0);
