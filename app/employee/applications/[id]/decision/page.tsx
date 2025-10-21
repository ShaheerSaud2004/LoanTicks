'use client';

import { useState, useEffect } from 'react';

// Force dynamic rendering to prevent static generation issues with useSession
export const dynamic = 'force-dynamic';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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

export default function ApplicationDecision({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [decision, setDecision] = useState<'approved' | 'rejected' | ''>('');
  const [notes, setNotes] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'employee') {
      router.push('/login');
      return;
    }

    fetchApplication();
  }, [session, status, router, params.id]);

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/loan-application?id=${params.id}`);
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
  };

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
          applicationId: params.id,
          action: 'decision',
          decision: decision,
          decisionNotes: notes,
          status: decision === 'approved' ? 'approved' : 'rejected'
        })
      });

      if (response.ok) {
        alert(`Application ${decision} successfully!`);
        router.push(`/employee/applications/${params.id}`);
      } else {
        alert('Failed to submit decision');
      }
    } catch (error) {
      console.error('Error submitting decision:', error);
      alert('Error submitting decision');
    } finally {
      setSaving(false);
      setShowConfirm(false);
    }
  };

  if (loading) {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/employee/applications/${params.id}`)}
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
                  <h3 className="font-semibold text-gray-700 mb-3">Borrower Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {application.borrowerInfo?.firstName as string} {application.borrowerInfo?.lastName as string}</p>
                    <p><span className="font-medium">Email:</span> {application.borrowerInfo?.email as string}</p>
                    <p><span className="font-medium">Phone:</span> {application.borrowerInfo?.phone as string}</p>
                    <p><span className="font-medium">Marital Status:</span> {application.borrowerInfo?.maritalStatus as string}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Loan Details</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Loan Amount:</span> ${(application.propertyInfo?.loanAmount as number)?.toLocaleString()}</p>
                    <p><span className="font-medium">Property Value:</span> ${(application.propertyInfo?.propertyValue as number)?.toLocaleString()}</p>
                    <p><span className="font-medium">Down Payment:</span> ${(application.propertyInfo?.downPaymentAmount as number)?.toLocaleString()}</p>
                    <p><span className="font-medium">Down Payment %:</span> {(application.propertyInfo?.downPaymentPercentage as number)?.toFixed(2)}%</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-3">Financial Summary</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Monthly Income</p>
                    <p className="text-2xl font-bold text-green-700">${(application.financialInfo?.grossMonthlyIncome as number)?.toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Total Assets</p>
                    <p className="text-2xl font-bold text-blue-700">${(application.financialInfo?.totalAssets as number)?.toLocaleString()}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-600 font-medium">Total Liabilities</p>
                    <p className="text-2xl font-bold text-red-700">${(application.financialInfo?.totalLiabilities as number)?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decision Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Make Decision</h3>
              
              <div className="space-y-4">
                {/* Decision Options */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-green-500 transition">
                    <input
                      type="radio"
                      name="decision"
                      value="approved"
                      checked={decision === 'approved'}
                      onChange={(e) => setDecision(e.target.value as 'approved')}
                      className="w-5 h-5 text-green-600"
                    />
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Approve</p>
                        <p className="text-sm text-gray-600">Approve this loan application</p>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-red-500 transition">
                    <input
                      type="radio"
                      name="decision"
                      value="rejected"
                      checked={decision === 'rejected'}
                      onChange={(e) => setDecision(e.target.value as 'rejected')}
                      className="w-5 h-5 text-red-600"
                    />
                    <div className="flex items-center gap-3">
                      <XCircle className="w-6 h-6 text-red-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Reject</p>
                        <p className="text-sm text-gray-600">Reject this loan application</p>
                      </div>
                    </div>
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition resize-none"
                    rows={4}
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={!decision || !notes.trim() || saving}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Save className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
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
  );
}
