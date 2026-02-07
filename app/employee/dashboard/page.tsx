import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import EmployeeDashboardClient from './EmployeeDashboardClient';

export default async function EmployeeDashboard() {
  const session = await auth();

  if (!session || session.user.role !== 'employee') {
    redirect('/login');
  }

  return <EmployeeDashboardClient />;
}