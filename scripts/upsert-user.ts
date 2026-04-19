/**
 * Upsert ONE user for production or staging — does NOT delete other users.
 *
 * Password rules (same as models/User.ts): 12+ chars, upper, lower, number,
 * special from @$!%*?&
 *
 * Example (point at production DB only when you intend to):
 *   MONGODB_URI='mongodb+srv://...' \
 *   UPSERT_EMAIL='shaheersaud2004@gmail.com' \
 *   UPSERT_PASSWORD='YourStrongPass1@' \
 *   UPSERT_ROLE=admin \
 *   npx tsx scripts/upsert-user.ts
 */
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

import connectDB from '../lib/mongodb';
import User from '../models/User';
import type { UserRole } from '../models/User';

const ROLES: UserRole[] = ['admin', 'employee', 'customer'];

function parseBool(v: string | undefined, defaultTrue: boolean): boolean {
  if (v === undefined || v === '') return defaultTrue;
  const t = v.trim().toLowerCase();
  if (t === '0' || t === 'false' || t === 'no') return false;
  return true;
}

async function main() {
  const emailRaw = process.env.UPSERT_EMAIL?.trim();
  const password = process.env.UPSERT_PASSWORD;
  const roleRaw = (process.env.UPSERT_ROLE || 'admin').trim().toLowerCase() as UserRole;
  const approved = parseBool(process.env.UPSERT_APPROVED, true);

  if (!emailRaw || !password) {
    console.error(
      'Missing UPSERT_EMAIL or UPSERT_PASSWORD.\n' +
        'Usage:\n' +
        '  MONGODB_URI=... UPSERT_EMAIL=you@example.com UPSERT_PASSWORD=... UPSERT_ROLE=admin|employee|customer \\\n' +
        '    npx tsx scripts/upsert-user.ts\n' +
        'Optional: UPSERT_APPROVED=false (default true)\n' +
        'Optional: UPSERT_NAME="Your Name"'
    );
    process.exit(1);
  }

  if (!ROLES.includes(roleRaw)) {
    console.error(`UPSERT_ROLE must be one of: ${ROLES.join(', ')}`);
    process.exit(1);
  }

  const email = emailRaw.toLowerCase();
  const name =
    process.env.UPSERT_NAME?.trim() ||
    email.split('@')[0] ||
    'User';

  await connectDB();

  let user = await User.findOne({ email });

  if (!user) {
    user = new User({
      name,
      email,
      password,
      role: roleRaw,
      isApproved: approved,
      provider: 'credentials',
    });
  } else {
    user.name = name;
    user.password = password;
    user.role = roleRaw;
    user.isApproved = approved;
    user.provider = 'credentials';
    user.providerId = undefined;
  }

  await user.save();
  console.log(`✓ Upserted ${roleRaw}: ${email} (isApproved=${user.isApproved})`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
