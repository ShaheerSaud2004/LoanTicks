import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  FileText,
  DollarSign,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import CustomerApplicationTracker from '@/components/customer/CustomerApplicationTracker';
import CustomerDashboardClient from '@/components/customer/CustomerDashboardClient';
import LoanCard from '@/components/customer/LoanCard';
import AnimatedApplyButton from '@/components/customer/AnimatedApplyButton';

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
    
    // Convert MongoDB documents to plain objects using JSON serialization
    // This handles ObjectIds, Dates, Buffers, and all nested objects
    recentApplications = apps.map(app => {
      const serialized = JSON.parse(JSON.stringify(app, (key, value) => {
        // Convert ObjectId to string
        if (value && typeof value === 'object' && value.constructor) {
          const constructorName = value.constructor.name;
          if (constructorName === 'ObjectId' || constructorName === 'Types.ObjectId') {
            return value.toString();
          }
        }
        // Convert Date to ISO string
        if (value instanceof Date) {
          return value.toISOString();
        }
        // Convert Buffer to base64 string
        if (value && typeof value === 'object' && value.type === 'Buffer' && Array.isArray(value.data)) {
          return Buffer.from(value.data).toString('base64');
        }
        return value;
      }));
      
      // Ensure statusHistory is properly serialized
      if (serialized.statusHistory && Array.isArray(serialized.statusHistory)) {
        serialized.statusHistory = serialized.statusHistory.map((entry: any) => ({
          status: entry.status,
          changedBy: entry.changedBy?.toString() || entry.changedBy,
          changedAt: entry.changedAt instanceof Date ? entry.changedAt.toISOString() : entry.changedAt,
          notes: entry.notes,
        }));
      }
      
      return serialized;
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
  }

  const stats = [
    {
      title: 'Active Mortgages',
      value: '3',
      icon: FileText,
      color: 'bg-gray-500',
    },
    {
      title: 'Total Financed',
      value: '$1,010,000',
      icon: DollarSign,
      color: 'bg-yellow-500',
    },
    {
      title: 'Next Payment',
      value: '$5,097',
      icon: Calendar,
      color: 'bg-orange-500',
    },
    {
      title: 'Applications',
      value: String(recentApplications.length || 0),
      icon: CheckCircle,
      color: 'bg-gray-600',
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
      status: 'Active',
      propertyAddress: '123 Main Street, Los Angeles, CA 90001',
      interestRate: '6.5%',
    },
    {
      id: 'MTG-002',
      type: '15-Year Fixed Mortgage',
      amount: '$235,000',
      outstanding: '$198,750',
      nextPayment: '$900',
      dueDate: 'Nov 1, 2025',
      status: 'Active',
      propertyAddress: '456 Oak Avenue, San Diego, CA 92101',
      interestRate: '5.75%',
    },
    {
      id: 'MTG-003',
      type: '20-Year Fixed Mortgage',
      amount: '$325,000',
      outstanding: '$312,500',
      nextPayment: '$1,850',
      dueDate: 'Nov 15, 2025',
      status: 'Active',
      propertyAddress: '789 Pine Road, San Francisco, CA 94102',
      interestRate: '6.25%',
    },
  ];


  return (
    <CustomerDashboardClient userRole={session.user.role}>
      <DashboardLayout
        userName={session.user.name || 'Customer'}
        userRole={session.user.role}
        userEmail={session.user.email || ''}
      >
        <div className="space-y-6">
        {/* Welcome Section */}
        <div data-tour="welcome-banner" className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 md:p-8 text-white shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Welcome back, {session.user.name}! 🏡
          </h1>
          <p className="text-yellow-100 mb-4 text-sm md:text-base">
            Your next mortgage payment of $5,097 is due on November 1, 2025.
          </p>
          <AnimatedApplyButton />
        </div>

        {/* Stats Grid */}
        <div data-tour="stats-cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <div data-tour="active-loans" className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Your Active Mortgages</h2>
          </div>
          <div className="p-4 md:p-6 space-y-4">
            {loans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} />
            ))}
          </div>
        </div>

        {/* Recent Applications */}
        <div data-tour="applications-tracker">
          <CustomerApplicationTracker applications={recentApplications} />
        </div>
      </div>
    </DashboardLayout>
    </CustomerDashboardClient>
  );
}

