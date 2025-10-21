'use client';

import { useState, useEffect } from 'react';

// Force dynamic rendering to prevent static generation issues with useSession
export const dynamic = 'force-dynamic';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  CheckCircle, 
  Clock,
  User,
  Calendar,
  DollarSign
} from 'lucide-react';

interface Application {
  _id: string;
  userId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  status: string;
  decision?: string;
  loanAmount: number;
  propertyValue: number;
  assignedTo?: string;
  assignedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  submittedAt: string;
  createdAt: string;
}

export default function EmployeeDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState('all');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'employee') {
      router.push('/login');
      return;
    }

    fetchApplications();
  }, [session, status, router]);

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (assignedFilter !== 'all') params.append('assigned', assignedFilter);

      const response = await fetch(`/api/employee/applications?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setApplications(data.applications);
      } else {
        console.error('Failed to fetch applications:', data.error);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignApplication = async (applicationId: string) => {
    try {
      const response = await fetch('/api/employee/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          action: 'assign'
        })
      });

      if (response.ok) {
        fetchApplications(); // Refresh the list
      } else {
        alert('Failed to assign application');
      }
    } catch (error) {
      console.error('Error assigning application:', error);
      alert('Error assigning application');
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/employee/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          action: 'update_status',
          status: newStatus,
          notes: `Status updated to ${newStatus}`
        })
      });

      if (response.ok) {
        fetchApplications(); // Refresh the list
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      'draft': 'bg-gray-100 text-gray-800',
      'submitted': 'bg-blue-100 text-blue-800',
      'under_review': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getDecisionBadge = (decision?: string) => {
    if (!decision) return null;
    
    const decisionClasses = {
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'pending': 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${decisionClasses[decision as keyof typeof decisionClasses]}`}>
        {decision.toUpperCase()}
      </span>
    );
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.userId.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.userId.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app._id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Employee Dashboard</h1>
          <p className="text-gray-600">Manage and review loan applications</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or application ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Assignment Filter */}
            <div>
              <select
                value={assignedFilter}
                onChange={(e) => setAssignedFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
              >
                <option value="all">All Applications</option>
                <option value="me">Assigned to Me</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchApplications}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Applications ({filteredApplications.length})
            </h2>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-600">No applications match your current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Application
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Borrower
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loan Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Decision
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="w-8 h-8 text-green-600 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              #{app._id.slice(-8)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(app.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {app.userId.firstName} {app.userId.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {app.userId.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            ${app.loanAmount?.toLocaleString() || 'N/A'}
                          </span>
                        </div>
                        {app.propertyValue && (
                          <div className="text-sm text-gray-500">
                            Property: ${app.propertyValue.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getDecisionBadge(app.decision)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">
                            {new Date(app.submittedAt || app.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/employee/applications/${app._id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View Application"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/employee/applications/${app._id}/edit`)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Edit Application"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {!app.assignedTo && (
                            <button
                              onClick={() => handleAssignApplication(app._id)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                              title="Assign to Me"
                            >
                              <User className="w-4 h-4" />
                            </button>
                          )}
                          {app.status === 'submitted' && (
                            <button
                              onClick={() => handleStatusChange(app._id, 'under_review')}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                              title="Start Review"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          )}
                          {app.status === 'under_review' && (
                            <>
                              <button
                                onClick={() => router.push(`/employee/applications/${app._id}/decision`)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                title="Make Decision"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}