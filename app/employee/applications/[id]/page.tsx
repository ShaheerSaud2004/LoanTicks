'use client';

// Force dynamic rendering to prevent static generation issues with useSession
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import React, { useState, useEffect, useCallback, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { LEAD_HEADERS, buildLeadRow } from '@/lib/leadColumns';
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
  mailingAddress?: Record<string, unknown>;
  formerAddresses?: Record<string, unknown>[];
  employment: Record<string, unknown>;
  additionalEmployment?: Record<string, unknown>[];
  financialInfo: Record<string, unknown>;
  assets?: { bankAccounts?: Record<string, unknown>[] };
  liabilities?: { items?: Record<string, unknown>[] };
  propertyInfo: Record<string, unknown>;
  declarations: Record<string, unknown>;
  creditCardAuthorization?: Record<string, unknown>;
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

// Split view = narrower column; use compact layout so Application Info stays well formatted
const SplitViewContext = React.createContext(false);

// Consistent row for application info sections – compact in split view, full in Application Info tab
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  const isSplitView = React.useContext(SplitViewContext);
  const isEmpty = value == null || value === '' || value === '—';
  return (
    <div className={`flex flex-wrap gap-x-2 gap-y-1 border-b border-gray-100 last:border-0 items-baseline ${isSplitView ? 'py-2' : 'py-3 gap-x-3'}`}>
      <dt className={`text-sm font-medium text-gray-600 shrink-0 ${isSplitView ? 'min-w-[90px]' : 'min-w-[160px] sm:min-w-[180px]'}`}>{label}</dt>
      <dd className={`text-sm font-normal flex-1 min-w-0 ${isEmpty ? 'text-gray-400 italic' : 'text-gray-900'} bg-gray-50/90 rounded-md ${isSplitView ? 'px-2 py-1.5' : 'px-3 py-2'}`}>
        {value ?? '—'}
      </dd>
    </div>
  );
}

function fmtVal(val: unknown): string {
  if (val == null || val === '') return '—';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (val instanceof Date) return val.toLocaleDateString();
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) return new Date(val).toLocaleDateString();
  return String(val);
}

