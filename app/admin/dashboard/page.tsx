import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoanApplicationsManager from '@/components/admin/LoanApplicationsManager';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';
import Link from 'next/link';
import { Users, FileText, TrendingUp, Activity, MessageCircle, UserCheck } from 'lucide-react';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import LoanApplication from '@/models/LoanApplication';

export default async function AdminDashboard() {
  const session = await auth();

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  // Fetch dashboard statistics
  let stats = {
    totalApplications: 0,
    activeEmployees: 0,
    approvalRate: 0,
    pendingReview: 0,
  };

  try {
    await connectDB();

    // Get total mortgage applications
    const totalApplications = await LoanApplication.countDocuments();

    // Get active employees (users with employee roles)
    const activeEmployees = await User.countDocuments({
      role: { $in: ['employee', 'senior_employee', 'supervisor'] },
    });

    // Calculate approval rate
    const approvedApplications = await LoanApplication.countDocuments({
      decision: 'approved',
    });
    const approvalRate = totalApplications > 0
      ? Math.round((approvedApplications / totalApplications) * 100)
      : 0;

    // Get pending review applications
    const pendingReview = await LoanApplication.countDocuments({
      status: { $in: ['submitted', 'under_review'] },
    });

    stats = {
      totalApplications,
      activeEmployees,
      approvalRate,
      pendingReview,
    };
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
  }

  return (
    <AdminDashboardClient userRole={session.user.role}>
      <DashboardLayout
        userName={session.user.name || 'Admin'}
        userRole={session.user.role}
        userEmail={session.user.email || ''}
      >
        <div className="space-y-6">
          {/* Welcome Header */}
          <div data-tour="dashboard-header" className="bg-gradient-to-r from-gray-700 to-indigo-600 rounded-xl p-6 md:p-8 text-white shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-100 text-sm md:text-base">
            Full system access - Manage employees, mortgage applications, and system settings
          </p>
        </div>

          {/* Quick Stats */}
          <div data-tour="stats-cards" className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-500 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Mortgage Applications</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500 p-3 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Active Employees</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.activeEmployees}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-500 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Approval Rate</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.approvalRate}%</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gray-600 p-3 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Pending Review</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingReview}</p>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/admin/employees"
              data-tour="employee-management"
              className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-gray-600 hover:shadow-md transition group"
            >
              <div className="bg-gray-600 group-hover:bg-gray-600 p-3 rounded-lg transition">
                <Users className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition">
                  Manage Employees
                </h3>
                <p className="text-sm text-gray-500">
                  Add, edit, or remove employee accounts
                </p>
              </div>
            </Link>
            
            <Link
              href="/admin/settings"
              className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-gray-600 hover:shadow-md transition group"
            >
              <div className="bg-gray-600 group-hover:bg-gray-700 p-3 rounded-lg transition">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition">
                  System Settings
                </h3>
                <p className="text-sm text-gray-500">
                  Configure system preferences and security settings
                </p>
              </div>
            </Link>
            
            <Link
              href="/admin/chatbot-logs"
              className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-gray-600 hover:shadow-md transition group"
            >
              <div className="bg-yellow-500 group-hover:bg-yellow-600 p-3 rounded-lg transition">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition">
                  Chatbot Logs
                </h3>
                <p className="text-sm text-gray-500">
                  View user conversations and chatbot interactions
                </p>
              </div>
            </Link>
            
            <Link
              href="/admin/users"
              className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-gray-600 hover:shadow-md transition group"
            >
              <div className="bg-blue-500 group-hover:bg-blue-600 p-3 rounded-lg transition">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition">
                  User Approval
                </h3>
                <p className="text-sm text-gray-500">
                  Review and approve new user registrations
                </p>
              </div>
            </Link>
          </div>
        </div>

          {/* Applications Section */}
          <div data-tour="applications-manager">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">All Mortgage Applications</h2>
            <LoanApplicationsManager employeeName={session.user.name || 'Admin'} />
          </div>
        </div>
      </DashboardLayout>
    </AdminDashboardClient>
  );
}
