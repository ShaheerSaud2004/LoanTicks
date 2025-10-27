import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import EmployeeDashboardClient from './EmployeeDashboardClient';

export default async function EmployeeDashboard() {
  const session = await auth();

  if (!session || session.user.role !== 'employee') {
    redirect('/login');
  }

  return (
    <SessionProvider session={session}>
      <EmployeeDashboardClient />
    </SessionProvider>
  );
}