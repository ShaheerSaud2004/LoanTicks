import { auth } from '@/src/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import LoanApplicationsManager from '@/components/LoanApplicationsManager';

export default async function EmployeeDashboard() {
  const session = await auth();

  if (!session || (session.user.role !== 'employee' && session.user.role !== 'admin')) {
    redirect('/login');
  }

  return (
    <DashboardLayout
      userName={session.user.name || 'Employee'}
      userRole={session.user.role}
      userEmail={session.user.email || ''}
    >
      <LoanApplicationsManager employeeName={session.user.name || 'Employee'} />
    </DashboardLayout>
  );
}
