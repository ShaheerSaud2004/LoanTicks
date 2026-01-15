'use client';

import { useState } from 'react';
import LoanDetailsModal from './LoanDetailsModal';
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

interface LoanCardProps {
  loan: Loan;
}

export default function LoanCard({ loan }: LoanCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <>
      <div className="border border-gray-200 rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-base md:text-lg font-bold text-gray-900">
                {loan.type}
              </h3>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                Active
              </span>
            </div>
            <p className="text-xs md:text-sm text-gray-500">Mortgage ID: {loan.id}</p>
            <p className="text-xs md:text-sm text-gray-600 mt-1">📍 {loan.propertyAddress}</p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDetails(true);
            }}
            className="text-yellow-600 hover:text-yellow-700 active:text-yellow-800 font-medium text-sm self-start sm:self-auto transition-colors cursor-pointer px-3 py-2 rounded-lg hover:bg-yellow-50 active:bg-yellow-100 touch-manipulation min-h-[44px] min-w-[120px] flex items-center justify-center"
          >
            View Details →
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Loan Amount</p>
            <p className="text-sm md:text-lg font-bold text-gray-900">{loan.amount}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Balance</p>
            <p className="text-sm md:text-lg font-bold text-gray-900">
              {loan.outstanding}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Interest Rate</p>
            <p className="text-sm md:text-lg font-bold text-yellow-600">
              {loan.interestRate}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Next Payment</p>
            <p className="text-sm md:text-lg font-bold text-orange-600">
              {loan.nextPayment}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Due Date</p>
            <p className="text-xs md:text-sm font-semibold text-gray-900">
              {loan.dueDate}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowPaymentModal(true);
            }}
            className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 active:from-yellow-700 active:to-yellow-800 transition-colors font-medium text-sm sm:text-base cursor-pointer touch-manipulation min-h-[44px] flex items-center justify-center shadow-md"
          >
            Make Payment
          </button>
        </div>
      </div>

      <LoanDetailsModal
        loan={loan}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />

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
