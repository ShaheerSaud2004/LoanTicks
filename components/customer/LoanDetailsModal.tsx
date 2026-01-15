'use client';

import { useState } from 'react';
import { X, DollarSign, Calendar, MapPin, FileText } from 'lucide-react';
import PaymentModal from './PaymentModal';

interface Loan {
  id: string;
  type: string;
  amount: string;
  outstanding: string;
  nextPayment: string;
  dueDate: string;
  status: string;
  propertyAddress: string;
  interestRate: string;
}

interface LoanDetailsModalProps {
  loan: Loan;
  isOpen: boolean;
  onClose: () => void;
}

export default function LoanDetailsModal({ loan, isOpen, onClose }: LoanDetailsModalProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain">
      <div className="flex items-end sm:items-center justify-center min-h-screen px-0 sm:px-4 pt-0 pb-0 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 touch-none"
          onClick={onClose}
        />

        {/* Modal panel - Full screen on mobile */}
        <div className="inline-block align-bottom bg-white rounded-t-3xl sm:rounded-2xl text-left overflow-hidden shadow-xl transform transition-all w-full h-[95vh] sm:h-auto sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 sm:px-6 py-4 sm:py-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="bg-white/20 p-2 sm:p-3 rounded-lg flex-shrink-0">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-2xl font-bold text-white truncate">Loan Details</h3>
                  <p className="text-indigo-100 text-xs sm:text-sm truncate">Mortgage ID: {loan.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                className="text-white hover:bg-white/20 active:bg-white/30 rounded-lg p-2.5 sm:p-2 transition-colors flex-shrink-0 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
            {/* Loan Type */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
              <h4 className="font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
                Loan Information
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Loan Type</p>
                  <p className="font-semibold text-gray-900 text-lg">{loan.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    {loan.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                <h4 className="font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                  Financial Details
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Original Loan Amount</p>
                    <p className="font-semibold text-gray-900 text-lg">{loan.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Balance</p>
                    <p className="font-semibold text-gray-900 text-lg">{loan.outstanding}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Interest Rate</p>
                    <p className="font-semibold text-yellow-600 text-lg">{loan.interestRate}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                <h4 className="font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                  Payment Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Next Payment Amount</p>
                    <p className="font-semibold text-gray-900 text-lg">{loan.nextPayment}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Due Date</p>
                    <p className="font-semibold text-gray-900">{loan.dueDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Information */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
              <h4 className="font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0" />
                Property Information
              </h4>
              <p className="font-semibold text-gray-900 text-sm sm:text-base break-words">{loan.propertyAddress}</p>
            </div>
          </div>

          {/* Footer - Fixed at bottom */}
          <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 flex-shrink-0 border-t border-gray-200">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="px-6 py-3 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors font-medium text-sm sm:text-base touch-manipulation min-h-[44px] sm:min-h-0"
            >
              Close
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowPaymentModal(true);
              }}
              className="px-6 py-3 sm:py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 active:from-yellow-700 active:to-yellow-800 transition-colors font-medium text-sm sm:text-base touch-manipulation min-h-[44px] sm:min-h-0 shadow-md"
            >
              Make Payment
            </button>
          </div>
        </div>
      </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        loanId={loan.id}
        amount={loan.nextPayment}
        dueDate={loan.dueDate}
        onConfirm={() => {
          // Payment confirmed, redirect handled in modal
        }}
      />
    </>
  );
}
