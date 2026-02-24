'use client';

// Force dynamic rendering to prevent static generation issues with useSession
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { useState, useEffect, useCallback, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  FileText,
  AlertTriangle,
  Save
} from 'lucide-react';

interface Application {
  _id: string;
  borrowerInfo: Record<string, unknown>;
  propertyInfo: Record<string, unknown>;
  financialInfo: Record<string, unknown>;
  status: string;
}

export default function ApplicationDecision({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [decision, setDecision] = useState<'approved' | 'rejected' | ''>('');
  const [notes, setNotes] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchApplication = useCallback(async () => {
    try {
      const response = await fetch(`/api/loan-application?id=${resolvedParams.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setApplication(data.application);
      } else {
        console.error('Failed to fetch application:', data.error);
        router.push('/employee/dashboard');
      }
    } catch (error) {
      console.error('Error fetching application:', error);
      router.push('/employee/dashboard');
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id, router]);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'employee') {
      router.push('/login');
      return;
    }

    fetchApplication();
  }, [session, status, router, fetchApplication]);

  const handleSubmitDecision = async () => {
    if (!decision) {
      alert('Please select a decision');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/employee/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: resolvedParams.id,
          action: 'decision',
          decision: decision,
          decisionNotes: notes,
          status: decision === 'approved' ? 'approved' : 'rejected'
        })
      });

      if (response.ok) {
        alert(`Application ${decision} successfully!`);
        router.push(`/employee/applications/${resolvedParams.id}`);
      } else {
        const data = await response.json().catch(() => ({}));
        alert(data?.error || 'Failed to submit decision');
      }
    } catch (error) {
      console.error('Error submitting decision:', error);
      alert(error instanceof Error ? error.message : 'Error submitting decision');
    } finally {
      setSaving(false);
      setShowConfirm(false);
    }
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <DashboardLayout
        userName={session.user.name || 'Employee'}
        userRole={session.user.role}
        userEmail={session.user.email || ''}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Not Found</h2>
            <button
              onClick={() => router.push('/employee/dashboard')}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userName={session.user.name || 'Employee'}
      userRole={session.user.role}
      userEmail={session.user.email || ''}
    >
      <div className="space-y-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/employee/applications/${resolvedParams.id}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Application
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Application Decision
          </h1>
          <p className="text-gray-600">
            Review and make a decision for Application #{application._id.slice(-8)}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Application Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Application Summary</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Borrower Information</h3>
                  <div className="space-y-2 text-gray-900">
                    <p><span className="font-semibold text-gray-700">Name:</span> {application.borrowerInfo?.firstName as string} {application.borrowerInfo?.lastName as string}</p>
                    <p><span className="font-semibold text-gray-700">Email:</span> {application.borrowerInfo?.email as string}</p>
                    <p><span className="font-semibold text-gray-700">Phone:</span> {application.borrowerInfo?.phone as string}</p>
                    <p><span className="font-semibold text-gray-700">Marital Status:</span> {application.borrowerInfo?.maritalStatus as string}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Loan Details</h3>
                  <div className="space-y-2 text-gray-900">
                    <p><span className="font-semibold text-gray-700">Loan Amount:</span> ${(application.propertyInfo?.loanAmount as number)?.toLocaleString()}</p>
                    <p><span className="font-semibold text-gray-700">Property Value:</span> ${(application.propertyInfo?.propertyValue as number)?.toLocaleString()}</p>
                    <p><span className="font-semibold text-gray-700">Down Payment:</span> ${(application.propertyInfo?.downPaymentAmount as number)?.toLocaleString()}</p>
                    <p><span className="font-semibold text-gray-700">Down Payment %:</span> {(application.propertyInfo?.downPaymentPercentage as number)?.toFixed(2)}%</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="font-semibold text-gray-700 mb-6">Financial Summary</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-6 rounded-xl shadow-lg">
                    <p className="text-sm text-white font-semibold mb-2 opacity-90">Monthly Income</p>
                    <p className="text-3xl font-bold text-white">${(application.financialInfo?.grossMonthlyIncome as number)?.toLocaleString()}</p>
                    <p className="text-xs text-white mt-2 opacity-75">Gross monthly earnings</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 rounded-xl shadow-lg">
                    <p className="text-sm text-white font-semibold mb-2 opacity-90">Total Assets</p>
                    <p className="text-3xl font-bold text-white">${(application.financialInfo?.totalAssets as number)?.toLocaleString()}</p>
                    <p className="text-xs text-white mt-2 opacity-75">Available liquid assets</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-600 to-pink-600 p-6 rounded-xl shadow-lg">
                    <p className="text-sm text-white font-semibold mb-2 opacity-90">Total Liabilities</p>
                    <p className="text-3xl font-bold text-white">${(application.financialInfo?.totalLiabilities as number)?.toLocaleString()}</p>
                    <p className="text-xs text-white mt-2 opacity-75">Outstanding debts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decision Panel */}
          <div className="space-y-6 min-w-0 lg:min-w-[320px]">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Make Decision</h3>
              
              <div className="space-y-6">
                {/* Decision Options */}
                <div className="space-y-5">
                  <label className={`block relative p-6 pr-14 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                    decision === 'approved' 
                      ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg shadow-green-200/50' 
                      : 'border-gray-200 hover:border-green-400 hover:shadow-md bg-white'
                  }`}>
                    <div className="flex items-start gap-4 min-w-0">
                      <input
                        type="radio"
                        name="decision"
                        value="approved"
                        checked={decision === 'approved'}
                        onChange={(e) => setDecision(e.target.value as 'approved')}
                        className="mt-1 w-5 h-5 shrink-0 text-green-600 focus:ring-green-500"
                      />
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`p-4 rounded-xl shrink-0 transition-all ${
                          decision === 'approved' 
                            ? 'bg-green-500 shadow-lg' 
                            : 'bg-green-100'
                        }`}>
                          <CheckCircle className={`w-8 h-8 ${
                            decision === 'approved' ? 'text-white' : 'text-green-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <p className="font-bold text-lg text-gray-900 mb-1">Approve Application</p>
                          <p className="text-sm text-gray-600">Approve this mortgage loan application and proceed with funding.</p>
                        </div>
                      </div>
                    </div>
                    {decision === 'approved' && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        SELECTED
                      </div>
                    )}
                  </label>
                  
                  <label className={`block relative p-6 pr-14 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                    decision === 'rejected' 
                      ? 'border-red-500 bg-gradient-to-br from-red-50 to-pink-50 shadow-lg shadow-red-200/50' 
                      : 'border-gray-200 hover:border-red-400 hover:shadow-md bg-white'
                  }`}>
                    <div className="flex items-start gap-4 min-w-0">
                      <input
                        type="radio"
                        name="decision"
                        value="rejected"
                        checked={decision === 'rejected'}
                        onChange={(e) => setDecision(e.target.value as 'rejected')}
                        className="mt-1 w-5 h-5 shrink-0 text-red-600 focus:ring-red-500"
                      />
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`p-4 rounded-xl shrink-0 transition-all ${
                          decision === 'rejected' 
                            ? 'bg-red-500 shadow-lg' 
                            : 'bg-red-100'
                        }`}>
                          <XCircle className={`w-8 h-8 ${
                            decision === 'rejected' ? 'text-white' : 'text-red-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <p className="font-bold text-lg text-gray-900 mb-1">Reject Application</p>
                          <p className="text-sm text-gray-600">Reject this mortgage loan application with detailed reasoning.</p>
                        </div>
                      </div>
                    </div>
                    {decision === 'rejected' && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        SELECTED
                      </div>
                    )}
                  </label>
                </div>

                {/* Decision Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Decision Notes *
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide detailed reasoning for your decision..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition resize-none text-gray-900 bg-white placeholder:text-gray-500"
                    rows={4}
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={!decision || !notes.trim() || saving}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-lg font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  {saving ? (
                    <>
                      <Save className="w-6 h-6 animate-spin" />
                      Submitting Decision...
                    </>
                  ) : (
                    <>
                      <FileText className="w-6 h-6" />
                      Submit Decision
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Decision Guidelines
              </h4>
              <ul className="space-y-2 text-blue-800 text-sm">
                <li>• Review all financial information carefully</li>
                <li>• Verify income and employment details</li>
                <li>• Check credit history and declarations</li>
                <li>• Ensure property value is reasonable</li>
                <li>• Provide clear reasoning for your decision</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  decision === 'approved' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {decision === 'approved' ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600" />
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Confirm Decision
                </h3>
                
                <p className="text-gray-600 mb-6">
                  Are you sure you want to <strong>{decision}</strong> this loan application? 
                  This action cannot be undone.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitDecision}
                    disabled={saving}
                    className={`flex-1 px-4 py-3 text-white rounded-xl transition ${
                      decision === 'approved' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    } disabled:opacity-50`}
                  >
                    {saving ? 'Submitting...' : `Confirm ${decision === 'approved' ? 'Approval' : 'Rejection'}`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
}
