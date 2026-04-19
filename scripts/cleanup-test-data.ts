/**
 * Remove demo/test users and their loan applications from MongoDB (direct).
 *
 * Requires CLEANUP_CONFIRM=YES to run (safety).
 * Optional INCLUDE_SEED_ACCOUNTS=true to also remove admin@ / employee@ / customer@ seed users.
 *
 *   MONGODB_URI='...' CLEANUP_CONFIRM=YES npx tsx scripts/cleanup-test-data.ts
 */
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

import connectDB from '../lib/mongodb';
import { cleanupDemoUsersAndRelatedData } from '../lib/cleanupDemoData';

async function main() {
  if (process.env.CLEANUP_CONFIRM !== 'YES') {
    console.error('Refusing to run: set CLEANUP_CONFIRM=YES');
    process.exit(1);
  }

  const includeSeedAccounts =
    process.env.INCLUDE_SEED_ACCOUNTS === 'true' ||
    process.env.INCLUDE_SEED_ACCOUNTS === '1';

  await connectDB();
  const result = await cleanupDemoUsersAndRelatedData({ includeSeedAccounts });

  console.log('Cleanup result:', {
    deletedUsers: result.deletedUsers,
    deletedApplications: result.deletedApplications,
    deletedChatbotConversations: result.deletedChatbotConversations,
    removedEmails: result.removedEmails,
  });
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
