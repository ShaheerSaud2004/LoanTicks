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
  ChevronDown,
  ChevronUp,
  Mail,
  MessageSquare,
  Calculator,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Scan,
  Loader,
  Printer
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

// Helper function to ensure URL has https:// prefix
const ensureHttps = (url: string | undefined): string => {
  if (!url) return 'https://app.arive.com/pos';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

export default function ApplicationView({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'split' | 'documents' | 'info' | 'arive'>('split');
  const [selectedDocument, setSelectedDocument] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFinancialExpanded, setIsFinancialExpanded] = useState(false);
  const [isBorrowerInfoExpanded, setIsBorrowerInfoExpanded] = useState(true);
  const [isCurrentAddressExpanded, setIsCurrentAddressExpanded] = useState(true);
  const [isEmploymentExpanded, setIsEmploymentExpanded] = useState(true);
  const [verificationChecklist, setVerificationChecklist] = useState({
    identityDocuments: false,
    incomeVerification: false,
    propertyInformation: false,
    financialDetails: false,
  });
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [isRunningOCR, setIsRunningOCR] = useState(false);
  const [ocrResults, setOcrResults] = useState<{
    documentName: string;
    extractedText: string;
    matches: Array<{ field: string; match: boolean; confidence: string }>;
  }[]>([]);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const fetchApplication = useCallback(async () => {
    try {
      const response = await fetch(`/api/loan-application?id=${resolvedParams.id}`);
      const data = await response.json();
      
      if (response.ok && data.application) {
        console.log('Application loaded:', data.application);
        setApplication(data.application);
        
        // Load saved verification checklist if it exists
        if (data.application.verificationChecklist) {
          setVerificationChecklist({
            identityDocuments: data.application.verificationChecklist.identityDocuments || false,
            incomeVerification: data.application.verificationChecklist.incomeVerification || false,
            propertyInformation: data.application.verificationChecklist.propertyInformation || false,
            financialDetails: data.application.verificationChecklist.financialDetails || false,
          });
        }
        
        // Load saved approval status
        if (data.application.decision) {
          setApprovalStatus(data.application.decision as 'pending' | 'approved' | 'rejected');
        }
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
  }, [resolvedParams.id, router]);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'employee') {
      router.push('/login');
      return;
    }

    fetchApplication();
  }, [session, status, router, resolvedParams.id, fetchApplication]);

  // Save verification checklist to database
  const saveVerificationChecklist = async (checklist: typeof verificationChecklist) => {
    try {
      const response = await fetch('/api/loan-application', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: resolvedParams.id,
          verificationChecklist: {
            ...checklist,
            checkedBy: session?.user?.id,
            checkedAt: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        console.error('Failed to save verification checklist');
      }
    } catch (error) {
      console.error('Error saving verification checklist:', error);
    }
  };

  // Save approval status to database
  const saveApprovalStatus = async (status: 'pending' | 'approved' | 'rejected') => {
    try {
      const response = await fetch('/api/loan-application', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: resolvedParams.id,
          decision: status,
          status: status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'under_review',
          decisionNotes: status !== 'pending' ? `Application ${status} by ${session?.user?.email}` : undefined,
        }),
      });

      if (!response.ok) {
        console.error('Failed to save approval status');
      } else {
        // Refresh application data
        await fetchApplication();
      }
    } catch (error) {
      console.error('Error saving approval status:', error);
    }
  };

  // OCR function to extract text from documents
  const runOCR = async () => {
    if (!application?.documents || application.documents.length === 0) {
      alert('No documents available for OCR scanning');
      return;
    }

    setIsRunningOCR(true);
    setOcrResults([]);

    try {
      // Dynamically import Tesseract to avoid SSR issues
      const Tesseract = (await import('tesseract.js')).default;

      const results = [];

      for (const doc of application.documents) {
        try {
          const docUrl = typeof doc.url === 'string' ? doc.url : '';
          const fullUrl = docUrl.startsWith('http') ? docUrl : `${window.location.origin}${docUrl}`;
          
          // Run OCR on the document
          const { data: { text } } = await Tesseract.recognize(fullUrl, 'eng', {
            logger: (m) => {
              if (m.status === 'recognizing text') {
                console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
              }
            }
          });

          // Extract key information from OCR text
          const extractedText = text.toLowerCase();
          const matches = [];

          // Compare with form data
          const firstName = String(application.borrowerInfo?.firstName || '').toLowerCase();
          const lastName = String(application.borrowerInfo?.lastName || '').toLowerCase();
          const email = String(application.borrowerInfo?.email || '').toLowerCase();
          const phone = String(application.borrowerInfo?.phone || '').replace(/\D/g, '');
          const ssn = String(application.borrowerInfo?.ssn || '').replace(/\D/g, '');
          const dob = application.borrowerInfo?.dateOfBirth 
            ? new Date(String(application.borrowerInfo.dateOfBirth)).toLocaleDateString()
            : '';

          // Check for name matches
          if (firstName && lastName) {
            const nameMatch = extractedText.includes(firstName) && extractedText.includes(lastName);
            matches.push({
              field: 'Name',
              match: nameMatch,
              confidence: nameMatch ? 'High' : 'Low'
            });
          }

          // Check for email matches
          if (email) {
            const emailMatch = extractedText.includes(email);
            matches.push({
              field: 'Email',
              match: emailMatch,
              confidence: emailMatch ? 'High' : 'Low'
            });
          }

          // Check for phone matches (extract digits from OCR text)
          if (phone) {
            const ocrPhone = extractedText.replace(/\D/g, '');
            const phoneMatch = ocrPhone.includes(phone) || phone.includes(ocrPhone.substring(0, 10));
            matches.push({
              field: 'Phone',
              match: phoneMatch,
              confidence: phoneMatch ? 'Medium' : 'Low'
            });
          }

          // Check for SSN matches (last 4 digits)
          if (ssn && ssn.length >= 4) {
            const last4SSN = ssn.slice(-4);
            const ocrSSN = extractedText.replace(/\D/g, '');
            const ssnMatch = ocrSSN.includes(last4SSN);
            matches.push({
              field: 'SSN (Last 4)',
              match: ssnMatch,
              confidence: ssnMatch ? 'High' : 'Low'
            });
          }

          // Check for date of birth
          if (dob) {
            const dobParts = dob.split('/');
            const dobMatch = dobParts.some(part => extractedText.includes(part));
            matches.push({
              field: 'Date of Birth',
              match: dobMatch,
              confidence: dobMatch ? 'Medium' : 'Low'
            });
          }

          results.push({
            documentName: String(doc.name || 'Unknown'),
            extractedText: text.substring(0, 500), // First 500 chars for preview
            matches
          });
        } catch (error) {
          console.error(`Error processing document ${doc.name}:`, error);
          results.push({
            documentName: String(doc.name || 'Unknown'),
            extractedText: 'Error processing document',
            matches: []
          });
        }
      }

      setOcrResults(results);
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Error running OCR. Please try again.');
    } finally {
      setIsRunningOCR(false);
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
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
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

  const handleDownloadDocument = async (doc: Record<string, unknown>) => {
    try {
      const applicationId = application?._id;
      if (!applicationId) {
        alert(`Error: Missing application ID`);
        return;
      }

      // Prefer GridFS file ID (new method), fallback to fileName (legacy)
      const gridFSFileId = doc.gridFSFileId as string;
      const docUrl = doc.url as string;
      const fileName = docUrl?.includes('fileName=') 
        ? docUrl.split('fileName=')[1].split('&')[0] 
        : doc.name as string;
      
      if (!gridFSFileId && !fileName) {
        alert(`Error: Missing document information`);
        return;
      }

      // Build URL with fileId (preferred) or fileName (legacy)
      const url = gridFSFileId
        ? `/api/secure-document?applicationId=${applicationId}&fileId=${encodeURIComponent(gridFSFileId)}`
        : `/api/secure-document?applicationId=${applicationId}&fileName=${encodeURIComponent(fileName)}`;

      // Fetch document from secure API
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        if (response.status === 503) {
          alert(`⚠️ Document Storage Not Configured\n\n${errorData.error}\n\n${errorData.details || ''}\n\nPlease configure cloud storage (Vercel Blob, S3, or Cloudinary) for production use.`);
        } else {
          alert(`Error downloading document: ${errorData.error || 'File not found'}`);
        }
        return;
      }

      // Create blob and download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = doc.name as string;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert(`Error downloading document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
              <div className="bg-gray-900 text-white p-3 md:p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
                    <h3 className="font-semibold text-sm md:text-base truncate">{String(application.documents[selectedDocument]?.name || 'Document')}</h3>
                    <span className="text-xs md:text-sm text-gray-400 whitespace-nowrap">
                      {selectedDocument + 1} of {application.documents.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setSelectedDocument(Math.max(0, selectedDocument - 1))}
                      disabled={selectedDocument === 0}
                      className="p-2 md:p-2.5 hover:bg-gray-800 rounded-lg transition disabled:opacity-50 flex-1 sm:flex-none"
                    >
                      <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedDocument(Math.min(application.documents.length - 1, selectedDocument + 1))}
                      disabled={selectedDocument === application.documents.length - 1}
                      className="p-2 md:p-2.5 hover:bg-gray-800 rounded-lg transition disabled:opacity-50 flex-1 sm:flex-none"
                    >
                      <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button
                      onClick={() => handleDownloadDocument(application.documents[selectedDocument])}
                      className="p-2 md:p-2.5 hover:bg-gray-800 rounded-lg transition flex-1 sm:flex-none"
                    >
                      <Download className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button
                      onClick={() => setIsFullscreen(false)}
                      className="p-2 md:p-2.5 hover:bg-gray-800 rounded-lg transition flex-1 sm:flex-none"
                    >
                      <X className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Document Display Area */}
              <div className="flex-1 bg-gray-100 flex items-center justify-center p-3 md:p-8">
                <div className="bg-white rounded-lg shadow-2xl p-4 md:p-8 max-w-4xl w-full">
                  <div className="text-center">
                    <FileText className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-3 md:mb-4" />
                    <h3 className="text-base md:text-xl font-semibold text-gray-900 mb-2 break-words px-2">
                      {String(application.documents[selectedDocument]?.name || 'Document')}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                      Size: {((Number(application.documents[selectedDocument]?.size) || 0) / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 mb-4 md:mb-6">
                      Document preview would be displayed here in production
                    </p>
                    <button
                      onClick={() => handleDownloadDocument(application.documents[selectedDocument])}
                      className="px-4 py-2 md:px-6 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto text-sm md:text-base"
                    >
                      <Download className="w-4 h-4 md:w-5 md:h-5" />
                      <span>Download Document</span>
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
              <a
                href={`/employee/applications/${application._id}/print`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                <Printer className="w-4 h-4" />
                Print application
              </a>
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
            <button
              onClick={() => setActiveTab('arive')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
                activeTab === 'arive'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span className="hidden sm:inline">ARIVE POS</span>
                <span className="sm:hidden">ARIVE</span>
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
                  <div className="space-y-2 md:space-y-3">
                    {application.documents.map((doc, index) => (
                      <div
                        key={index}
                        className={`p-3 md:p-4 border-2 rounded-lg transition cursor-pointer touch-manipulation ${
                          selectedDocument === index
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white active:bg-gray-50'
                        }`}
                        onClick={() => setSelectedDocument(index)}
                      >
                        <div className="flex items-center justify-between gap-2 md:gap-3">
                          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                            <FileText className={`w-5 h-5 md:w-6 md:h-6 flex-shrink-0 ${
                              selectedDocument === index ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm md:text-base font-medium truncate ${
                                selectedDocument === index ? 'text-blue-900' : 'text-gray-900'
                              }`}>
                                {String(doc.name || `Document ${index + 1}`)}
                              </p>
                              <p className="text-xs md:text-sm text-gray-500">
                                {((Number(doc.size) || 0) / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDocument(index);
                                setIsFullscreen(true);
                              }}
                              className="p-2 md:p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition touch-manipulation"
                              title="View Fullscreen"
                            >
                              <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadDocument(doc);
                              }}
                              className="p-2 md:p-2.5 text-gray-600 hover:text-green-600 hover:bg-green-50 active:bg-green-100 rounded-lg transition touch-manipulation"
                              title="Download"
                            >
                              <Download className="w-4 h-4 md:w-5 md:h-5" />
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
                          onClick={async () => {
                            const doc = application.documents[selectedDocument];
                            const docUrl = doc.url as string;
                            const fileName = docUrl?.includes('fileName=') 
                              ? docUrl.split('fileName=')[1].split('&')[0] 
                              : doc.name as string;
                            
                            if (application._id && fileName) {
                              const viewUrl = `/api/secure-document?applicationId=${application._id}&fileName=${encodeURIComponent(fileName)}`;
                              window.open(viewUrl, '_blank');
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                        >
                          <Maximize2 className="w-4 h-4" />
                          View Document
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
              {/* Quick Verification Summary - Enhanced Visibility */}
              <div className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-500 rounded-2xl p-6 md:p-8 text-white shadow-2xl border-4 border-yellow-400 relative overflow-hidden">
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
                  <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-20 translate-y-20"></div>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                      <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold drop-shadow-lg">
                      📋 Verification Checklist
                    </h3>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 border-2 border-white/20">
                    <div className="space-y-3 md:space-y-4">
                      <label className="flex items-center gap-3 md:gap-4 cursor-pointer touch-manipulation p-2 md:p-3 hover:bg-white/10 rounded-lg transition active:bg-white/20">
                        <input 
                          type="checkbox" 
                          checked={verificationChecklist.identityDocuments}
                          onChange={(e) => setVerificationChecklist(prev => ({ ...prev, identityDocuments: e.target.checked }))}
                          className="w-5 h-5 md:w-6 md:h-6 rounded flex-shrink-0 border-2 border-white/50 accent-yellow-400 cursor-pointer focus:ring-2 focus:ring-white/50 focus:outline-none" 
                        />
                        <span className="text-base md:text-lg lg:text-xl font-semibold leading-relaxed drop-shadow select-none">
                          Identity documents match application
                        </span>
                      </label>
                      <label className="flex items-center gap-3 md:gap-4 cursor-pointer touch-manipulation p-2 md:p-3 hover:bg-white/10 rounded-lg transition active:bg-white/20">
                        <input 
                          type="checkbox" 
                          checked={verificationChecklist.incomeVerification}
                          onChange={async (e) => {
                            const newValue = e.target.checked;
                            setVerificationChecklist(prev => ({ ...prev, incomeVerification: newValue }));
                            await saveVerificationChecklist({ ...verificationChecklist, incomeVerification: newValue });
                          }}
                          className="w-5 h-5 md:w-6 md:h-6 rounded flex-shrink-0 border-2 border-white/50 accent-yellow-400 cursor-pointer focus:ring-2 focus:ring-white/50 focus:outline-none" 
                        />
                        <span className="text-base md:text-lg lg:text-xl font-semibold leading-relaxed drop-shadow select-none">
                          Income verification documents provided
                        </span>
                      </label>
                      <label className="flex items-center gap-3 md:gap-4 cursor-pointer touch-manipulation p-2 md:p-3 hover:bg-white/10 rounded-lg transition active:bg-white/20">
                        <input 
                          type="checkbox" 
                          checked={verificationChecklist.propertyInformation}
                          onChange={async (e) => {
                            const newValue = e.target.checked;
                            setVerificationChecklist(prev => ({ ...prev, propertyInformation: newValue }));
                            await saveVerificationChecklist({ ...verificationChecklist, propertyInformation: newValue });
                          }}
                          className="w-5 h-5 md:w-6 md:h-6 rounded flex-shrink-0 border-2 border-white/50 accent-yellow-400 cursor-pointer focus:ring-2 focus:ring-white/50 focus:outline-none" 
                        />
                        <span className="text-base md:text-lg lg:text-xl font-semibold leading-relaxed drop-shadow select-none">
                          Property information is accurate
                        </span>
                      </label>
                      <label className="flex items-center gap-3 md:gap-4 cursor-pointer touch-manipulation p-2 md:p-3 hover:bg-white/10 rounded-lg transition active:bg-white/20">
                        <input 
                          type="checkbox" 
                          checked={verificationChecklist.financialDetails}
                          onChange={async (e) => {
                            const newValue = e.target.checked;
                            setVerificationChecklist(prev => ({ ...prev, financialDetails: newValue }));
                            await saveVerificationChecklist({ ...verificationChecklist, financialDetails: newValue });
                          }}
                          className="w-5 h-5 md:w-6 md:h-6 rounded flex-shrink-0 border-2 border-white/50 accent-yellow-400 cursor-pointer focus:ring-2 focus:ring-white/50 focus:outline-none" 
                        />
                        <span className="text-base md:text-lg lg:text-xl font-semibold leading-relaxed drop-shadow select-none">
                          Financial details verified
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Approval/Rejection Section */}
                  <div className="mt-6 pt-6 border-t-2 border-white/20">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                      <h4 className="text-lg md:text-xl font-bold text-white">Application Decision</h4>
                      <div className="flex gap-3">
                        <button
                          onClick={async () => {
                            setApprovalStatus('approved');
                            await saveApprovalStatus('approved');
                          }}
                          className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                            approvalStatus === 'approved'
                              ? 'bg-green-500 text-white shadow-lg scale-105'
                              : 'bg-white/20 text-white hover:bg-white/30'
                          }`}
                        >
                          <ThumbsUp className="w-5 h-5" />
                          Approve
                        </button>
                        <button
                          onClick={async () => {
                            setApprovalStatus('rejected');
                            await saveApprovalStatus('rejected');
                          }}
                          className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                            approvalStatus === 'rejected'
                              ? 'bg-red-500 text-white shadow-lg scale-105'
                              : 'bg-white/20 text-white hover:bg-white/30'
                          }`}
                        >
                          <ThumbsDown className="w-5 h-5" />
                          Reject
                        </button>
                      </div>
                    </div>
                    
                    {approvalStatus !== 'pending' && (
                      <div className={`p-4 rounded-lg ${approvalStatus === 'approved' ? 'bg-green-500/20 border-2 border-green-400' : 'bg-red-500/20 border-2 border-red-400'}`}>
                        <p className="text-white font-semibold">
                          Status: <span className="uppercase">{approvalStatus}</span>
                        </p>
                      </div>
                    )}

                    {/* Send ARIVE link to borrower (when approved) */}
                    {approvalStatus === 'approved' && application?.borrowerInfo?.email && process.env.NEXT_PUBLIC_ARIVE_POS_URL && (
                      <div className="mt-4 p-4 bg-white/10 rounded-xl border-2 border-white/20">
                        <p className="text-white font-semibold mb-2">Send ARIVE portal link to borrower</p>
                        <p className="text-sm text-white/80 mb-3">
                          Email <strong>{String(application.borrowerInfo.email)}</strong> with the ARIVE link so they can complete their application.
                        </p>
                        <button
                          onClick={async () => {
                            if (isSendingEmail) return;
                            setIsSendingEmail(true);
                            try {
                              const response = await fetch('/api/send-arive-email', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  borrowerEmail: application.borrowerInfo.email,
                                  borrowerName: `${application.borrowerInfo.firstName ?? ''} ${application.borrowerInfo.lastName ?? ''}`.trim() || 'Borrower',
                                  ariveUrl: ensureHttps(process.env.NEXT_PUBLIC_ARIVE_POS_URL),
                                }),
                              });
                              const data = await response.json();
                              if (response.ok) {
                                alert('✅ ARIVE link sent to borrower by email.');
                              } else {
                                alert(`❌ Failed to send: ${data.error || data.message || 'Unknown error'}`);
                              }
                            } catch (error) {
                              alert(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                            } finally {
                              setIsSendingEmail(false);
                            }
                          }}
                          disabled={isSendingEmail}
                          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSendingEmail ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Mail className="w-4 h-4" />
                              Send ARIVE link via email
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* OCR Section */}
                  <div className="mt-6 pt-6 border-t-2 border-white/20">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                      <div>
                        <h4 className="text-lg md:text-xl font-bold text-white mb-2">Document Verification (OCR)</h4>
                        <p className="text-sm text-white/80">Scan documents to verify they match application data</p>
                      </div>
                      <button
                        onClick={runOCR}
                        disabled={isRunningOCR || !application?.documents || application.documents.length === 0}
                        className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRunningOCR ? (
                          <>
                            <Loader className="w-5 h-5 animate-spin" />
                            Scanning...
                          </>
                        ) : (
                          <>
                            <Scan className="w-5 h-5" />
                            Run OCR Scan
                          </>
                        )}
                      </button>
                    </div>

                    {/* OCR Results */}
                    {ocrResults.length > 0 && (
                      <div className="space-y-4 mt-4">
                        {ocrResults.map((result, index) => (
                          <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border-2 border-white/20">
                            <h5 className="font-bold text-white mb-2">{result.documentName}</h5>
                            
                            {result.matches.length > 0 && (
                              <div className="space-y-2 mb-3">
                                {result.matches.map((match, matchIndex) => (
                                  <div key={matchIndex} className="flex items-center gap-2">
                                    {match.match ? (
                                      <CheckCircle className="w-4 h-4 text-green-300" />
                                    ) : (
                                      <AlertTriangle className="w-4 h-4 text-yellow-300" />
                                    )}
                                    <span className="text-sm text-white">
                                      <strong>{match.field}:</strong> {match.match ? '✓ Match' : '✗ No Match'} 
                                      <span className="text-white/70 ml-2">({match.confidence} confidence)</span>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <details className="mt-2">
                              <summary className="text-sm text-white/80 cursor-pointer hover:text-white">
                                View extracted text
                              </summary>
                              <div className="mt-2 p-2 bg-white/5 rounded text-xs text-white/90 font-mono max-h-32 overflow-y-auto">
                                {result.extractedText}
                              </div>
                            </details>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            {/* Communication Actions */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Contact Borrower
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <a
                  href={`mailto:${application.borrowerInfo?.email}?subject=Additional Information Needed for Mortgage Application #${application._id.slice(-8)}&body=Dear ${application.borrowerInfo?.firstName},

We are reviewing your mortgage application and need some additional information to proceed. Please provide the following:

1. [Specify what you need]
2. [Additional requirements]

Please reply to this email with the requested information at your earliest convenience.

Best regards,
${session?.user?.name || 'Loan Officer'}
LOANATICKS - Home Mortgage Solutions`}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm md:text-base touch-manipulation"
                >
                  <Mail className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Email Borrower</span>
                </a>
                <a
                  href={`sms:${application.borrowerInfo?.phone || ''}?&body=Hello ${application.borrowerInfo?.firstName}, this is ${session?.user?.name || 'your loan officer'} from LOANATICKS. We need additional information for your mortgage application #${application._id.slice(-8)}. Please check your email for details or call us back. Thanks!`}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm md:text-base touch-manipulation"
                >
                  <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Text Borrower</span>
                </a>
              </div>
            </div>

            {/* Financial Breakdown with Formulas */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg p-4 md:p-6 text-white">
              <button
                onClick={() => setIsFinancialExpanded(!isFinancialExpanded)}
                className="w-full flex items-center justify-between hover:bg-white/10 rounded-lg p-2 -mx-2 transition"
              >
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 md:w-6 md:h-6" />
                  <h3 className="text-base md:text-lg lg:text-xl font-bold">
                    Financial Analysis & Formulas
                  </h3>
                </div>
                {isFinancialExpanded ? (
                  <ChevronUp className="w-5 h-5 md:w-6 md:h-6" />
                ) : (
                  <ChevronDown className="w-5 h-5 md:w-6 md:h-6" />
                )}
              </button>
              
              {isFinancialExpanded && (
                <div className="space-y-4 mt-4">
                {/* LTV Ratio */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm md:text-base">Loan-to-Value (LTV) Ratio</span>
                    <span className="text-lg md:text-xl font-bold">{((Number(application.propertyInfo?.loanAmount || 0) / Number(application.propertyInfo?.propertyValue || 1)) * 100).toFixed(2)}%</span>
                  </div>
                  <div className="text-xs md:text-sm opacity-90 space-y-1">
                    <p className="font-mono bg-white/10 p-2 rounded">
                      LTV = (Loan Amount ÷ Property Value) × 100
                    </p>
                    <p>= (${Number(application.propertyInfo?.loanAmount || 0).toLocaleString()} ÷ ${Number(application.propertyInfo?.propertyValue || 1).toLocaleString()}) × 100</p>
                    <p className="text-yellow-300 mt-2">
                      {Number(application.propertyInfo?.loanAmount || 0) / Number(application.propertyInfo?.propertyValue || 1) > 0.8 
                        ? '⚠️ High LTV - May require PMI'
                        : '✅ Good LTV - No PMI required'}
                    </p>
                  </div>
                </div>

                {/* DTI Ratio */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm md:text-base">Debt-to-Income (DTI) Ratio</span>
                    <span className="text-lg md:text-xl font-bold">
                      {(() => {
                        const monthlyIncome = Number(application.employment?.monthlyIncome || 0) + Number(application.financialInfo?.otherIncome || 0);
                        const monthlyDebts = Number(application.currentAddress?.monthlyPayment || 0) + Number(application.financialInfo?.totalLiabilities || 0);
                        const estimatedMortgage = Number(application.propertyInfo?.loanAmount || 0) * 0.005; // Rough estimate
                        return monthlyIncome > 0 ? ((monthlyDebts + estimatedMortgage) / monthlyIncome * 100).toFixed(2) : '0.00';
                      })()}%
                    </span>
                  </div>
                  <div className="text-xs md:text-sm opacity-90 space-y-1">
                    <p className="font-mono bg-white/10 p-2 rounded">
                      DTI = (Total Monthly Debts + Est. Mortgage) ÷ Gross Monthly Income × 100
                    </p>
                    <p>Monthly Income: ${(Number(application.employment?.monthlyIncome || 0) + Number(application.financialInfo?.otherIncome || 0)).toLocaleString()}</p>
                    <p>Current Housing: ${Number(application.currentAddress?.monthlyPayment || 0).toLocaleString()}</p>
                    <p>Other Debts: ${Number(application.financialInfo?.totalLiabilities || 0).toLocaleString()}</p>
                    <p>Est. New Mortgage: ${(Number(application.propertyInfo?.loanAmount || 0) * 0.005).toLocaleString()}/mo</p>
                    <p className="text-yellow-300 mt-2">
                      {(() => {
                        const dti = (Number(application.currentAddress?.monthlyPayment || 0) + Number(application.financialInfo?.totalLiabilities || 0) + (Number(application.propertyInfo?.loanAmount || 0) * 0.005)) / (Number(application.employment?.monthlyIncome || 0) + Number(application.financialInfo?.otherIncome || 0));
                        return dti > 0.43 ? '⚠️ DTI exceeds 43% - May not qualify' : dti > 0.36 ? '⚠️ DTI borderline - Review carefully' : '✅ Good DTI ratio';
                      })()}
                    </p>
                  </div>
                </div>

                {/* Down Payment */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm md:text-base">Down Payment</span>
                    <span className="text-lg md:text-xl font-bold">
                      ${(Number(application.propertyInfo?.propertyValue || 0) - Number(application.propertyInfo?.loanAmount || 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs md:text-sm opacity-90 space-y-1">
                    <p className="font-mono bg-white/10 p-2 rounded">
                      Down Payment = Property Value - Loan Amount
                    </p>
                    <p>= ${Number(application.propertyInfo?.propertyValue || 0).toLocaleString()} - ${Number(application.propertyInfo?.loanAmount || 0).toLocaleString()}</p>
                    <p className="font-mono bg-white/10 p-2 rounded mt-2">
                      Down Payment % = (Down Payment ÷ Property Value) × 100
                    </p>
                    <p>= {(((Number(application.propertyInfo?.propertyValue || 0) - Number(application.propertyInfo?.loanAmount || 0)) / Number(application.propertyInfo?.propertyValue || 1)) * 100).toFixed(2)}%</p>
                  </div>
                </div>

                {/* Liquid Assets to Loan Amount */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm md:text-base">Liquid Assets Coverage</span>
                    <span className="text-lg md:text-xl font-bold">
                      {(() => {
                        const liquidAssets = Number(application.financialInfo?.checkingAccountBalance || 0) + Number(application.financialInfo?.savingsAccountBalance || 0);
                        const loanAmount = Number(application.propertyInfo?.loanAmount || 0);
                        return loanAmount > 0 ? ((liquidAssets / loanAmount) * 100).toFixed(2) : '0.00';
                      })()}%
                    </span>
                  </div>
                  <div className="text-xs md:text-sm opacity-90 space-y-1">
                    <p className="font-mono bg-white/10 p-2 rounded">
                      Coverage = (Checking + Savings) ÷ Loan Amount × 100
                    </p>
                    <p>Checking: ${Number(application.financialInfo?.checkingAccountBalance || 0).toLocaleString()}</p>
                    <p>Savings: ${Number(application.financialInfo?.savingsAccountBalance || 0).toLocaleString()}</p>
                    <p>Total Liquid: ${(Number(application.financialInfo?.checkingAccountBalance || 0) + Number(application.financialInfo?.savingsAccountBalance || 0)).toLocaleString()}</p>
                    <p>Loan Amount: ${Number(application.propertyInfo?.loanAmount || 0).toLocaleString()}</p>
                  </div>
                </div>

                {/* Estimated Monthly Payment */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm md:text-base">Estimated Monthly Payment (PITI)</span>
                    <span className="text-lg md:text-xl font-bold">
                      ${(() => {
                        const loanAmount = Number(application.propertyInfo?.loanAmount || 0);
                        const rate = 0.065; // 6.5% assumed rate
                        const monthlyRate = rate / 12;
                        const numPayments = 30 * 12; // 30 years
                        const principal = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
                        const propertyTax = Number(application.propertyInfo?.propertyValue || 0) * 0.0125 / 12; // 1.25% annual
                        const insurance = Number(application.propertyInfo?.propertyValue || 0) * 0.0035 / 12; // 0.35% annual
                        const pmi = (Number(application.propertyInfo?.loanAmount || 0) / Number(application.propertyInfo?.propertyValue || 1)) > 0.8 ? loanAmount * 0.005 / 12 : 0;
                        return (principal + propertyTax + insurance + pmi).toLocaleString(undefined, {maximumFractionDigits: 0});
                      })()}
                    </span>
                  </div>
                  <div className="text-xs md:text-sm opacity-90 space-y-1">
                    <p className="font-bold mb-1">Formula: P + I + T + I (+ PMI if LTV {">"} 80%)</p>
                    <p>• Principal & Interest: ${(() => {
                        const loanAmount = Number(application.propertyInfo?.loanAmount || 0);
                        const rate = 0.065;
                        const monthlyRate = rate / 12;
                        const numPayments = 30 * 12;
                        const pi = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
                        return pi.toLocaleString(undefined, {maximumFractionDigits: 0});
                      })()}/mo @ 6.5% for 30yr</p>
                    <p>• Property Tax: ${(Number(application.propertyInfo?.propertyValue || 0) * 0.0125 / 12).toLocaleString(undefined, {maximumFractionDigits: 0})}/mo (1.25% annual)</p>
                    <p>• Homeowners Insurance: ${(Number(application.propertyInfo?.propertyValue || 0) * 0.0035 / 12).toLocaleString(undefined, {maximumFractionDigits: 0})}/mo (0.35% annual)</p>
                    {(Number(application.propertyInfo?.loanAmount || 0) / Number(application.propertyInfo?.propertyValue || 1)) > 0.8 && (
                      <p>• PMI: ${(Number(application.propertyInfo?.loanAmount || 0) * 0.005 / 12).toLocaleString(undefined, {maximumFractionDigits: 0})}/mo (0.5% annual)</p>
                    )}
                  </div>
                </div>
              </div>
              )}
            </div>

            {/* Borrower Information */}
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <button
                onClick={() => setIsBorrowerInfoExpanded(!isBorrowerInfoExpanded)}
                className="flex items-center justify-between w-full gap-3 mb-6 hover:opacity-80 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <User className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Borrower Information</h2>
                </div>
                {isBorrowerInfoExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              {isBorrowerInfoExpanded && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Personal Details</h3>
                  <div className="space-y-2 text-gray-900">
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
                  <div className="space-y-2 text-gray-900">
                    <p><span className="font-medium">Email:</span> {String(application.borrowerInfo?.email || 'N/A')}</p>
                    <p><span className="font-medium">Phone:</span> {String(application.borrowerInfo?.phone || 'N/A')}</p>
                  </div>
                </div>
              </div>
              )}
            </div>

            {/* Current Address */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <button
                onClick={() => setIsCurrentAddressExpanded(!isCurrentAddressExpanded)}
                className="flex items-center justify-between w-full gap-3 mb-6 hover:opacity-80 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Home className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Current Address</h2>
                </div>
                {isCurrentAddressExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              {isCurrentAddressExpanded && (
              <div className="space-y-2 text-gray-900">
                <p><span className="font-medium">Address:</span> {String(application.currentAddress?.street || 'N/A')}</p>
                {application.currentAddress?.unit && <p><span className="font-medium">Unit:</span> {String(application.currentAddress.unit)}</p>}
                <p><span className="font-medium">City:</span> {String(application.currentAddress?.city || 'N/A')}</p>
                <p><span className="font-medium">State:</span> {String(application.currentAddress?.state || 'N/A')}</p>
                <p><span className="font-medium">ZIP:</span> {String(application.currentAddress?.zipCode || 'N/A')}</p>
                <p><span className="font-medium">Residency Type:</span> {String(application.currentAddress?.residencyType || 'N/A')}</p>
                <p><span className="font-medium">Monthly Payment:</span> ${Number(application.currentAddress?.monthlyPayment || 0)}</p>
                <p><span className="font-medium">Years at Address:</span> {String(application.currentAddress?.yearsAtAddress || 'N/A')}</p>
              </div>
              )}
            </div>

            {/* Employment */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <button
                onClick={() => setIsEmploymentExpanded(!isEmploymentExpanded)}
                className="flex items-center justify-between w-full gap-3 mb-6 hover:opacity-80 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Employment Information</h2>
                </div>
                {isEmploymentExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              {isEmploymentExpanded && (
              <div className="space-y-2 text-gray-900">
                <p><span className="font-medium">Status:</span> {String(application.employment?.employmentStatus || 'N/A')}</p>
                <p><span className="font-medium">Employer:</span> {String(application.employment?.employerName || 'N/A')}</p>
                <p><span className="font-medium">Position:</span> {String(application.employment?.position || 'N/A')}</p>
                <p><span className="font-medium">Years Employed:</span> {String(application.employment?.yearsEmployed || 'N/A')}</p>
                <p><span className="font-medium">Monthly Income:</span> ${Number(application.employment?.monthlyIncome || 0)}</p>
                <p><span className="font-medium">Employer Phone:</span> {String(application.employment?.employerPhone || 'N/A')}</p>
              </div>
              )}
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
                  <div className="space-y-2 text-gray-900">
                    <p><span className="font-medium">Gross Monthly Income:</span> ${Number(application.financialInfo?.grossMonthlyIncome || 0)}</p>
                    <p><span className="font-medium">Other Income:</span> ${Number(application.financialInfo?.otherIncome || 0)}</p>
                    <p><span className="font-medium">Other Income Source:</span> {String(application.financialInfo?.otherIncomeSource || 'N/A')}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Assets</h3>
                  <div className="space-y-2 text-gray-900">
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
                  <div className="space-y-2 text-gray-900">
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
                  <div className="space-y-2 text-gray-900">
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
                <div className="space-y-2 text-gray-900">
                  <p><span className="font-medium">US Citizen:</span> {application.declarations?.usCitizen ? 'Yes' : 'No'}</p>
                  <p><span className="font-medium">Primary Residence:</span> {application.declarations?.primaryResidence ? 'Yes' : 'No'}</p>
                  <p><span className="font-medium">Outstanding Judgments:</span> {application.declarations?.outstandingJudgments ? 'Yes' : 'No'}</p>
                  <p><span className="font-medium">Bankruptcy (7 years):</span> {application.declarations?.declaredBankruptcy ? 'Yes' : 'No'}</p>
                </div>
                <div className="space-y-2 text-gray-900">
                  <p><span className="font-medium">Property Foreclosed:</span> {application.declarations?.propertyForeclosed ? 'Yes' : 'No'}</p>
                  <p><span className="font-medium">Party to Lawsuit:</span> {application.declarations?.lawsuitParty ? 'Yes' : 'No'}</p>
                  <p><span className="font-medium">Loan on Property:</span> {application.declarations?.loanOnProperty ? 'Yes' : 'No'}</p>
                  <p><span className="font-medium">Co-maker on Note:</span> {application.declarations?.coMakerOnNote ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* ARIVE POS Integration */}
          {activeTab === 'arive' && (
            <div className="space-y-4">
              {/* ARIVE Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
                <h3 className="text-base md:text-lg lg:text-xl font-bold mb-2">🏦 ARIVE Borrower Portal (POS)</h3>
                <p className="text-sm md:text-base opacity-90">
                  Submit borrower information directly to ARIVE for processing. The borrower can complete their 1003 loan application through this portal.
                </p>
          </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  How to Use ARIVE POS
                </h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-0.5">1.</span>
                    <span>The iframe below displays ARIVE&apos;s Borrower Portal where borrowers complete their loan application</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-0.5">2.</span>
                    <span>You can invite borrowers by copying your unique POS URL or sending direct invitations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-0.5">3.</span>
                    <span>Borrowers can complete the full 1003 application or just upload documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-0.5">4.</span>
                    <span>All submissions sync automatically with ARIVE&apos;s system</span>
                  </li>
                </ul>
                    </div>

              {/* ARIVE Iframe Container */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">ARIVE Borrower Portal</span>
                  </div>
                  <a
                    href={ensureHttps(process.env.NEXT_PUBLIC_ARIVE_POS_URL)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white text-sm hover:underline flex items-center gap-1"
                  >
                    Open in New Tab
                    <Maximize2 className="w-4 h-4" />
                  </a>
            </div>

                <div className="relative" style={{ paddingBottom: '75%', minHeight: '600px' }}>
                  {process.env.NEXT_PUBLIC_ARIVE_POS_URL ? (
                    <iframe
                      src={ensureHttps(process.env.NEXT_PUBLIC_ARIVE_POS_URL)}
                      title="ARIVE Borrower Portal"
                      className="absolute top-0 left-0 w-full h-full border-0"
                      allow="camera *; microphone *; fullscreen *; payment *; geolocation *"
                      sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-downloads allow-popups-to-escape-sandbox allow-top-navigation"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-50">
                      <div className="text-center p-8">
                        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">ARIVE POS URL Not Configured</h3>
                        <p className="text-gray-600 mb-4">Please set up your ARIVE Borrower Portal URL in Vercel environment variables.</p>
                        <code className="bg-gray-100 px-3 py-2 rounded text-sm">NEXT_PUBLIC_ARIVE_POS_URL</code>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions for ARIVE */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <User className="w-5 h-5 text-green-600" />
                    Borrower Info
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Name:</strong> {String(application.borrowerInfo?.firstName || '')} {String(application.borrowerInfo?.lastName || '')}</p>
                    <p><strong>Email:</strong> {String(application.borrowerInfo?.email || '')}</p>
                    <p><strong>Phone:</strong> {String(application.borrowerInfo?.phone || 'N/A')}</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Loan Details
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Amount:</strong> ${Number(application.propertyInfo?.loanAmount || 0).toLocaleString()}</p>
                    <p><strong>Property Value:</strong> ${Number(application.propertyInfo?.propertyValue || 0).toLocaleString()}</p>
                    <p><strong>LTV:</strong> {((Number(application.propertyInfo?.loanAmount || 0) / Number(application.propertyInfo?.propertyValue || 1)) * 100).toFixed(2)}%</p>
                  </div>
                </div>
              </div>

              {/* Send Email Button */}
              {application && application.borrowerInfo?.email && process.env.NEXT_PUBLIC_ARIVE_POS_URL && (
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 shadow-lg">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-lg">
                        <Mail className="w-6 h-6" />
                        Send Preliminary Approval Email
                      </h4>
                      <p className="text-sm text-gray-800">
                        Send an email to <strong>{String(application.borrowerInfo.email)}</strong> with preliminary approval notification and ARIVE portal link to complete their application.
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        if (isSendingEmail) return;
                        setIsSendingEmail(true);
                        try {
                          const response = await fetch('/api/send-arive-email', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              applicationId: application._id,
                              borrowerEmail: application.borrowerInfo.email,
                              borrowerName: `${application.borrowerInfo.firstName} ${application.borrowerInfo.lastName}`,
                              ariveUrl: ensureHttps(process.env.NEXT_PUBLIC_ARIVE_POS_URL),
                            }),
                          });
                          const data = await response.json();
                          if (response.ok) {
                            alert('✅ Email sent successfully!');
                          } else {
                            alert(`❌ Failed to send email: ${data.error || 'Unknown error'}`);
                          }
                        } catch (error) {
                          alert(`❌ Error sending email: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        } finally {
                          setIsSendingEmail(false);
                        }
                      }}
                      disabled={isSendingEmail}
                      className="px-6 py-3 bg-white text-yellow-600 font-bold rounded-lg hover:bg-gray-50 active:bg-gray-100 transition shadow-md flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSendingEmail ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="w-5 h-5" />
                          Send Email
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Configuration Status */}
              {process.env.NEXT_PUBLIC_ARIVE_POS_URL ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-sm text-green-800">
                    <strong>✅ ARIVE POS Configured:</strong> <code className="bg-green-100 px-2 py-1 rounded text-xs">{ensureHttps(process.env.NEXT_PUBLIC_ARIVE_POS_URL)}</code>
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>⚙️ Configuration Required:</strong> Set your ARIVE POS URL in Vercel environment variables as <code className="bg-yellow-100 px-2 py-1 rounded">NEXT_PUBLIC_ARIVE_POS_URL</code>
                  </p>
                  <p className="text-xs text-yellow-700 mt-2">Example: <code className="bg-yellow-100 px-2 py-1 rounded">https://loanaticks.my1003app.com/2600891/register</code></p>
                </div>
              )}
            </div>
              )}
            </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-sm p-3 md:p-4">
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                <button
                  onClick={() => router.push(`/employee/applications/${application._id}/edit`)}
              className="flex-1 px-4 py-3 md:py-3.5 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition flex items-center justify-center gap-2 font-medium text-sm md:text-base touch-manipulation"
                >
                  <FileText className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Edit Application</span>
                </button>
                
                {application.status === 'submitted' && (
                  <button
                    onClick={() => router.push(`/employee/applications/${application._id}/decision`)}
                className="flex-1 px-4 py-3 md:py-3.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition flex items-center justify-center gap-2 font-medium text-sm md:text-base touch-manipulation"
                  >
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                    <span>Make Decision</span>
                  </button>
                )}
                
                <button
                  onClick={() => window.print()}
              className="flex-1 px-4 py-3 md:py-3.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 active:bg-gray-800 transition flex items-center justify-center gap-2 font-medium text-sm md:text-base touch-manipulation"
                >
                  <FileText className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Print</span>
                </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
