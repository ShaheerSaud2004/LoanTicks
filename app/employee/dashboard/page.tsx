import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
} from 'lucide-react';

export default async function EmployeeDashboard() {
  const session = await auth();

  if (!session || (session.user.role !== 'employee' && session.user.role !== 'admin')) {
    redirect('/login');
  }

  const stats = [
    {
      title: 'Assigned Applications',
      value: '24',
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: 'Approved Today',
      value: '8',
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Pending Review',
      value: '12',
      icon: Clock,
      color: 'bg-orange-500',
    },
    {
      title: 'Rejected',
      value: '4',
      icon: XCircle,
      color: 'bg-red-500',
    },
  ];

  const applications = [
    {
      id: '1001',
      customer: 'John Smith',
      amount: '$25,000',
      type: 'Personal Loan',
      status: 'pending',
      date: '2 hours ago',
    },
    {
      id: '1002',
      customer: 'Sarah Johnson',
      amount: '$50,000',
      type: 'Business Loan',
      status: 'pending',
      date: '4 hours ago',
    },
    {
      id: '1003',
      customer: 'Mike Wilson',
      amount: '$15,000',
      type: 'Auto Loan',
      status: 'pending',
      date: '6 hours ago',
    },
  ];

  return (
    <DashboardLayout
      userName={session.user.name || 'Employee'}
      userRole={session.user.role}
      userEmail={session.user.email || ''}
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {session.user.name}! 💼
          </h1>
          <p className="text-blue-100">
            You have {stats[2].value} applications pending review today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">
                {stat.title}
              </h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Pending Applications
              </h2>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                  <Search className="h-4 w-4" />
                  Search
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                  <Filter className="h-4 w-4" />
                  Filter
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{app.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {app.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {app.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {app.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-indigo-600 hover:text-indigo-900 font-medium mr-4">
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

