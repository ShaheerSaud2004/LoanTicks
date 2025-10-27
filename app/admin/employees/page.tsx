import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import EmployeeManagementClient from './EmployeeManagementClient';

export default async function EmployeeManagementPage() {
  const session = await auth();

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  return (
    <DashboardLayout
      userName={session.user.name || 'Admin'}
      userRole={session.user.role}
      userEmail={session.user.email || ''}
    >
      <EmployeeManagementClient />
    </DashboardLayout>
  );
}
