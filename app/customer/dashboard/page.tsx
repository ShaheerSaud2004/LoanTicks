import { auth } from '@/lib/auth';
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
import CustomerApplicationTracker from '@/components/CustomerApplicationTracker';

export default async function CustomerDashboard() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Fetch real loan applications
  let recentApplications = [];
  
  try {
    // Use server-side API call
    const connectDB = (await import('@/lib/mongodb')).default;
    const LoanApplication = (await import('@/models/LoanApplication')).default;
    
    await connectDB();
    const apps = await LoanApplication.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
    
    recentApplications = apps.map(app => ({
      ...app,
      _id: app._id.toString(),
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
      submittedAt: app.submittedAt ? app.submittedAt.toISOString() : null,
    }));
  } catch (error) {
    console.error('Error fetching applications:', error);
  }

  const stats = [
    {
      title: 'Active Mortgages',
      value: '2',
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Financed',
      value: '$685,000',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Next Payment',
      value: '$3,247',
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
      id: 'MTG-001',
      type: '30-Year Fixed Mortgage',
      amount: '$450,000',
      outstanding: '$438,250',
      nextPayment: '$2,347',
      dueDate: 'Nov 1, 2025',
      status: 'active',
      propertyAddress: '123 Main Street, Los Angeles, CA',
      interestRate: '6.5%',
    },
    {
      id: 'MTG-002',
      type: '15-Year Fixed Mortgage',
      amount: '$235,000',
      outstanding: '$198,750',
      nextPayment: '$900',
      dueDate: 'Nov 1, 2025',
      status: 'active',
      propertyAddress: '456 Oak Avenue, San Diego, CA',
      interestRate: '5.75%',
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
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 md:p-8 text-white shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Welcome back, {session.user.name}! 🏡
          </h1>
          <p className="text-green-100 mb-4 text-sm md:text-base">
            Your next mortgage payment of $3,247 is due on November 1, 2025.
          </p>
          <Link 
            href="/customer/loan-application"
            className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium shadow-md text-sm md:text-base"
          >
            <Plus className="h-4 w-4 md:h-5 md:w-5" />
            Apply for Home Mortgage
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

        {/* Active Mortgages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Your Active Mortgages</h2>
          </div>
          <div className="p-4 md:p-6 space-y-4">
            {loans.map((loan) => (
              <div
                key={loan.id}
                className="border border-gray-200 rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-base md:text-lg font-bold text-gray-900">
                        {loan.type}
                      </h3>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        Active
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-500">Mortgage ID: {loan.id}</p>
                    <p className="text-xs md:text-sm text-gray-600 mt-1">📍 {loan.propertyAddress}</p>
                  </div>
                  <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm self-start sm:self-auto">
                    View Details →
                  </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Loan Amount</p>
                    <p className="text-sm md:text-lg font-bold text-gray-900">{loan.amount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Balance</p>
                    <p className="text-sm md:text-lg font-bold text-gray-900">
                      {loan.outstanding}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Interest Rate</p>
                    <p className="text-sm md:text-lg font-bold text-blue-600">
                      {loan.interestRate}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Next Payment</p>
                    <p className="text-sm md:text-lg font-bold text-orange-600">
                      {loan.nextPayment}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Due Date</p>
                    <p className="text-xs md:text-sm font-semibold text-gray-900">
                      {loan.dueDate}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
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

