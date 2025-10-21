'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import ComprehensiveLoanForm from '@/components/ComprehensiveLoanForm';

export default function LoanApplicationPage() {
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleFormSubmit = async (formData: Record<string, unknown>) => {
    setSaving(true);
    try {
      // Transform the comprehensive form data to match the API structure
      const applicationData = {
          status: 'submitted',
          borrowerInfo: {
          firstName: formData.firstName,
            middleName: formData.middleName,
          lastName: formData.lastName,
          suffix: formData.suffix,
          email: formData.email,
          phone: formData.cellPhone,
            dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth as string) : new Date('1990-01-01'),
          ssn: formData.ssn,
            maritalStatus: formData.maritalStatus,
            dependents: Number(formData.dependents),
          race: (formData.race as string[]).join(', '),
          ethnicity: formData.ethnicity,
          sex: formData.sex,
          },
          currentAddress: {
          street: formData.currentStreet,
          unit: formData.currentUnit,
          city: formData.currentCity,
          state: formData.currentState,
          zipCode: formData.currentZipCode,
          residencyType: formData.currentHousing,
          monthlyPayment: Number(formData.currentMonthlyPayment) || 0,
          yearsAtAddress: Number(formData.yearsAtCurrentAddress) || 1,
          },
          employment: {
          employmentStatus: formData.selfEmployed ? 'self_employed' : 'employed',
            employerName: formData.employerName,
            position: formData.position,
          yearsEmployed: Number(formData.yearsInLineOfWork) || 0,
          monthlyIncome: Number(formData.totalMonthlyIncome) || 1000,
          employerPhone: formData.workPhone,
          },
          financialInfo: {
          grossMonthlyIncome: Number(formData.totalMonthlyIncome) || 1000,
          otherIncome: Number(formData.totalOtherIncome) || 0,
          otherIncomeSource: (formData.otherIncomeSources as Array<{source: string}>).map((item) => item.source).join(', '),
          totalAssets: Number(formData.totalAssets) || 0,
          totalLiabilities: Number(formData.totalMonthlyLiabilities) || 0,
            checkingAccountBalance: Number(formData.checkingAccountBalance) || 0,
            savingsAccountBalance: Number(formData.savingsAccountBalance) || 0,
          },
          propertyInfo: {
          propertyAddress: formData.propertyAddress,
          propertyCity: formData.propertyCity,
          propertyState: formData.propertyState,
          propertyZipCode: formData.propertyZipCode,
          propertyType: 'single_family',
            propertyValue: Number(formData.propertyValue) || 100000,
            loanAmount: Number(formData.loanAmount) || 50000,
            loanPurpose: formData.loanPurpose,
          downPaymentAmount: Number(formData.propertyValue) - Number(formData.loanAmount),
          downPaymentPercentage: ((Number(formData.propertyValue) - Number(formData.loanAmount)) / Number(formData.propertyValue)) * 100,
          },
          assets: {
            bankAccounts: [],
          },
          liabilities: {
            creditCards: [],
            loans: [],
          },
          declarations: {
            outstandingJudgments: formData.outstandingJudgments,
          declaredBankruptcy: formData.bankruptcyWithin7Years,
          propertyForeclosed: formData.foreclosureWithin7Years,
            lawsuitParty: formData.lawsuitParty,
            loanOnProperty: false,
          coMakerOnNote: formData.cosignerOnAnotherLoan,
          usCitizen: formData.citizenship === 'us_citizen',
          permanentResident: formData.citizenship === 'permanent_resident',
          primaryResidence: formData.willOccupyAsPrimary,
          intendToOccupy: formData.willOccupyAsPrimary,
          },
          submittedAt: new Date(),
      };

      const response = await fetch('/api/loan-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData),
      });

      if (response.ok) {
        const data = await response.json();
        const applicationId = data.applicationId;

        // Upload documents if any
        if ((formData.uploadedDocuments as File[]).length > 0) {
          const uploadFormData = new FormData();
          uploadFormData.append('applicationId', applicationId);
          
                  (formData.uploadedDocuments as File[]).forEach((file: File) => {
            uploadFormData.append('files', file);
          });

          try {
            await fetch('/api/upload-documents', {
              method: 'POST',
              body: uploadFormData,
            });
          } catch (uploadError) {
            console.error('Error uploading documents:', uploadError);
          }
        }

        // Show success message
        const successMessage = `
🎉 Application Submitted Successfully!

Your comprehensive home loan application has been received and is now under review.

Application ID: ${applicationId?.slice(-8) || 'Pending'}
Submitted: ${new Date().toLocaleDateString()}

What's Next?
• Our team will review your application within 24-48 hours
• You'll receive an email update at ${formData.email || 'your email'}
• Check your dashboard for application status

You can now return to your dashboard to track progress.
        `;
        alert(successMessage);
        router.push('/customer/dashboard');
      } else {
        alert('❌ Failed to submit application. Please try again or contact support.');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application');
    } finally {
      setSaving(false);
    }
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-600 to-teal-500 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 sm:p-12 text-white text-center">
              <div className="w-20 h-20 bg-white rounded-full mx-auto mb-6 flex items-center justify-center">
                <FileText className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                Comprehensive Home Loan Application
              </h1>
              <p className="text-lg text-white/90">
                Uniform Residential Loan Application (URLA)
              </p>
            </div>

            <div className="p-8 sm:p-12">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Welcome to Your Comprehensive Loan Application
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  This comprehensive Uniform Residential Loan Application (URLA) captures all required information for home loan processing. 
                  The process is divided into 13 detailed steps and should take approximately 30-45 minutes to complete.
                </p>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  What you&apos;ll need:
                </h3>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Complete personal information and identification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Address history and contact information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Employment and income details (current, previous, additional)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Complete financial information (assets, liabilities, real estate)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Property and loan details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Supporting documents and declarations</span>
                  </li>
                </ul>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl font-bold text-green-600 mb-1">13</div>
                  <div className="text-sm text-gray-600">Comprehensive Steps</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl font-bold text-green-600 mb-1">30-45</div>
                  <div className="text-sm text-gray-600">Minutes</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl font-bold text-green-600 mb-1">100%</div>
                  <div className="text-sm text-gray-600">Complete URLA</div>
                </div>
              </div>

              <button
                onClick={() => setShowWelcome(false)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                Start Comprehensive Application
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => router.push('/customer/dashboard')}
                className="w-full mt-4 text-gray-600 hover:text-gray-900 font-medium py-2 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <ComprehensiveLoanForm onSubmit={handleFormSubmit} saving={saving} />;
}