function fmtDollar(val: unknown): string {
  if (val == null || val === '') return '—';
  const n = Number(val);
  return Number.isNaN(n) ? String(val) : `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export default function ApplicationView({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'split' | 'documents' | 'info' | 'arive'>('split');
  const [selectedDocument, setSelectedDocument] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // All Application Info sections collapsible; start collapsed so employee can expand as needed
  const [sectionsExpanded, setSectionsExpanded] = useState<Record<string, boolean>>({
    borrower: false, currentAddress: false, mailing: false, formerAddresses: false,
    employment: false, additionalEmployment: false, financial: false, property: false,
    assets: false, liabilities: false, declarations: false, creditCard: false, verification: false,
    financialAnalysis: false,
  });
  const toggleSection = (key: string) => setSectionsExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  const [verificationChecklist, setVerificationChecklist] = useState({
    identityDocuments: false,
    incomeVerification: false,
    propertyInformation: false,
    financialDetails: false,
  });
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [isSavingDecision, setIsSavingDecision] = useState(false);
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

  // Save approval status to database (used by header and Verification section)
  const saveApprovalStatus = async (status: 'pending' | 'approved' | 'rejected') => {
    setIsSavingDecision(true);
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
        setApprovalStatus(status);
        await fetchApplication();
      }
    } catch (error) {
      console.error('Error saving approval status:', error);
    } finally {
      setIsSavingDecision(false);
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
              {/* Approve / Reject – saves to database via saveApprovalStatus */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={async () => { await saveApprovalStatus('approved'); }}
                  disabled={isSavingDecision}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition disabled:opacity-60 ${
                    approvalStatus === 'approved' ? 'bg-teal-600 text-white ring-2 ring-teal-300' : 'bg-white border border-gray-300 text-gray-700 hover:bg-teal-50 hover:border-teal-300'
                  }`}
                >
                  {isSavingDecision ? <Loader className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />} Approve
                </button>
                <button
                  onClick={async () => { await saveApprovalStatus('rejected'); }}
                  disabled={isSavingDecision}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition disabled:opacity-60 ${
                    approvalStatus === 'rejected' ? 'bg-red-600 text-white ring-2 ring-red-300' : 'bg-white border border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-300'
                  }`}
                >
                  {isSavingDecision ? <Loader className="w-4 h-4 animate-spin" /> : <ThumbsDown className="w-4 h-4" />} Reject
                </button>
                {approvalStatus !== 'pending' && (
                  <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                    approvalStatus === 'approved' ? 'bg-teal-100 text-teal-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {approvalStatus.toUpperCase()}
                  </span>
                )}
              </div>
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

          {/* Application Info Panel – split screen: doc left, submitted info right (borrower at top) */}
          {(activeTab === 'split' || activeTab === 'info') && (
            <div className={`flex flex-col min-w-0 lg:min-w-[400px] ${activeTab === 'split' ? 'lg:max-h-[calc(100vh-11rem)] lg:overflow-y-auto lg:min-h-[400px]' : ''}`}>
            {/* Inner wrapper: in split view prevent flex shrink so accordion content is visible when expanded */}
            <div className={`space-y-6 flex flex-col ${activeTab === 'split' ? '[&>*]:shrink-0' : ''}`}>
            <SplitViewContext.Provider value={false}>
            {/* Application Info heading */}
            <div className="flex items-center gap-3 px-1 pb-2 border-b-2 border-gray-200">
              <div className="p-2 rounded-lg bg-teal-100">
                <User className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Application Info</h2>
                <p className="text-xs text-gray-500 mt-0.5">Submitted application details</p>
              </div>
            </div>
            {/* Borrower – always first so you see who applied while viewing the doc */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden border-l-4 border-l-teal-500">
              <button onClick={() => toggleSection('borrower')} className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-200 bg-gray-50 hover:bg-gray-100 transition text-left">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 uppercase tracking-wide"><User className="w-5 h-5 text-teal-600" /> Borrower information</h3>
                {sectionsExpanded.borrower ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
              </button>
              {sectionsExpanded.borrower && (
                <dl className="px-4 py-4 md:px-5 md:py-5 min-h-[120px] text-gray-900">
                  <InfoRow label="Name" value={`${fmtVal(application.borrowerInfo?.firstName)} ${fmtVal(application.borrowerInfo?.middleName)} ${fmtVal(application.borrowerInfo?.lastName)} ${fmtVal(application.borrowerInfo?.suffix)}`.replace(/\s+/g, ' ').trim()} />
                  <InfoRow label="Email" value={fmtVal(application.borrowerInfo?.email)} />
                  <InfoRow label="Phone" value={fmtVal(application.borrowerInfo?.phone)} />
                  <InfoRow label="Work phone" value={fmtVal(application.borrowerInfo?.workPhone)} />
                  <InfoRow label="Cell" value={fmtVal(application.borrowerInfo?.cellPhone)} />
                  <InfoRow label="Alternate phone" value={fmtVal(application.borrowerInfo?.alternatePhone)} />
                  <InfoRow label="Date of birth" value={application.borrowerInfo?.dateOfBirth ? new Date(String(application.borrowerInfo.dateOfBirth)).toLocaleDateString() : '—'} />
                  <InfoRow label="SSN" value={fmtVal(application.borrowerInfo?.ssn)} />
                  <InfoRow label="Marital status" value={fmtVal(application.borrowerInfo?.maritalStatus)} />
                  <InfoRow label="Dependents" value={fmtVal(application.borrowerInfo?.dependents)} />
                  <InfoRow label="Dependent ages" value={fmtVal(application.borrowerInfo?.dependentAges)} />
                  <InfoRow label="Preferred contact" value={fmtVal(application.borrowerInfo?.preferredContactMethod)} />
                  <InfoRow label="Citizenship" value={fmtVal(application.borrowerInfo?.citizenshipType)} />
                  <InfoRow label="Credit score" value={fmtVal(application.borrowerInfo?.creditScore)} />
                  <InfoRow label="Credit pull consent" value={fmtVal(application.borrowerInfo?.creditPullConsent)} />
                  <InfoRow label="Race" value={fmtVal(application.borrowerInfo?.race)} />
                  <InfoRow label="Ethnicity" value={fmtVal(application.borrowerInfo?.ethnicity)} />
                  <InfoRow label="Sex" value={fmtVal(application.borrowerInfo?.sex)} />
                </dl>
              )}
            </div>

            {/* Current address */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden border-l-4 border-l-blue-500">
              <button onClick={() => toggleSection('currentAddress')} className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-200 bg-gray-50 hover:bg-gray-100 transition text-left">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 uppercase tracking-wide"><Home className="w-5 h-5 text-blue-600" /> Current address</h3>
                {sectionsExpanded.currentAddress ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
              </button>
              {sectionsExpanded.currentAddress && (
                <dl className="px-4 py-4 md:px-5 md:py-5 min-h-[120px] text-gray-900">
                  <InfoRow label="Street" value={fmtVal(application.currentAddress?.street)} />
                  <InfoRow label="Unit" value={fmtVal(application.currentAddress?.unit)} />
                  <InfoRow label="City" value={fmtVal(application.currentAddress?.city)} />
                  <InfoRow label="State" value={fmtVal(application.currentAddress?.state)} />
                  <InfoRow label="ZIP" value={fmtVal(application.currentAddress?.zipCode)} />
                  <InfoRow label="Residency type" value={fmtVal(application.currentAddress?.residencyType)} />
                  <InfoRow label="Monthly payment" value={fmtDollar(application.currentAddress?.monthlyPayment)} />
                  <InfoRow label="Years at address" value={fmtVal(application.currentAddress?.yearsAtAddress)} />
                  <InfoRow label="Months at address" value={fmtVal(application.currentAddress?.monthsAtAddress)} />
                </dl>
              )}
            </div>

            {/* Mailing address (if different) */}
            {application.mailingAddress && (application.mailingAddress as { street?: string }).street && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden border-l-4 border-l-slate-400">
                <button onClick={() => toggleSection('mailing')} className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-200 bg-gray-50 hover:bg-gray-100 transition text-left">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 uppercase tracking-wide"><Mail className="w-5 h-5 text-slate-600" /> Mailing address</h3>
                  {sectionsExpanded.mailing ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                </button>
                {sectionsExpanded.mailing && (
                <dl className="px-4 py-4 md:px-5 md:py-5 text-gray-900">
                  <InfoRow label="Street" value={fmtVal((application.mailingAddress as { street?: string }).street)} />
                  <InfoRow label="Unit" value={fmtVal((application.mailingAddress as { unit?: string }).unit)} />
                  <InfoRow label="City" value={fmtVal((application.mailingAddress as { city?: string }).city)} />
                  <InfoRow label="State" value={fmtVal((application.mailingAddress as { state?: string }).state)} />
                  <InfoRow label="ZIP" value={fmtVal((application.mailingAddress as { zipCode?: string }).zipCode)} />
                </dl>
                )}
              </div>
            )}

            {/* Former addresses */}
            {application.formerAddresses && Array.isArray(application.formerAddresses) && application.formerAddresses.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden border-l-4 border-l-slate-400">
                <button onClick={() => toggleSection('formerAddresses')} className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-200 bg-gray-50 hover:bg-gray-100 transition text-left">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 uppercase tracking-wide"><Home className="w-5 h-5 text-slate-600" /> Former addresses</h3>
                  {sectionsExpanded.formerAddresses ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                </button>
                {sectionsExpanded.formerAddresses && (
                <div className="px-4 py-4 md:px-5 md:py-5 space-y-4 text-gray-900">
                  {application.formerAddresses.map((addr: Record<string, unknown>, i: number) => (
                    <div key={i} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Prior address {i + 1}</p>
                      <dl>
                        <InfoRow label="Street" value={fmtVal(addr.street)} />
                        <InfoRow label="City, State ZIP" value={[addr.city, addr.state, addr.zipCode].filter(Boolean).map(String).join(', ')} />
                        <InfoRow label="Residency type" value={fmtVal(addr.residencyType)} />
                        <InfoRow label="Years / months" value={[addr.yearsAtAddress != null ? `${addr.yearsAtAddress} yr` : '', addr.monthsAtAddress != null ? `${addr.monthsAtAddress} mo` : ''].filter(Boolean).join(', ') || '—'} />
                      </dl>
                    </div>
                  ))}
                </div>
                )}
              </div>
            )}

            {/* Employment */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden border-l-4 border-l-amber-500">
              <button onClick={() => toggleSection('employment')} className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-200 bg-gray-50 hover:bg-gray-100 transition text-left">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 uppercase tracking-wide"><Briefcase className="w-5 h-5 text-amber-600" /> Employment</h3>
                {sectionsExpanded.employment ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
              </button>
              {sectionsExpanded.employment && (
                <dl className="px-4 py-4 md:px-5 md:py-5 min-h-[120px] text-gray-900">
                  <InfoRow label="Status" value={fmtVal(application.employment?.employmentStatus)} />
                  <InfoRow label="Employer" value={fmtVal(application.employment?.employerName)} />
                  <InfoRow label="Phone" value={fmtVal(application.employment?.phone || application.employment?.employerPhone)} />
                  <InfoRow label="Employer address" value={[application.employment?.street, application.employment?.city, application.employment?.state, application.employment?.zipCode].filter(Boolean).map(String).join(', ')} />
                  <InfoRow label="Position" value={fmtVal(application.employment?.position)} />
                  <InfoRow label="Start date" value={application.employment?.startDate ? new Date(String(application.employment.startDate)).toLocaleDateString() : '—'} />
                  <InfoRow label="Years in line of work" value={fmtVal(application.employment?.yearsInLineOfWork || application.employment?.yearsEmployed)} />
                  <InfoRow label="Months in line of work" value={fmtVal(application.employment?.monthsInLineOfWork)} />
                  <InfoRow label="Monthly income" value={fmtDollar(application.employment?.monthlyIncome)} />
                  <InfoRow label="Base income" value={fmtDollar(application.employment?.baseIncome)} />
                  <InfoRow label="Overtime" value={fmtDollar(application.employment?.overtime)} />
                  <InfoRow label="Bonus" value={fmtDollar(application.employment?.bonus)} />
                  <InfoRow label="Commission" value={fmtDollar(application.employment?.commission)} />
                  <InfoRow label="Other income" value={fmtDollar(application.employment?.otherIncome)} />
                </dl>
              )}
            </div>

            {/* Additional employment */}
            {application.additionalEmployment && Array.isArray(application.additionalEmployment) && application.additionalEmployment.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden border-l-4 border-l-amber-400">
                <button onClick={() => toggleSection('additionalEmployment')} className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-200 bg-gray-50 hover:bg-gray-100 transition text-left">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 uppercase tracking-wide"><Briefcase className="w-5 h-5 text-amber-600" /> Additional employment</h3>
                  {sectionsExpanded.additionalEmployment ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                </button>
                {sectionsExpanded.additionalEmployment && (
                <div className="px-4 py-4 md:px-5 md:py-5 space-y-4 text-gray-900">
                  {application.additionalEmployment.map((job: Record<string, unknown>, i: number) => (
                    <div key={i} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Job {i + 1}</p>
                      <dl>
                        <InfoRow label="Employer" value={fmtVal(job.employerName)} />
                        <InfoRow label="Position" value={fmtVal(job.position)} />
                        <InfoRow label="Start / end" value={[job.startDate ? new Date(String(job.startDate)).toLocaleDateString() : '', job.endDate ? new Date(String(job.endDate)).toLocaleDateString() : ''].filter(Boolean).join(' – ')} />
                        <InfoRow label="Monthly income" value={fmtDollar(job.monthlyIncome)} />
                      </dl>
                    </div>
                  ))}
                </div>
                )}
              </div>
            )}

            {/* Financial information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden border-l-4 border-l-emerald-500">
              <button onClick={() => toggleSection('financial')} className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-200 bg-gray-50 hover:bg-gray-100 transition text-left">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 uppercase tracking-wide"><DollarSign className="w-5 h-5 text-emerald-600" /> Financial information</h3>
                {sectionsExpanded.financial ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
              </button>
              {sectionsExpanded.financial && (
              <dl className="px-4 py-4 md:px-5 md:py-5 text-gray-900">
                <InfoRow label="Gross monthly income" value={fmtDollar(application.financialInfo?.grossMonthlyIncome)} />
                <InfoRow label="Other income" value={fmtDollar(application.financialInfo?.otherIncome)} />
                <InfoRow label="Other income source" value={fmtVal(application.financialInfo?.otherIncomeSource)} />
                <InfoRow label="Checking balance" value={fmtDollar(application.financialInfo?.checkingAccountBalance)} />
                <InfoRow label="Savings balance" value={fmtDollar(application.financialInfo?.savingsAccountBalance)} />
                <InfoRow label="Total assets" value={fmtDollar(application.financialInfo?.totalAssets)} />
                <InfoRow label="Total liabilities" value={fmtDollar(application.financialInfo?.totalLiabilities)} />
              </dl>
              )}
            </div>

            {/* Property & loan */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden border-l-4 border-l-indigo-500">
              <button onClick={() => toggleSection('property')} className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-200 bg-gray-50 hover:bg-gray-100 transition text-left">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 uppercase tracking-wide"><Home className="w-5 h-5 text-indigo-600" /> Property & loan</h3>
                {sectionsExpanded.property ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
              </button>
              {sectionsExpanded.property && (
              <dl className="px-4 py-4 md:px-5 md:py-5 text-gray-900">
                <InfoRow label="Address" value={[application.propertyInfo?.propertyAddress, application.propertyInfo?.unit, application.propertyInfo?.propertyCity, application.propertyInfo?.propertyState, application.propertyInfo?.propertyZipCode].filter(Boolean).map(String).join(', ')} />
                <InfoRow label="Property type" value={fmtVal(application.propertyInfo?.propertyType)} />
                <InfoRow label="Number of units" value={fmtVal(application.propertyInfo?.numberOfUnits)} />
                <InfoRow label="Occupancy" value={fmtVal(application.propertyInfo?.occupancyType)} />
                <InfoRow label="Property value" value={fmtDollar(application.propertyInfo?.propertyValue)} />
                <InfoRow label="Loan amount" value={fmtDollar(application.propertyInfo?.loanAmount)} />
                <InfoRow label="Loan purpose" value={fmtVal(application.propertyInfo?.loanPurpose)} />
                <InfoRow label="Refinance purpose" value={fmtVal(application.propertyInfo?.refinancePurpose)} />
                <InfoRow label="Down payment" value={fmtDollar(application.propertyInfo?.downPaymentAmount)} />
                <InfoRow label="Down payment %" value={application.propertyInfo?.downPaymentPercentage != null ? `${Number(application.propertyInfo.downPaymentPercentage).toFixed(2)}%` : '—'} />
              </dl>
              )}
            </div>

            {/* Assets (bank accounts from application) */}
            {application.assets?.bankAccounts && Array.isArray(application.assets.bankAccounts) && application.assets.bankAccounts.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden border-l-4 border-l-emerald-400">
                <button onClick={() => toggleSection('assets')} className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-200 bg-gray-50 hover:bg-gray-100 transition text-left">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 uppercase tracking-wide"><DollarSign className="w-5 h-5 text-emerald-600" /> Assets (bank accounts)</h3>
                  {sectionsExpanded.assets ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                </button>
                {sectionsExpanded.assets && (
                <dl className="px-4 py-4 md:px-5 md:py-5 text-gray-900">
                  {application.assets.bankAccounts.map((acct: Record<string, unknown>, i: number) => (
                    <InfoRow key={i} label={String(acct.accountType || 'Account')} value={fmtDollar(acct.cashOrMarketValue)} />
                  ))}
                </dl>
                )}
              </div>
            )}

            {/* Liabilities (items from application) */}
            {application.liabilities?.items && Array.isArray(application.liabilities.items) && application.liabilities.items.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden border-l-4 border-l-rose-400">
                <button onClick={() => toggleSection('liabilities')} className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-200 bg-gray-50 hover:bg-gray-100 transition text-left">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 uppercase tracking-wide"><DollarSign className="w-5 h-5 text-rose-600" /> Liabilities</h3>
                  {sectionsExpanded.liabilities ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                </button>
                {sectionsExpanded.liabilities && (
                <div className="px-4 py-4 md:px-5 md:py-5 space-y-3 text-gray-900">
                  {application.liabilities.items.map((item: Record<string, unknown>, i: number) => (
                    <div key={i} className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      <span className="font-medium text-gray-600">{fmtVal(item.liabilityType)}</span>
                      <span>{fmtVal(item.creditorName)}</span>
                      <span>Payment: {fmtDollar(item.monthlyPayment)}</span>
                      <span>Balance: {fmtDollar(item.unpaidBalance)}</span>
                    </div>
                  ))}
                </div>
                )}
              </div>
            )}

            {/* Declarations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden border-l-4 border-l-violet-500">
              <button onClick={() => toggleSection('declarations')} className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-200 bg-gray-50 hover:bg-gray-100 transition text-left">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 uppercase tracking-wide"><FileText className="w-5 h-5 text-violet-600" /> Declarations</h3>
                {sectionsExpanded.declarations ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
              </button>
              {sectionsExpanded.declarations && (
              <dl className="px-4 py-4 md:px-5 md:py-5 grid sm:grid-cols-2 gap-x-6 text-gray-900">
                <div>
                  <InfoRow label="U.S. citizen" value={fmtVal(application.declarations?.usCitizen)} />
                  <InfoRow label="Primary residence" value={fmtVal(application.declarations?.primaryResidence)} />
                  <InfoRow label="Intend to occupy" value={fmtVal(application.declarations?.intendToOccupy)} />
                  <InfoRow label="Borrowing down payment" value={fmtVal(application.declarations?.borrowingDownPayment)} />
                  <InfoRow label="Ownership interest (3 yr)" value={fmtVal(application.declarations?.ownershipInterestInLast3Years)} />
                  <InfoRow label="Outstanding judgments" value={fmtVal(application.declarations?.outstandingJudgments)} />
                  <InfoRow label="Federal debt delinquent" value={fmtVal(application.declarations?.federalDebtDelinquent)} />
                  <InfoRow label="Bankruptcy (7 yr)" value={fmtVal(application.declarations?.declaredBankruptcy)} />
                  <InfoRow label="Bankruptcy chapter" value={fmtVal(application.declarations?.bankruptcyChapter)} />
                </div>
                <div>
                  <InfoRow label="Property foreclosed" value={fmtVal(application.declarations?.propertyForeclosed)} />
                  <InfoRow label="Conveyed title in lieu" value={fmtVal(application.declarations?.conveyedTitleInLieu)} />
                  <InfoRow label="Pre-foreclosure/short sale" value={fmtVal(application.declarations?.completedPreForeclosureSale)} />
                  <InfoRow label="Party to lawsuit" value={fmtVal(application.declarations?.lawsuitParty)} />
                  <InfoRow label="Loan on property" value={fmtVal(application.declarations?.loanOnProperty)} />
                  <InfoRow label="Co-maker on note" value={fmtVal(application.declarations?.coMakerOnNote)} />
                  <InfoRow label="Property subject to lien" value={fmtVal(application.declarations?.propertySubjectToLien)} />
                  <InfoRow label="Co-signer or guarantor" value={fmtVal(application.declarations?.cosignerOrGuarantor)} />
                </div>
              </dl>
              )}
            </div>

            {/* Credit Card & Authorization */}
            {(application.creditCardAuthorization && (application.creditCardAuthorization.authorizationAgreed || application.creditCardAuthorization.authBorrower1Name || application.creditCardAuthorization.cardType)) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden border-l-4 border-l-teal-500">
                <button onClick={() => toggleSection('creditCard')} className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-200 bg-teal-50 hover:bg-teal-100/50 transition text-left">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 uppercase tracking-wide"><CheckCircle className="w-5 h-5 text-teal-600" /> Credit card & authorization</h3>
                    <p className="text-xs text-gray-600 mt-1">Borrower authorized credit check and card charges for application fees.</p>
                  </div>
                  {sectionsExpanded.creditCard ? <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />}
                </button>
                {sectionsExpanded.creditCard && (
                <dl className="px-4 py-4 md:px-5 md:py-5 text-gray-900">
                  <InfoRow label="Authorization agreed" value={fmtVal(application.creditCardAuthorization?.authorizationAgreed)} />
                  <InfoRow label="Borrower 1" value={fmtVal(application.creditCardAuthorization?.authBorrower1Name)} />
                  <InfoRow label="Borrower 2" value={fmtVal(application.creditCardAuthorization?.authBorrower2Name)} />
                  <InfoRow label="Card type" value={fmtVal(application.creditCardAuthorization?.cardType)} />
                  <InfoRow label="Card last 4" value={application.creditCardAuthorization?.cardLast4 ? `****${String(application.creditCardAuthorization.cardLast4)}` : '—'} />
                  <InfoRow label="Name on card" value={fmtVal(application.creditCardAuthorization?.nameOnCard)} />
                  <InfoRow label="Signature / date" value={[application.creditCardAuthorization?.authSignature1, application.creditCardAuthorization?.authDate1].filter(Boolean).map(String).join(' · ')} />
                </dl>
                )}
              </div>
            )}

            {/* Verification & decision – prominent card with Approve / Reject */}
            <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden border-l-4 border-l-teal-600">
              <button onClick={() => toggleSection('verification')} className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-200 bg-teal-50 hover:bg-teal-100/50 transition text-left">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 uppercase tracking-wide">
                    <CheckCircle className="w-5 h-5 text-teal-600" />
                    Verification & decision
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">Review checklist and approve or reject this application.</p>
                </div>
                {sectionsExpanded.verification ? <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />}
              </button>
              {sectionsExpanded.verification && (
              <div className="p-4 md:p-5 space-y-5">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Checklist</h4>
                  <div className="space-y-2">
                    {[
                      { key: 'identityDocuments' as const, label: 'Identity documents match application' },
                      { key: 'incomeVerification' as const, label: 'Income verification documents provided' },
                      { key: 'propertyInformation' as const, label: 'Property information is accurate' },
                      { key: 'financialDetails' as const, label: 'Financial details verified' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer py-2 rounded-lg hover:bg-gray-50 px-2 -mx-2">
                        <input
                          type="checkbox"
                          checked={verificationChecklist[key]}
                          onChange={async (e) => {
                            const newValue = e.target.checked;
                            setVerificationChecklist(prev => ({ ...prev, [key]: newValue }));
                            await saveVerificationChecklist({ ...verificationChecklist, [key]: newValue });
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-800">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t-2 border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Application decision</h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={async () => { setApprovalStatus('approved'); await saveApprovalStatus('approved'); }}
                      className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition ${approvalStatus === 'approved' ? 'bg-teal-600 text-white ring-2 ring-teal-300' : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300'}`}
                    >
                      <ThumbsUp className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={async () => { setApprovalStatus('rejected'); await saveApprovalStatus('rejected'); }}
                      className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition ${approvalStatus === 'rejected' ? 'bg-red-600 text-white ring-2 ring-red-300' : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300'}`}
                    >
                      <ThumbsDown className="w-4 h-4" /> Reject
                    </button>
                    {approvalStatus !== 'pending' && (
                      <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${approvalStatus === 'approved' ? 'bg-teal-50 text-teal-800' : 'bg-red-50 text-red-800'}`}>
                        {approvalStatus.toUpperCase()}
                      </span>
                    )}
                  </div>
                  {approvalStatus === 'approved' && application?.borrowerInfo?.email && process.env.NEXT_PUBLIC_ARIVE_POS_URL && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700 mb-2">Send ARIVE portal link to <strong>{String(application.borrowerInfo.email)}</strong></p>
                      <button
                        onClick={async () => {
                          if (isSendingEmail) return;
                          setIsSendingEmail(true);
                          try {
                            const res = await fetch('/api/send-arive-email', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                borrowerEmail: application.borrowerInfo.email,
                                borrowerName: `${application.borrowerInfo.firstName ?? ''} ${application.borrowerInfo.lastName ?? ''}`.trim() || 'Borrower',
                                ariveUrl: ensureHttps(process.env.NEXT_PUBLIC_ARIVE_POS_URL),
                              }),
                            });
                            const data = await res.json();
                            alert(res.ok ? 'ARIVE link sent.' : (data.error || 'Failed to send'));
                          } catch (e) {
                            alert(e instanceof Error ? e.message : 'Error');
                          } finally {
                            setIsSendingEmail(false);
                          }
                        }}
                        disabled={isSendingEmail}
                        className="px-3 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        {isSendingEmail ? <Loader className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                        Send ARIVE link via email
                      </button>
                      <p className="text-xs text-gray-500 mt-3 mb-2">Or upload their info to ARIVE yourself:</p>
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`/api/loan-application/export-arive-xml?id=${application._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                        >
                          <FileText className="w-4 h-4" />
                          Download XML for ARIVE (3.4)
                        </a>
                        <a
                          href={`/api/loan-application/export-lead-xlsx?id=${application._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                        >
                          <Download className="w-4 h-4" />
                          Download Excel (Lead format)
                        </a>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Import XML in ARIVE: + Loan → Import 3.4 file. Drop the Excel into your other platform.</p>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Document verification (OCR)</h4>
                  <p className="text-xs text-gray-500 mb-2">Uploaded documents are stored securely (MongoDB). Run OCR to compare document text with the application data below.</p>
                  <button
                    onClick={runOCR}
                    disabled={isRunningOCR || !application?.documents || application.documents.length === 0}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    {isRunningOCR ? <Loader className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
                    Run OCR scan
                  </button>
                  {ocrResults.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {ocrResults.map((result, index) => (
                        <div key={index} className="rounded-lg border border-gray-200 p-3 bg-gray-50 text-sm">
                          <p className="font-medium text-gray-900 mb-2">{result.documentName}</p>
                          {result.matches.length > 0 && (
                            <ul className="space-y-1 mb-2">
                              {result.matches.map((m, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  {m.match ? <CheckCircle className="w-3.5 h-3.5 text-teal-600" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                                  <span>{m.field}: {m.match ? 'Match' : 'No match'} ({m.confidence})</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          <details className="mt-1">
                            <summary className="cursor-pointer text-gray-500 hover:text-gray-700">View extracted text</summary>
                            <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto max-h-24">{result.extractedText}</pre>
                          </details>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                Contact borrower
              </h3>
              <div className="grid sm:grid-cols-2 gap-2">
                <a
                  href={`mailto:${application.borrowerInfo?.email}?subject=Additional Information Needed for Mortgage Application #${application._id.slice(-8)}&body=Dear ${application.borrowerInfo?.firstName},

We are reviewing your mortgage application and need some additional information to proceed. Please provide the following:

1. [Specify what you need]
2. [Additional requirements]

Please reply to this email with the requested information at your earliest convenience.

Best regards,
${session?.user?.name || 'Loan Officer'}
LOANATICKS - Home Mortgage Solutions`}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
                >
                  <Mail className="w-4 h-4" /> Email borrower
                </a>
                <a
                  href={`sms:${application.borrowerInfo?.phone || ''}?&body=Hello ${application.borrowerInfo?.firstName}, this is ${session?.user?.name || 'your loan officer'} from LOANATICKS. We need additional information for your mortgage application #${application._id.slice(-8)}. Please check your email for details or call us back. Thanks!`}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
                >
                  <MessageSquare className="w-4 h-4" /> Text borrower
                </a>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection('financialAnalysis')}
                className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 hover:bg-gray-100 transition text-left"
              >
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-gray-600" />
                  Financial analysis
                </h3>
                {sectionsExpanded.financialAnalysis ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
              </button>
              {sectionsExpanded.financialAnalysis && (
                <div className="p-4 space-y-4">
                  <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">LTV</span>
                      <span className="font-semibold text-gray-900">{((Number(application.propertyInfo?.loanAmount || 0) / Number(application.propertyInfo?.propertyValue || 1)) * 100).toFixed(2)}%</span>
                    </div>
                    <p className="text-xs text-gray-500">Loan ÷ Property value. {Number(application.propertyInfo?.loanAmount || 0) / Number(application.propertyInfo?.propertyValue || 1) > 0.8 ? 'High LTV – PMI likely.' : 'Within typical range.'}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">DTI (est.)</span>
                      <span className="font-semibold text-gray-900">
                        {(() => {
                          const income = Number(application.employment?.monthlyIncome || 0) + Number(application.financialInfo?.otherIncome || 0);
                          const debts = Number(application.currentAddress?.monthlyPayment || 0) + Number(application.financialInfo?.totalLiabilities || 0) + Number(application.propertyInfo?.loanAmount || 0) * 0.005;
                          return income > 0 ? ((debts / income) * 100).toFixed(2) : '0';
                        })()}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Debts + est. mortgage ÷ income.</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">Down payment</span>
                      <span className="font-semibold text-gray-900">{fmtDollar(Number(application.propertyInfo?.propertyValue || 0) - Number(application.propertyInfo?.loanAmount || 0))}</span>
                    </div>
                    <p className="text-xs text-gray-500">Property value − loan amount.</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">Est. monthly PITI</span>
                      <span className="font-semibold text-gray-900">
                        {fmtDollar((() => {
                          const loan = Number(application.propertyInfo?.loanAmount || 0);
                          const val = Number(application.propertyInfo?.propertyValue || 1);
                          const r = 0.065 / 12, n = 30 * 12;
                          const pi = loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
                          const tax = val * 0.0125 / 12, ins = val * 0.0035 / 12, pmi = loan / val > 0.8 ? loan * 0.005 / 12 : 0;
                          return pi + tax + ins + pmi;
                        })())}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Principal, interest, tax, insurance (6.5%, 30 yr).</p>
                  </div>
                </div>
              )}
            </div>
            </SplitViewContext.Provider>
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

              {/* Applicant info formatted as spreadsheet (matches Excel export) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <h4 className="font-bold text-gray-900 px-4 py-3 border-b border-gray-200 flex items-center gap-2 bg-gray-50">
                  <FileText className="w-5 h-5 text-green-600" />
                  Applicant info in spreadsheet format
                </h4>
                <p className="text-xs text-gray-500 px-4 pt-2 pb-1">
                  Same 60 columns as the Excel (Lead) download. Scroll horizontally to see all. Use the download below to open in Excel or import into ARIVE.
                </p>
                <div className="overflow-x-auto max-w-full">
                  <table className="text-sm border-collapse w-max min-w-full">
                    <colgroup>
                      {LEAD_HEADERS.map((_, i) => (
                        <col key={i} style={{ minWidth: 140 }} />
                      ))}
                    </colgroup>
                    <thead>
                      <tr className="bg-gray-100 text-left">
                        {LEAD_HEADERS.map((h, i) => (
                          <th key={i} className="p-2 border border-gray-200 font-semibold text-gray-700 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white">
                        {buildLeadRow(application as unknown as Record<string, any>, session?.user?.email ?? '').map((cell, i) => (
                          <td key={i} className="p-2 border border-gray-200 text-gray-900 whitespace-nowrap">{cell || '—'}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
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

              {/* Download XML / Excel for ARIVE import */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  Upload to ARIVE (no borrower re-entry)
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Download borrower and loan data to import into ARIVE or another platform. <strong>Excel</strong> has their info already formatted into the spreadsheet (same columns as the table above). XML: use <strong>+ Loan → Import 3.4 file</strong> in ARIVE.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={`/api/loan-application/export-arive-xml?id=${application._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700"
                  >
                    <Download className="w-5 h-5" />
                    Download XML for ARIVE (3.4)
                  </a>
                  <a
                    href={`/api/loan-application/export-lead-xlsx?id=${application._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800"
                  >
                    <Download className="w-5 h-5" />
                    Download Excel (applicant info in spreadsheet)
                  </a>
                </div>
              </div>

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
