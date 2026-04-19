import User from '@/models/User';
import LoanApplication from '@/models/LoanApplication';
import ChatbotConversation from '@/models/ChatbotConversation';

/** Demo / QA accounts only — not production customers. */
export const DEMO_USER_EMAILS: string[] = [
  'testcustomer@example.com',
  'testemployee@loanticks.com',
  'sarah.customer@loanticks.com',
  'michael.customer@loanticks.com',
  'emily.customer@loanticks.com',
  'david.customer@loanticks.com',
  'john.employee@loanticks.com',
  'lisa.employee@loanticks.com',
  'admin.demo@loanticks.com',
  'john.smith@loanticks.com',
  'sarah.johnson@loanticks.com',
  'mike.davis@loanticks.com',
];

/** Seeded demo logins from `npm run seed` — only remove when explicitly requested. */
export const SEED_USER_EMAILS: string[] = [
  'admin@loanaticks.com',
  'employee@loanaticks.com',
  'customer@loanaticks.com',
];

export type CleanupDemoDataResult = {
  deletedUsers: number;
  deletedApplications: number;
  deletedChatbotConversations: number;
  removedEmails: string[];
};

/**
 * Removes demo users (by email), their loan applications, and related chatbot rows.
 * Does not use deleteMany({}) on the whole LoanApplication collection.
 */
export async function cleanupDemoUsersAndRelatedData(options: {
  includeSeedAccounts: boolean;
}): Promise<CleanupDemoDataResult> {
  const emails = [
    ...DEMO_USER_EMAILS.map((e) => e.toLowerCase()),
    ...(options.includeSeedAccounts ? SEED_USER_EMAILS.map((e) => e.toLowerCase()) : []),
  ];

  const users = await User.find({ email: { $in: emails } })
    .select('_id email')
    .lean();

  const ids = users.map((u) => String(u._id));
  const removedEmails = users.map((u) => String(u.email));

  const deletedApplications =
    ids.length > 0
      ? (await LoanApplication.deleteMany({ userId: { $in: ids } })).deletedCount
      : 0;

  const deletedChatbotConversations =
    ids.length > 0 || emails.length > 0
      ? (
          await ChatbotConversation.deleteMany({
            $or: [{ userId: { $in: ids } }, { userEmail: { $in: emails } }],
          })
        ).deletedCount
      : 0;

  const deletedUsers =
    ids.length > 0
      ? (await User.deleteMany({ _id: { $in: users.map((u) => u._id) } })).deletedCount
      : 0;

  return {
    deletedUsers,
    deletedApplications,
    deletedChatbotConversations,
    removedEmails,
  };
}
