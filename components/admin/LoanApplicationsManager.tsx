'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  DollarSign,
  Home,
  User,
  Briefcase,
  X,
  UserCheck,
} from 'lucide-react';

interface LoanApplication {
  _id: string;
  userId: string;
  status: string;
  decision?: string;
  assignedTo?: string;
  reviewedBy?: string;
  borrowerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    ssn: string;
    maritalStatus: string;
    dependents: number;
  };
  currentAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    residencyType: string;
    yearsAtAddress: number;
  };
  employment: {
    employmentStatus: string;
    employerName: string;
    position: string;
    monthlyIncome: number;
  };
  financialInfo: {
    grossMonthlyIncome: number;
    totalAssets: number;
    totalLiabilities: number;
  };
  propertyInfo: {
    propertyAddress: string;
    propertyCity: string;
    propertyState: string;
    propertyType: string;
    propertyValue: number;
    loanAmount: number;
    loanPurpose: string;
    downPaymentAmount: number;
  };
  declarations: {
    outstandingJudgments: boolean;
    declaredBankruptcy: boolean;
    propertyForeclosed: boolean;
    usCitizen: boolean;
  };
  assignedToUser?: {
    firstName: string;
    lastName: string;
  };
  reviewedByUser?: {
    firstName: string;
    lastName: string;
  };
  statusHistory?: Array<{
    status: string;
    changedBy: string;
    changedAt: string;
    notes?: string;
  }>;
  submittedAt: string;
  createdAt: string;
}

