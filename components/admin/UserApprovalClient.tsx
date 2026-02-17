'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { CheckCircle, XCircle, Clock, User, Mail, Phone, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  provider?: string;
  isApproved: boolean;
  createdAt?: string;
  approvedAt?: string;
}

interface UserApprovalClientProps {
  pendingUsers: User[];
  approvedUsers: User[];
  userName: string;
  userRole: string;
  userEmail: string;
}

export default function UserApprovalClient({ pendingUsers, approvedUsers, userName, userRole, userEmail }: UserApprovalClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleApprove = async (userId: string) => {
    setLoading(userId);
    setSuccessMessage(null);
    try {
      const response = await fetch('/api/admin/users/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setSuccessMessage('User approved successfully.');
        setTimeout(() => setSuccessMessage(null), 4000);
        router.refresh();
      } else {
        const data = await response.json().catch(() => ({}));
        alert(data.error || 'Failed to approve user. Please try again.');
      }
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    if (!confirm('Are you sure you want to reject this user? This action cannot be undone.')) {
      return;
    }

    setLoading(userId);
    setSuccessMessage(null);
    try {
      const response = await fetch('/api/admin/users/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setSuccessMessage('User rejected.');
        setTimeout(() => setSuccessMessage(null), 4000);
        router.refresh();
      } else {
        const data = await response.json().catch(() => ({}));
        alert(data.error || 'Failed to reject user. Please try again.');
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const users = activeTab === 'pending' ? pendingUsers : approvedUsers;

  return (
    <DashboardLayout
      userName={userName}
      userRole={userRole}
      userEmail={userEmail}
    >
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">User Approval</h1>
          <p className="text-slate-600">Review and approve new user registrations</p>
          {successMessage && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-4 px-2 font-semibold transition-colors ${
              activeTab === 'pending'
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending ({pendingUsers.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`pb-4 px-2 font-semibold transition-colors ${
              activeTab === 'approved'
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Approved ({approvedUsers.length})
            </div>
          </button>
        </div>

        {/* Users List */}
        {users.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === 'pending' ? (
                <Clock className="w-8 h-8 text-slate-400" />
              ) : (
                <CheckCircle className="w-8 h-8 text-green-500" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {activeTab === 'pending' ? 'No Pending Users' : 'No Approved Users'}
            </h3>
            <p className="text-slate-600">
              {activeTab === 'pending'
                ? 'All user registrations have been reviewed.'
                : 'No users have been approved yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user._id}
                className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{user.name}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-500 ml-15">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Registered: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                      {user.provider && (
                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium">
                          {user.provider === 'google' ? 'Google' : 'Email'}
                        </span>
                      )}
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  {activeTab === 'pending' && (
                    <div className="flex gap-3 ml-4">
                      <button
                        onClick={() => handleApprove(user._id)}
                        disabled={loading === user._id}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {loading === user._id ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(user._id)}
                        disabled={loading === user._id}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}

                  {activeTab === 'approved' && user.approvedAt && (
                    <div className="ml-4 text-sm text-slate-500">
                      Approved: {new Date(user.approvedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
