'use client';

import { useState } from 'react';
import { FileText, X, Eye, Calendar, DollarSign, User } from 'lucide-react';

interface Application {
  _id: string;
  status: string;
  submissionDate?: string;
  borrowerInfo?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  propertyInfo?: {
    loanAmount: number;
    propertyType: string;
    loanPurpose: string;
  };
  employeeNotes?: string;
}

interface CustomerApplicationTrackerProps {
  applications: Application[];
}

export default function CustomerApplicationTracker({
  applications,
}: CustomerApplicationTrackerProps) {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTrack = (app: Application) => {
    setSelectedApp(app);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApp(null);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return '✅';
      case 'rejected':
        return '❌';
      case 'pending':
        return '⏳';
      default:
        return '📄';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Applications</h2>
        </div>
        <div className="p-6">
          {applications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No applications yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Your loan applications will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <FileText className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {app.propertyInfo?.loanPurpose
                          ? `${app.propertyInfo.loanPurpose
                              .split('_')
                              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                              .join(' ')} Loan`
                          : 'Loan Application'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {app.propertyInfo?.loanAmount
                          ? formatCurrency(app.propertyInfo.loanAmount)
                          : 'Amount pending'}{' '}
                        • Applied {formatDate(app.submissionDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleTrack(app);
                      }}
                      className="text-indigo-600 hover:text-indigo-700 active:text-indigo-800 font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all px-3 py-2 rounded-lg hover:bg-indigo-50 active:bg-indigo-100 touch-manipulation min-h-[44px] min-w-[80px] justify-center"
                    >
                      Track <span>→</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tracking Modal */}
      {isModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain">
          <div className="flex items-end sm:items-center justify-center min-h-screen px-0 sm:px-4 pt-0 pb-0 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 touch-none"
              onClick={handleCloseModal}
            ></div>

            {/* Modal panel - Full screen on mobile, centered on desktop */}
            <div className="inline-block align-bottom bg-white rounded-t-3xl sm:rounded-2xl text-left overflow-hidden shadow-xl transform transition-all w-full h-[95vh] sm:h-auto sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 sm:px-6 py-4 sm:py-6 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="bg-white/20 p-2 sm:p-3 rounded-lg flex-shrink-0">
                      <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-2xl font-bold text-white truncate">
                        Application Tracking
                      </h3>
                      <p className="text-indigo-100 text-xs sm:text-sm truncate">
                        ID: {selectedApp._id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCloseModal();
                    }}
                    className="text-white hover:bg-white/20 rounded-lg p-2.5 sm:p-2 transition-colors flex-shrink-0 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Close modal"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
                {/* Status Timeline */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6">
                  <h4 className="font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
                    Application Status
                  </h4>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Submitted</span>
                        <span className="text-xs sm:text-sm text-gray-500 ml-2">
                          {formatDate(selectedApp.submissionDate)}
                        </span>
                      </div>
                      <div className="h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Under Review</span>
                        <span className="text-xs sm:text-sm text-gray-500 ml-2">
                          {selectedApp.status === 'pending' ? 'In Progress' : 'Complete'}
                        </span>
                      </div>
                      <div
                        className={`h-2 rounded-full ${
                          selectedApp.status !== 'draft'
                            ? 'bg-yellow-500'
                            : 'bg-gray-300'
                        }`}
                      ></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Decision</span>
                        <span className="text-xs sm:text-sm text-gray-500 ml-2">
                          {selectedApp.status === 'approved'
                            ? 'Approved ✅'
                            : selectedApp.status === 'rejected'
                            ? 'Rejected ❌'
                            : 'Pending ⏳'}
                        </span>
                      </div>
                      <div
                        className={`h-2 rounded-full ${
                          selectedApp.status === 'approved'
                            ? 'bg-green-500'
                            : selectedApp.status === 'rejected'
                            ? 'bg-red-500'
                            : 'bg-gray-300'
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Application Details */}
                <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                    <h4 className="font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                      Loan Details
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Loan Amount</p>
                        <p className="font-semibold text-gray-900 text-lg">
                          {selectedApp.propertyInfo?.loanAmount
                            ? formatCurrency(selectedApp.propertyInfo.loanAmount)
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Loan Purpose</p>
                        <p className="font-semibold text-gray-900 capitalize">
                          {selectedApp.propertyInfo?.loanPurpose?.replace('_', ' ') || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Property Type</p>
                        <p className="font-semibold text-gray-900 capitalize">
                          {selectedApp.propertyInfo?.propertyType?.replace('_', ' ') || 'N/A'}
                        </p>
                      </div>
                      {selectedApp.propertyInfo?.propertyValue && (
                        <div>
                          <p className="text-sm text-gray-600">Property Value</p>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(selectedApp.propertyInfo.propertyValue)}
                          </p>
                        </div>
                      )}
                      {selectedApp.propertyInfo?.downPaymentAmount && (
                        <div>
                          <p className="text-sm text-gray-600">Down Payment</p>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(selectedApp.propertyInfo.downPaymentAmount)}
                            {selectedApp.propertyInfo.downPaymentPercentage && (
                              <span className="text-gray-600 ml-2">
                                ({selectedApp.propertyInfo.downPaymentPercentage.toFixed(1)}%)
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                    <h4 className="font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                      Applicant Info
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Full Name</p>
                        <p className="font-semibold text-gray-900">
                          {selectedApp.borrowerInfo?.firstName || 'N/A'}{' '}
                          {selectedApp.borrowerInfo?.lastName || ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold text-gray-900">
                          {selectedApp.borrowerInfo?.email || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Application Date</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(selectedApp.submissionDate || selectedApp.createdAt)}
                        </p>
                      </div>
                      {selectedApp.propertyInfo?.propertyAddress && (
                        <div>
                          <p className="text-sm text-gray-600">Property Address</p>
                          <p className="font-semibold text-gray-900">
                            {selectedApp.propertyInfo.propertyAddress}
                            {selectedApp.propertyInfo.propertyCity && `, ${selectedApp.propertyInfo.propertyCity}`}
                            {selectedApp.propertyInfo.propertyState && `, ${selectedApp.propertyInfo.propertyState}`}
                          </p>
                        </div>
                      )}
                      {selectedApp.reviewedAt && (
                        <div>
                          <p className="text-sm text-gray-600">Last Reviewed</p>
                          <p className="font-semibold text-gray-900">
                            {formatDate(selectedApp.reviewedAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Employee Notes (if any) */}
                {selectedApp.employeeNotes && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                    <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Reviewer Notes
                    </h4>
                    <p className="text-blue-800">{selectedApp.employeeNotes}</p>
                  </div>
                )}

                {/* Current Status Message */}
                <div
                  className={`rounded-xl p-6 ${
                    selectedApp.status === 'approved'
                      ? 'bg-green-50 border-2 border-green-200'
                      : selectedApp.status === 'rejected'
                      ? 'bg-red-50 border-2 border-red-200'
                      : 'bg-orange-50 border-2 border-orange-200'
                  }`}
                >
                  <h4
                    className={`font-bold mb-2 flex items-center gap-2 ${
                      selectedApp.status === 'approved'
                        ? 'text-green-900'
                        : selectedApp.status === 'rejected'
                        ? 'text-red-900'
                        : 'text-orange-900'
                    }`}
                  >
                    {getStatusIcon(selectedApp.status)} Current Status:{' '}
                    <span className="capitalize">{selectedApp.status}</span>
                  </h4>
                  <p
                    className={`text-sm ${
                      selectedApp.status === 'approved'
                        ? 'text-green-800'
                        : selectedApp.status === 'rejected'
                        ? 'text-red-800'
                        : 'text-orange-800'
                    }`}
                  >
                    {selectedApp.status === 'approved'
                      ? '🎉 Congratulations! Your loan application has been approved. Our team will contact you with next steps.'
                      : selectedApp.status === 'rejected'
                      ? 'Unfortunately, your application was not approved at this time. Please contact us for more details.'
                      : '⏳ Your application is currently under review. We typically complete reviews within 24-48 hours. You will receive an email update once a decision is made.'}
                  </p>
                </div>
              </div>

              {/* Footer - Fixed at bottom */}
              <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 flex-shrink-0 border-t border-gray-200">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-3 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors font-medium text-sm sm:text-base touch-manipulation min-h-[44px] sm:min-h-0"
                >
                  Close
                </button>
                {selectedApp.status === 'approved' && (
                  <button
                    onClick={() => {
                      // Show loan details or navigate to loan details page
                      alert(`Loan Details for Application ${selectedApp._id.slice(-8).toUpperCase()}\n\nLoan Amount: ${selectedApp.propertyInfo?.loanAmount ? formatCurrency(selectedApp.propertyInfo.loanAmount) : 'N/A'}\nStatus: Approved\n\nYour loan has been approved! Our team will contact you with next steps.`);
                    }}
                    className="px-6 py-3 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors font-medium text-sm sm:text-base touch-manipulation min-h-[44px] sm:min-h-0"
                  >
                    View Loan Details
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

