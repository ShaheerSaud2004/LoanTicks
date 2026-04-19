import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';

/** Block admin/employee API access until an administrator has approved the account. */
export function rejectUnapprovedStaff(session: Session | null): NextResponse | null {
  if (!session?.user) return null;
  const { role, isApproved } = session.user;
  if ((role === 'admin' || role === 'employee') && !isApproved) {
    return NextResponse.json({ error: 'Account pending approval' }, { status: 403 });
  }
  return null;
}
