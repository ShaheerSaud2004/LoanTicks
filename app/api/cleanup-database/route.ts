import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { auth } from '@/lib/auth';
import { cleanupDemoUsersAndRelatedData } from '@/lib/cleanupDemoData';

/**
 * Admin-only: remove known demo/test users and *their* loan applications + chatbot rows.
 * Pass JSON body `{ "includeSeedAccounts": true }` to also remove admin@ / employee@ / customer@ seed users.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = process.env.CLEANUP_DATABASE_SECRET?.trim();
    if (secret) {
      const header = request.headers.get('x-cleanup-secret')?.trim();
      if (header !== secret) {
        return NextResponse.json(
          { error: 'Forbidden', message: 'Invalid or missing x-cleanup-secret header.' },
          { status: 403 }
        );
      }
    }

    let includeSeedAccounts = false;
    try {
      const body = (await request.json()) as { includeSeedAccounts?: boolean };
      includeSeedAccounts = body.includeSeedAccounts === true;
    } catch {
      // no body is fine
    }

    await connectDB();

    const result = await cleanupDemoUsersAndRelatedData({ includeSeedAccounts });

    return NextResponse.json({
      success: true,
      message: 'Demo/test data cleaned (scoped to known emails only).',
      deleted: {
        users: result.deletedUsers,
        applications: result.deletedApplications,
        chatbotConversations: result.deletedChatbotConversations,
      },
      removedEmails: result.removedEmails,
    });
  } catch (error) {
    console.error('Error cleaning database:', error);
    return NextResponse.json(
      {
        error: 'Failed to clean database',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
