'use client';

// Force dynamic rendering to prevent static generation issues with useSession
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  ArrowLeft, 
  User, 
  Home, 
  Briefcase, 
  DollarSign, 
  FileText, 
  CheckCircle,
  Download,
  Eye,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink
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
  const [activeTab, setActiveTab] = useState<'split' | 'documents' | 'info'>('split');
  const [selectedDocument, setSelectedDocument] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fetchApplication = useCallback(async () => {
    try {
      const response = await fetch(`/api/loan-application?id=${params.id}`);
      const data = await response.json();
      
      if (response.ok && data.application) {
        console.log('Application loaded:', data.application);
        setApplication(data.application);
      } else {
        console.error('Failed to fetch application:', data.error || 'No application data');
        alert(`Could not load application: ${data.error || 'Application not found'}`);
        router.push('/employee/dashboard');
      }
    } catch (error) {
      console.error('Error fetching application:', error);
      alert('Error loading application. Please try again.');
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

  const handleDownloadDocument = (doc: Record<string, unknown>) => {
    // In a real implementation, this would download the file
    alert(`Downloading: ${doc.name}\n\nIn production, this would download the actual file.`);
  };

  const handleDownloadAll = () => {
    alert(`Downloading all ${application?.documents?.length || 0} documents as a ZIP file.\n\nIn production, this would create and download a ZIP archive.`);
  };

  return (
    <DashboardLayout
      userName={session.user.name || 'Employee'}
      userRole={session.user.role}
      userEmail={session.user.email || ''}
    >
      <div className="space-y-4">
        {/* Fullscreen Document Viewer */}
        {isFullscreen && application?.documents && application.documents.length > 0 && (
          <div className="fixed inset-0 z-50 bg-black">
            <div className="h-full flex flex-col">
              {/* Fullscreen Header */}
              <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="font-semibold">{String(application.documents[selectedDocument]?.name || 'Document')}</h3>
                  <span className="text-sm text-gray-400">
                    {selectedDocument + 1} of {application.documents.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDocument(Math.max(0, selectedDocument - 1))}
                    disabled={selectedDocument === 0}
                    className="p-2 hover:bg-gray-800 rounded-lg transition disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedDocument(Math.min(application.documents.length - 1, selectedDocument + 1))}
                    disabled={selectedDocument === application.documents.length - 1}
                    className="p-2 hover:bg-gray-800 rounded-lg transition disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDownloadDocument(application.documents[selectedDocument])}
                    className="p-2 hover:bg-gray-800 rounded-lg transition"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsFullscreen(false)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Document Display Area */}
              <div className="flex-1 bg-gray-100 flex items-center justify-center p-8">
                <div className="bg-white rounded-lg shadow-2xl p-8 max-w-4xl w-full">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {String(application.documents[selectedDocument]?.name || 'Document')}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Size: {((Number(application.documents[selectedDocument]?.size) || 0) / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      Document preview would be displayed here in production
                    </p>
                    <button
                      onClick={() => handleDownloadDocument(application.documents[selectedDocument])}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
                    >
                      <Download className="w-5 h-5" />
                      Download Document
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <button
            onClick={() => router.push('/employee/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Mortgage Application #{application._id.slice(-8)}
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Submitted: {new Date(application.submittedAt || application.createdAt).toLocaleDateString()} • 
                {' '}{String(application.borrowerInfo?.firstName || '')} {String(application.borrowerInfo?.lastName || '')}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
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

        {/* View Mode Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('split')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
                activeTab === 'split'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Split View</span>
                <span className="sm:hidden">Split</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
                activeTab === 'documents'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Documents Only</span>
                <span className="sm:hidden">Docs</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
                activeTab === 'info'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Application Info</span>
                <span className="sm:hidden">Info</span>
              </div>
            </button>
          </div>
        </div>

        {/* Main Content Area - Split View / Documents / Info */}
        <div className={`grid gap-4 ${activeTab === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Documents Panel */}
          {(activeTab === 'split' || activeTab === 'documents') && (
            <div className="space-y-4">
              {/* Documents Header with Actions */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Uploaded Documents ({application.documents?.length || 0})
                  </h2>
                  {application.documents && application.documents.length > 0 && (
                    <button
                      onClick={handleDownloadAll}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Download All</span>
                    </button>
                  )}
                </div>

                {/* Documents List */}
                {application.documents && application.documents.length > 0 ? (
                  <div className="space-y-2">
                    {application.documents.map((doc, index) => (
                      <div
                        key={index}
                        className={`p-4 border-2 rounded-lg transition cursor-pointer ${
                          selectedDocument === index
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                        onClick={() => setSelectedDocument(index)}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className={`w-5 h-5 flex-shrink-0 ${
                              selectedDocument === index ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium truncate ${
                                selectedDocument === index ? 'text-blue-900' : 'text-gray-900'
                              }`}>
                                {String(doc.name || `Document ${index + 1}`)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {((Number(doc.size) || 0) / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDocument(index);
                                setIsFullscreen(true);
                              }}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="View Fullscreen"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadDocument(doc);
                              }}
                              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No documents uploaded</p>
                  </div>
                )}
              </div>

              {/* Selected Document Preview */}
              {application.documents && application.documents.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Document Preview</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedDocument(Math.max(0, selectedDocument - 1))}
                        disabled={selectedDocument === 0}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="text-sm text-gray-600">
                        {selectedDocument + 1} / {application.documents.length}
                      </span>
                      <button
                        onClick={() => setSelectedDocument(Math.min(application.documents.length - 1, selectedDocument + 1))}
                        disabled={selectedDocument === application.documents.length - 1}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="border-2 border-gray-200 rounded-lg p-8 bg-gray-50">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {String(application.documents[selectedDocument]?.name || 'Document')}
                      </h4>
                      <p className="text-sm text-gray-600 mb-6">
                        Size: {((Number(application.documents[selectedDocument]?.size) || 0) / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => setIsFullscreen(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                        >
                          <Maximize2 className="w-4 h-4" />
                          View Fullscreen
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(application.documents[selectedDocument])}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Application Info Panel */}
          {(activeTab === 'split' || activeTab === 'info') && (
            <div className="space-y-4">
              {/* Quick Verification Summary */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
                <h3 className="text-lg md:text-xl font-bold mb-3">📋 Verification Checklist</h3>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded" />
                    <span>Identity documents match application</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded" />
                    <span>Income verification documents provided</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded" />
                    <span>Property information is accurate</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded" />
                    <span>Financial details verified</span>
                  </label>
                </div>
              </div>

            {/* Borrower Information */}
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
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
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
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
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
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
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-6 h-6 text-green-600" />
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Financial Information</h2>
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
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
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
          )}

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push(`/employee/applications/${application._id}/edit`)}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 font-medium"
                >
                  <FileText className="w-5 h-5" />
                  Edit Application
                </button>
                
                {application.status === 'submitted' && (
                  <button
                    onClick={() => router.push(`/employee/applications/${application._id}/decision`)}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Make Decision
                  </button>
                )}
                
                <button
                  onClick={() => window.print()}
              className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center justify-center gap-2 font-medium"
                >
                  <FileText className="w-5 h-5" />
              Print
                </button>
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}
