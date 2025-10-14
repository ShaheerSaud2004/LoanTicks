import { auth } from '@/src/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Plus,
  FileText,
  DollarSign,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { headers } from 'next/headers';
import CustomerApplicationTracker from '@/components/CustomerApplicationTracker';

export default async function CustomerDashboard() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Fetch real loan applications
  const request = await headers();
  let recentApplications = [];
  
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/loan-application`, {
      headers: {
        Cookie: request.get('cookie') || '',
      },
      cache: 'no-store',
    });
    
    if (res.ok) {
      const apps = await res.json();
      recentApplications = apps.slice(0, 3); // Get latest 3 applications
    }
  } catch (error) {
    console.error('Error fetching applications:', error);
  }

  const stats = [
    {
      title: 'Active Loans',
      value: '2',
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Borrowed',
      value: '$45,000',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Next Payment',
      value: '$850',
      icon: Calendar,
      color: 'bg-orange-500',
    },
    {
      title: 'Applications',
      value: '3',
      icon: CheckCircle,
      color: 'bg-purple-500',
    },
  ];

  const loans = [
    {
      id: 'L-001',
      type: 'Personal Loan',
      amount: '$25,000',
      outstanding: '$18,500',
      nextPayment: '$850',
      dueDate: 'Oct 15, 2025',
      status: 'active',
    },
    {
      id: 'L-002',
      type: 'Auto Loan',
      amount: '$20,000',
      outstanding: '$15,200',
      nextPayment: '$650',
      dueDate: 'Oct 20, 2025',
      status: 'active',
    },
  ];


  return (
    <DashboardLayout
      userName={session.user.name || 'Customer'}
      userRole={session.user.role}
      userEmail={session.user.email || ''}
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {session.user.name}! 🎉
          </h1>
          <p className="text-green-100 mb-4">
            Your next payment of $850 is due on October 15, 2025.
          </p>
          <Link 
            href="/customer/loan-application"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium shadow-md"
          >
            <Plus className="h-5 w-5" />
            Apply for New Loan
          </Link>
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

        {/* Active Loans */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Your Active Loans</h2>
          </div>
          <div className="p-6 space-y-4">
            {loans.map((loan) => (
              <div
                key={loan.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">
                        {loan.type}
                      </h3>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">Loan ID: {loan.id}</p>
                  </div>
                  <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                    View Details →
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                    <p className="text-lg font-bold text-gray-900">{loan.amount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Outstanding</p>
                    <p className="text-lg font-bold text-gray-900">
                      {loan.outstanding}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Next Payment</p>
                    <p className="text-lg font-bold text-orange-600">
                      {loan.nextPayment}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Due Date</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {loan.dueDate}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
                    Make Payment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Applications */}
        <CustomerApplicationTracker applications={recentApplications} />
      </div>
    </DashboardLayout>
  );
}

