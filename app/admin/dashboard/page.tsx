import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import LoanApplicationsManager from '@/components/LoanApplicationsManager';
import Link from 'next/link';
import { Users, FileText, TrendingUp, Activity } from 'lucide-react';

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
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">
            Admin Dashboard
          </h1>
          <p className="text-purple-100">
            Full system access - Manage employees, applications, and system settings
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Applications</h3>
            <p className="text-2xl font-bold text-gray-900">-</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Active Employees</h3>
            <p className="text-2xl font-bold text-gray-900">-</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Approval Rate</h3>
            <p className="text-2xl font-bold text-gray-900">-</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Pending Review</h3>
            <p className="text-2xl font-bold text-gray-900">-</p>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/admin/employees"
              className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:shadow-md transition group"
            >
              <div className="bg-purple-100 group-hover:bg-purple-200 p-3 rounded-lg transition">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition">
                  Manage Employees
                </h3>
                <p className="text-sm text-gray-500">
                  Add, edit, or remove employee accounts
                </p>
              </div>
            </Link>
            
            <div className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl opacity-50">
              <div className="bg-gray-100 p-3 rounded-lg">
                <Activity className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  System Settings
                </h3>
                <p className="text-sm text-gray-500">
                  Configure system preferences (Coming Soon)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Applications Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">All Loan Applications</h2>
          <LoanApplicationsManager employeeName={session.user.name || 'Admin'} />
        </div>
      </div>
    </DashboardLayout>
  );
}
