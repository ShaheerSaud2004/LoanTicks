import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import LoanApplicationsManager from '@/components/LoanApplicationsManager';

export default async function AdminDashboard() {
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
      <div className="mb-6">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">
            Admin Dashboard - Loan Applications
          </h1>
          <p className="text-purple-100">
            Full system access - Review and manage all loan applications
          </p>
        </div>
      </div>
      <LoanApplicationsManager employeeName={session.user.name || 'Admin'} />
    </DashboardLayout>
  );
}
