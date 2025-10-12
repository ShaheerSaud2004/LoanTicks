import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  FileText,
  AlertCircle,
} from 'lucide-react';

export default async function AdminDashboard() {
  const session = await auth();

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  const stats = [
    {
      title: 'Total Users',
      value: '1,248',
      change: '+12%',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Loans',
      value: '342',
      change: '+8%',
      icon: Briefcase,
      color: 'bg-green-500',
    },
    {
      title: 'Total Revenue',
      value: '$2.4M',
      change: '+23%',
      icon: DollarSign,
      color: 'bg-purple-500',
    },
    {
      title: 'Pending Applications',
      value: '89',
      change: '-5%',
      icon: FileText,
      color: 'bg-orange-500',
    },
  ];

  return (
    <DashboardLayout
      userName={session.user.name || 'Admin'}
      userRole={session.user.role}
      userEmail={session.user.email || ''}
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {session.user.name}! 👋
          </h1>
          <p className="text-indigo-100">
            Here's what's happening with your loan management system today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <span
                  className={`text-sm font-semibold ${
                    stat.change.startsWith('+')
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">
                {stat.title}
              </h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium flex items-center gap-3">
                <Users className="h-5 w-5" />
                Manage Users
              </button>
              <button className="w-full text-left px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium flex items-center gap-3">
                <FileText className="h-5 w-5" />
                Review Applications
              </button>
              <button className="w-full text-left px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium flex items-center gap-3">
                <TrendingUp className="h-5 w-5" />
                View Reports
              </button>
              <button className="w-full text-left px-4 py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors font-medium flex items-center gap-3">
                <Briefcase className="h-5 w-5" />
                Manage Loans
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    New loan application submitted
                  </p>
                  <p className="text-xs text-gray-500">John Doe - 5 min ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    New employee registered
                  </p>
                  <p className="text-xs text-gray-500">Jane Smith - 1 hour ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Loan payment received
                  </p>
                  <p className="text-xs text-gray-500">
                    $5,000 - 2 hours ago
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Payment overdue alert
                  </p>
                  <p className="text-xs text-gray-500">
                    3 accounts - 3 hours ago
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

