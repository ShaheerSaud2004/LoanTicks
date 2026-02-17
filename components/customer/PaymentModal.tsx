'use client';

import { useState } from 'react';
import { X, ExternalLink, DollarSign, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  loanId: string;
  amount: string;
  dueDate: string;
  onConfirm: () => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  loanId,
  amount,
  dueDate,
  onConfirm,
}: PaymentModalProps) {
  const [redirecting, setRedirecting] = useState(false);
  if (!isOpen) return null;

  const ariveUrl = process.env.NEXT_PUBLIC_ARIVE_POS_URL || 'https://app.arive.com';

  const handleConfirm = () => {
    onConfirm();
    setRedirecting(true);
    // Open Arive in a new tab
    window.open(ariveUrl, '_blank', 'noopener,noreferrer');
    // Brief success message then close
    setTimeout(() => {
      setRedirecting(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-scaleIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Make Payment</h3>
                  <p className="text-yellow-100 text-sm">Mortgage ID: {loanId}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Amount Due</p>
                  <p className="text-2xl font-bold text-gray-900">{amount}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Due Date</p>
                  <p className="text-lg font-semibold text-gray-900">{dueDate}</p>
                </div>
              </div>
            </div>

            {redirecting ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 mb-1">Redirecting...</p>
                  <p className="text-sm text-green-800">
                    Opening the payment portal in a new tab. Complete your payment there.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    Payment Processing
                  </p>
                  <p className="text-sm text-blue-800">
                    You will be redirected to <strong>Arive</strong> to complete your payment securely.
                  </p>
                </div>
              </div>
            </div>
          )}

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>What happens next?</strong>
              </p>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>You'll be redirected to the Arive payment portal</li>
                <li>Complete your payment securely through Arive</li>
                <li>Your payment will be processed immediately</li>
                <li>You'll receive a confirmation email</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex flex-col sm:flex-row gap-3 border-t border-gray-200">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium touch-manipulation min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleConfirm();
              }}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition shadow-md font-medium touch-manipulation min-h-[44px] flex items-center justify-center gap-2"
            >
              <span>Go to Arive</span>
              <ExternalLink className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
