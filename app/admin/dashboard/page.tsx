import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import LoanApplicationsManager from '@/components/LoanApplicationsManager';
import Link from 'next/link';

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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Admin Dashboard - Loan Applications
              </h1>
              <p className="text-purple-100">
                Full system access - Review and manage all loan applications
              </p>
            </div>
            <Link
              href="/admin/employees"
              className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition backdrop-blur-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              Manage Employees
            </Link>
          </div>
        </div>
      </div>
      <LoanApplicationsManager employeeName={session.user.name || 'Admin'} />
    </DashboardLayout>
  );
}
