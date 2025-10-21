'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Home, 
  Briefcase, 
  DollarSign, 
  FileText, 
  CheckCircle
} from 'lucide-react';

interface Application {
  _id: string;
  userId: string;
  status: string;
  decision?: string;
  borrowerInfo: Record<string, unknown>;
  currentAddress: Record<string, unknown>;
  employment: Record<string, unknown>;
  financialInfo: Record<string, unknown>;
  propertyInfo: Record<string, unknown>;
  declarations: Record<string, unknown>;
  documents: Record<string, unknown>[];
  statusHistory: Record<string, unknown>[];
  assignedTo?: string;
  reviewedBy?: string;
  submittedAt: string;
  createdAt: string;
}

export default function ApplicationView({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchApplication = useCallback(async () => {
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
  }, [params.id, router]);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'employee') {
      router.push('/login');
      return;
    }

    fetchApplication();
  }, [session, status, router, params.id, fetchApplication]);

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      'draft': 'bg-gray-100 text-gray-800',
      'submitted': 'bg-blue-100 text-blue-800',
      'under_review': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/employee/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Application #{application._id.slice(-8)}
              </h1>
              <p className="text-gray-600">
                Submitted on {new Date(application.submittedAt || application.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {getStatusBadge(application.status)}
              {application.decision && (
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  application.decision === 'approved' ? 'bg-green-100 text-green-800' :
                  application.decision === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {application.decision.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Borrower Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Borrower Information</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Personal Details</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {String(application.borrowerInfo?.firstName || '')} {String(application.borrowerInfo?.lastName || '')}</p>
                    <p><span className="font-medium">Email:</span> {String(application.borrowerInfo?.email || '')}</p>
                    <p><span className="font-medium">Phone:</span> {String(application.borrowerInfo?.phone || '')}</p>
                    <p><span className="font-medium">DOB:</span> {application.borrowerInfo?.dateOfBirth ? new Date(String(application.borrowerInfo.dateOfBirth)).toLocaleDateString() : 'N/A'}</p>
                    <p><span className="font-medium">SSN:</span> {String(application.borrowerInfo?.ssn || 'N/A')}</p>
                    <p><span className="font-medium">Marital Status:</span> {String(application.borrowerInfo?.maritalStatus || 'N/A')}</p>
                    <p><span className="font-medium">Dependents:</span> {Number(application.borrowerInfo?.dependents || 0)}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Email:</span> {String(application.borrowerInfo?.email || 'N/A')}</p>
                    <p><span className="font-medium">Phone:</span> {String(application.borrowerInfo?.phone || 'N/A')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Address */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <Home className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Current Address</h2>
              </div>
              
              <div className="space-y-2">
                <p><span className="font-medium">Address:</span> {String(application.currentAddress?.street || 'N/A')}</p>
                {application.currentAddress?.unit && <p><span className="font-medium">Unit:</span> {String(application.currentAddress.unit)}</p>}
                <p><span className="font-medium">City:</span> {String(application.currentAddress?.city || 'N/A')}</p>
                <p><span className="font-medium">State:</span> {String(application.currentAddress?.state || 'N/A')}</p>
                <p><span className="font-medium">ZIP:</span> {String(application.currentAddress?.zipCode || 'N/A')}</p>
                <p><span className="font-medium">Residency Type:</span> {String(application.currentAddress?.residencyType || 'N/A')}</p>
                <p><span className="font-medium">Monthly Payment:</span> ${Number(application.currentAddress?.monthlyPayment || 0)}</p>
                <p><span className="font-medium">Years at Address:</span> {String(application.currentAddress?.yearsAtAddress || 'N/A')}</p>
              </div>
            </div>

            {/* Employment */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Employment Information</h2>
              </div>
              
              <div className="space-y-2">
                <p><span className="font-medium">Status:</span> {String(application.employment?.employmentStatus || 'N/A')}</p>
                <p><span className="font-medium">Employer:</span> {String(application.employment?.employerName || 'N/A')}</p>
                <p><span className="font-medium">Position:</span> {String(application.employment?.position || 'N/A')}</p>
                <p><span className="font-medium">Years Employed:</span> {String(application.employment?.yearsEmployed || 'N/A')}</p>
                <p><span className="font-medium">Monthly Income:</span> ${Number(application.employment?.monthlyIncome || 0)}</p>
                <p><span className="font-medium">Employer Phone:</span> {String(application.employment?.employerPhone || 'N/A')}</p>
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <DollarSign className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Financial Information</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Income</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Gross Monthly Income:</span> ${Number(application.financialInfo?.grossMonthlyIncome || 0)}</p>
                    <p><span className="font-medium">Other Income:</span> ${Number(application.financialInfo?.otherIncome || 0)}</p>
                    <p><span className="font-medium">Other Income Source:</span> {String(application.financialInfo?.otherIncomeSource || 'N/A')}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Assets</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Checking Balance:</span> ${Number(application.financialInfo?.checkingAccountBalance || 0)}</p>
                    <p><span className="font-medium">Savings Balance:</span> ${Number(application.financialInfo?.savingsAccountBalance || 0)}</p>
                    <p><span className="font-medium">Total Assets:</span> ${Number(application.financialInfo?.totalAssets || 0)}</p>
                    <p><span className="font-medium">Total Liabilities:</span> ${Number(application.financialInfo?.totalLiabilities || 0)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <Home className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Property & Loan Information</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Property Details</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Address:</span> {String(application.propertyInfo?.propertyAddress || 'N/A')}</p>
                    <p><span className="font-medium">City:</span> {String(application.propertyInfo?.propertyCity || 'N/A')}</p>
                    <p><span className="font-medium">State:</span> {String(application.propertyInfo?.propertyState || 'N/A')}</p>
                    <p><span className="font-medium">ZIP:</span> {String(application.propertyInfo?.propertyZipCode || 'N/A')}</p>
                    <p><span className="font-medium">Property Type:</span> {String(application.propertyInfo?.propertyType || 'N/A')}</p>
                    <p><span className="font-medium">Property Value:</span> ${Number(application.propertyInfo?.propertyValue || 0)}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Loan Details</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Loan Amount:</span> ${Number(application.propertyInfo?.loanAmount || 0)}</p>
                    <p><span className="font-medium">Loan Purpose:</span> {String(application.propertyInfo?.loanPurpose || 'N/A')}</p>
                    <p><span className="font-medium">Down Payment:</span> ${Number(application.propertyInfo?.downPaymentAmount || 0)}</p>
                    <p><span className="font-medium">Down Payment %:</span> {Number(application.propertyInfo?.downPaymentPercentage || 0).toFixed(2)}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Declarations */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Declarations</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p><span className="font-medium">US Citizen:</span> {Boolean(application.declarations?.usCitizen) ? 'Yes' : 'No'}</p>
                  <p><span className="font-medium">Primary Residence:</span> {Boolean(application.declarations?.primaryResidence) ? 'Yes' : 'No'}</p>
                  <p><span className="font-medium">Outstanding Judgments:</span> {Boolean(application.declarations?.outstandingJudgments) ? 'Yes' : 'No'}</p>
                  <p><span className="font-medium">Bankruptcy (7 years):</span> {Boolean(application.declarations?.declaredBankruptcy) ? 'Yes' : 'No'}</p>
                </div>
                <div className="space-y-2">
                  <p><span className="font-medium">Property Foreclosed:</span> {Boolean(application.declarations?.propertyForeclosed) ? 'Yes' : 'No'}</p>
                  <p><span className="font-medium">Party to Lawsuit:</span> {Boolean(application.declarations?.lawsuitParty) ? 'Yes' : 'No'}</p>
                  <p><span className="font-medium">Loan on Property:</span> {Boolean(application.declarations?.loanOnProperty) ? 'Yes' : 'No'}</p>
                  <p><span className="font-medium">Co-maker on Note:</span> {Boolean(application.declarations?.coMakerOnNote) ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status History */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status History</h3>
              <div className="space-y-3">
                {application.statusHistory?.map((entry, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{String(entry.status)}</p>
                      <p className="text-xs text-gray-500">{new Date(String(entry.changedAt)).toLocaleString()}</p>
                      {entry.notes && <p className="text-xs text-gray-600 mt-1">{String(entry.notes)}</p>}
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500 text-sm">No status history available</p>
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
              {application.documents?.length > 0 ? (
                <div className="space-y-2">
                  {application.documents.map((doc, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{String(doc.name)}</p>
                        <p className="text-xs text-gray-500">
                          {(Number(doc.size) / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No documents uploaded</p>
              )}
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/employee/applications/${application._id}/edit`)}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Edit Application
                </button>
                
                {application.status === 'submitted' && (
                  <button
                    onClick={() => router.push(`/employee/applications/${application._id}/decision`)}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Make Decision
                  </button>
                )}
                
                <button
                  onClick={() => window.print()}
                  className="w-full px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Print Application
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