export default function LoanApplicationsManager({ employeeName }: { employeeName: string }) {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null);
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/loan-application', {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to fetch applications:', response.status, errorData);
        alert(`Failed to load applications: ${errorData.error || 'Unknown error'}`);
        setApplications([]);
        return;
      }
      
      const data = await response.json();
      console.log('Fetched applications:', data.applications?.length || 0);
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      alert(`Network error: ${error instanceof Error ? error.message : 'Failed to fetch applications'}`);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const response = await fetch('/api/loan-application', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          status: newStatus,
          notes: notes || undefined,
          reviewedBy: employeeName,
          reviewedAt: new Date(),
        }),
      });

      if (response.ok) {
        await fetchApplications();
        setSelectedApp(null);
        setNotes('');
        alert(`Application ${newStatus}!`);
      }
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Failed to update application');
    } finally {
      setUpdating(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const stats = [
    {
      title: 'Total Applications',
      value: applications.length.toString(),
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: 'Approved',
      value: applications.filter(a => a.status === 'approved').length.toString(),
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Pending Review',
      value: applications.filter(a => a.status === 'submitted' || a.status === 'under_review').length.toString(),
      icon: Clock,
      color: 'bg-orange-500',
    },
    {
      title: 'Rejected',
      value: applications.filter(a => a.status === 'rejected').length.toString(),
      icon: XCircle,
      color: 'bg-red-500',
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      draft: { color: 'bg-gray-100 text-gray-800', text: 'Draft' },
      submitted: { color: 'bg-blue-100 text-blue-800', text: 'Submitted' },
      under_review: { color: 'bg-yellow-100 text-yellow-800', text: 'Under Review' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Found</h3>
        <p className="text-gray-600">There are no loan applications in the system yet.</p>
        <button
          onClick={fetchApplications}
          className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          Welcome, {employeeName}! 💼
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
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-sm text-gray-600">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Employee Performance Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-green-600" />
          Employee Performance Overview
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(() => {
            // Calculate employee statistics
            const employeeStats = new Map();
            applications.forEach(app => {
              if (app.assignedToUser) {
                const employeeName = `${app.assignedToUser.firstName} ${app.assignedToUser.lastName}`;
                if (!employeeStats.has(employeeName)) {
                  employeeStats.set(employeeName, {
                    name: employeeName,
                    totalAssigned: 0,
                    approved: 0,
                    rejected: 0,
                    pending: 0
                  });
                }
                
                const stats = employeeStats.get(employeeName);
                stats.totalAssigned++;
                
                if (app.status === 'approved') stats.approved++;
                else if (app.status === 'rejected') stats.rejected++;
                else stats.pending++;
              }
            });
            
            return Array.from(employeeStats.values()).map(emp => (
              <div key={emp.name} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">{emp.name}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Assigned:</span>
                    <span className="font-medium">{emp.totalAssigned}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Approved:</span>
                    <span className="font-medium text-green-600">{emp.approved}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-red-600">Rejected:</span>
                    <span className="font-medium text-red-600">{emp.rejected}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-yellow-600">Pending:</span>
                    <span className="font-medium text-yellow-600">{emp.pending}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Success Rate:</span>
                    <span className="font-medium">
                      {emp.totalAssigned > 0 ? ((emp.approved / emp.totalAssigned) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            ));
          })()}
        </div>
        
        {(() => {
          const employeeStats = new Map();
          applications.forEach(app => {
            if (app.assignedToUser) {
              const employeeName = `${app.assignedToUser.firstName} ${app.assignedToUser.lastName}`;
              if (!employeeStats.has(employeeName)) {
                employeeStats.set(employeeName, { name: employeeName, totalAssigned: 0, approved: 0, rejected: 0, pending: 0 });
              }
              const stats = employeeStats.get(employeeName);
              stats.totalAssigned++;
              if (app.status === 'approved') stats.approved++;
              else if (app.status === 'rejected') stats.rejected++;
              else stats.pending++;
            }
          });
          
          if (employeeStats.size === 0) {
            return (
              <div className="text-center py-8 text-gray-500">
                <UserCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No employee assignments found</p>
              </div>
            );
          }
        })()}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Applications
          </button>
          <button
            onClick={() => setFilter('submitted')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'submitted'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            New Submissions
          </button>
          <button
            onClick={() => setFilter('under_review')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'under_review'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Under Review
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'approved'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'rejected'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            Loan Applications ({filteredApplications.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Loan Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Reviewed By
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No applications found
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {app.borrowerInfo.firstName} {app.borrowerInfo.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {app.borrowerInfo.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {formatCurrency(app.propertyInfo.loanAmount)}
                    </td>
                    <td className="px-6 py-4 text-gray-600 capitalize">
                      {app.propertyInfo.loanPurpose.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {app.assignedToUser ? (
                        <div>
                          <div className="font-medium text-gray-900">
                            {app.assignedToUser.firstName} {app.assignedToUser.lastName}
                          </div>
                          <div className="text-xs text-gray-500">Employee</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {app.reviewedByUser ? (
                        <div>
                          <div className="font-medium text-gray-900">
                            {app.reviewedByUser.firstName} {app.reviewedByUser.lastName}
                          </div>
                          <div className="text-xs text-gray-500">Reviewer</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not reviewed</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(app.submittedAt || app.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Application Review
                </h2>
                <p className="text-sm text-gray-600">
                  {selectedApp.borrowerInfo.firstName} {selectedApp.borrowerInfo.lastName}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Security Notice */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-green-900 mb-1">🔒 Secure & Encrypted</h4>
                  <p className="text-sm text-green-800">
                    All sensitive information is encrypted and access is logged for security auditing. 
                    SSN is masked for protection. This review is recorded in the audit trail.
                  </p>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-semibold text-gray-900">
                      {selectedApp.borrowerInfo.firstName} {selectedApp.borrowerInfo.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">{selectedApp.borrowerInfo.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold text-gray-900">{selectedApp.borrowerInfo.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">SSN</p>
                    <p className="font-semibold text-gray-900 font-mono">***-**-{selectedApp.borrowerInfo.ssn.slice(-4)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Marital Status</p>
                    <p className="font-semibold text-gray-900 capitalize">{selectedApp.borrowerInfo.maritalStatus}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Dependents</p>
                    <p className="font-semibold text-gray-900">{selectedApp.borrowerInfo.dependents}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5 text-blue-600" />
                  Current Address
                </h3>
                <p className="font-semibold text-gray-900">
                  {selectedApp.currentAddress.street}
                  <br />
                  {selectedApp.currentAddress.city}, {selectedApp.currentAddress.state} {selectedApp.currentAddress.zipCode}
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-600">Residency Type</p>
                    <p className="font-semibold text-gray-900 capitalize">{selectedApp.currentAddress.residencyType.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Years at Address</p>
                    <p className="font-semibold text-gray-900">{selectedApp.currentAddress.yearsAtAddress}</p>
                  </div>
                </div>
              </div>

              {/* Employment */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Employment Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-semibold text-gray-900 capitalize">{selectedApp.employment.employmentStatus.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Employer</p>
                    <p className="font-semibold text-gray-900">{selectedApp.employment.employerName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Position</p>
                    <p className="font-semibold text-gray-900">{selectedApp.employment.position || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monthly Income</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(selectedApp.employment.monthlyIncome)}</p>
                  </div>
                </div>
              </div>

              {/* Financial Info */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Financial Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Gross Monthly Income</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(selectedApp.financialInfo.grossMonthlyIncome)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Assets</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(selectedApp.financialInfo.totalAssets)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Liabilities</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(selectedApp.financialInfo.totalLiabilities)}</p>
                  </div>
                </div>
              </div>

              {/* Property & Loan */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5 text-blue-600" />
                  Property & Loan Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Property Address</p>
                    <p className="font-semibold text-gray-900">
                      {selectedApp.propertyInfo.propertyAddress}, {selectedApp.propertyInfo.propertyCity}, {selectedApp.propertyInfo.propertyState}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Property Type</p>
                    <p className="font-semibold text-gray-900 capitalize">{selectedApp.propertyInfo.propertyType.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Property Value</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(selectedApp.propertyInfo.propertyValue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Loan Amount</p>
                    <p className="font-semibold text-blue-600 text-xl">{formatCurrency(selectedApp.propertyInfo.loanAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Down Payment</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(selectedApp.propertyInfo.downPaymentAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Loan Purpose</p>
                    <p className="font-semibold text-gray-900 capitalize">{selectedApp.propertyInfo.loanPurpose}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">LTV Ratio</p>
                    <p className="font-semibold text-gray-900">
                      {((selectedApp.propertyInfo.loanAmount / selectedApp.propertyInfo.propertyValue) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Declarations */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Declarations</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Outstanding Judgments</span>
                    <span className={`font-semibold ${selectedApp.declarations.outstandingJudgments ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedApp.declarations.outstandingJudgments ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Bankruptcy (7 years)</span>
                    <span className={`font-semibold ${selectedApp.declarations.declaredBankruptcy ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedApp.declarations.declaredBankruptcy ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Property Foreclosed</span>
                    <span className={`font-semibold ${selectedApp.declarations.propertyForeclosed ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedApp.declarations.propertyForeclosed ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">U.S. Citizen</span>
                    <span className={`font-semibold ${selectedApp.declarations.usCitizen ? 'text-green-600' : 'text-gray-600'}`}>
                      {selectedApp.declarations.usCitizen ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Review Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this application..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition"
                />
              </div>

              {/* Action Buttons */}
              {selectedApp.status !== 'approved' && selectedApp.status !== 'rejected' && (
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => updateApplicationStatus(selectedApp._id, 'approved')}
                    disabled={updating}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition disabled:opacity-50"
                  >
                    <ThumbsUp className="w-5 h-5" />
                    Approve Application
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(selectedApp._id, 'rejected')}
                    disabled={updating}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition disabled:opacity-50"
                  >
                    <ThumbsDown className="w-5 h-5" />
                    Reject Application
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

