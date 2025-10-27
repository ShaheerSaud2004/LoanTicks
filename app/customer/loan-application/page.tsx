'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { LogOut, Loader2 } from 'lucide-react';
import { 
  FileText, 
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import URLA2019ComprehensiveForm from '@/components/URLA2019ComprehensiveForm';

export default function LoanApplicationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  const handleFormSubmit = async (formData: Record<string, unknown>) => {
    setSaving(true);
    try {
      console.log('Submitting loan application...', formData);
      
      // Auto-fill with random data if form is mostly empty
      const isEmptyForm = !formData.firstName || !formData.lastName || !formData.email;
      
      if (isEmptyForm) {
        const randomNames = ['John', 'Sarah', 'Michael', 'Jennifer', 'Robert', 'Emily', 'David', 'Jessica'];
        const randomLastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
        const randomCities = ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'San Jose'];
        const randomStates = ['CA', 'TX', 'FL', 'NY', 'IL'];
        
        const randomFirst = randomNames[Math.floor(Math.random() * randomNames.length)];
        const randomLast = randomLastNames[Math.floor(Math.random() * randomLastNames.length)];
        
        formData.firstName = formData.firstName || randomFirst;
        formData.lastName = formData.lastName || randomLast;
        formData.email = formData.email || `${randomFirst.toLowerCase()}.${randomLast.toLowerCase()}@example.com`;
        formData.cellPhone = formData.cellPhone || `(555) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;
        formData.ssn = formData.ssn || `${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 90 + 10)}-${Math.floor(Math.random() * 9000 + 1000)}`;
        formData.dateOfBirth = formData.dateOfBirth || '1985-06-15';
        formData.creditScore = formData.creditScore || Math.floor(Math.random() * (850 - 580) + 580);
        formData.currentStreet = formData.currentStreet || `${Math.floor(Math.random() * 9999 + 1)} Main Street`;
        formData.currentCity = formData.currentCity || randomCities[Math.floor(Math.random() * randomCities.length)];
        formData.currentState = formData.currentState || randomStates[Math.floor(Math.random() * randomStates.length)];
        formData.currentZipCode = formData.currentZipCode || `${Math.floor(Math.random() * 90000 + 10000)}`;
        formData.employerName = formData.employerName || 'Sample Corporation';
        formData.position = formData.position || 'Professional';
        formData.totalMonthlyIncome = formData.totalMonthlyIncome || Math.floor(Math.random() * 10000 + 5000);
        formData.propertyAddress = formData.propertyAddress || `${Math.floor(Math.random() * 9999 + 1)} Property Lane`;
        formData.propertyCity = formData.propertyCity || randomCities[Math.floor(Math.random() * randomCities.length)];
        formData.propertyState = formData.propertyState || randomStates[Math.floor(Math.random() * randomStates.length)];
        formData.propertyZipCode = formData.propertyZipCode || `${Math.floor(Math.random() * 90000 + 10000)}`;
        formData.propertyValue = formData.propertyValue || Math.floor(Math.random() * 500000 + 300000);
        formData.loanAmount = formData.loanAmount || Math.floor(Number(formData.propertyValue) * 0.8);
        formData.loanPurpose = formData.loanPurpose || 'purchase';
      }
      
      // Transform the comprehensive form data to match the API structure
      const applicationData = {
          status: 'submitted',
          borrowerInfo: {
          firstName: formData.firstName || 'Test',
            middleName: formData.middleName || '',
          lastName: formData.lastName || 'User',
          suffix: formData.suffix || '',
          email: formData.email || 'test@example.com',
          phone: formData.cellPhone || '(555) 000-0000',
            dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth as string) : new Date('1990-01-01'),
          ssn: formData.ssn || '000-00-0000',
            maritalStatus: formData.maritalStatus || 'unmarried',
            dependents: Number(formData.dependents) || 0,
          creditScore: Number(formData.creditScore) || 700,
          race: Array.isArray(formData.race) ? (formData.race as string[]).join(', ') : '',
          ethnicity: formData.ethnicity || '',
          sex: formData.sex || '',
          },
          currentAddress: {
          street: formData.currentStreet || '123 Main St',
          unit: formData.currentUnit || '',
          city: formData.currentCity || 'Los Angeles',
          state: formData.currentState || 'CA',
          zipCode: formData.currentZipCode || '90001',
          residencyType: formData.currentHousing || 'rent',
          monthlyPayment: Number(formData.currentMonthlyPayment) || 0,
          yearsAtAddress: Number(formData.yearsAtCurrentAddress) || 1,
          },
          employment: {
          employmentStatus: formData.selfEmployed ? 'self_employed' : 'employed',
            employerName: formData.employerName || 'Sample Employer',
            position: formData.position || 'Employee',
          yearsEmployed: Number(formData.yearsEmployed) || Number(formData.yearsInLineOfWork) || 2,
          monthlyIncome: Number(formData.totalMonthlyIncome) || 5000,
          employerPhone: formData.workPhone || '',
          },
          financialInfo: {
          grossMonthlyIncome: Number(formData.totalMonthlyIncome) || 5000,
          otherIncome: Number(formData.totalOtherIncome) || 0,
          otherIncomeSource: Array.isArray(formData.otherIncomeSources) 
            ? (formData.otherIncomeSources as Array<{source: string}>).map((item) => item.source).join(', ')
            : '',
          totalAssets: Number(formData.totalAssets) || 50000,
          totalLiabilities: Number(formData.totalMonthlyLiabilities) || 500,
            checkingAccountBalance: Number(formData.checkingAccountBalance) || 10000,
            savingsAccountBalance: Number(formData.savingsAccountBalance) || 40000,
          },
          propertyInfo: {
          propertyAddress: formData.propertyAddress || '456 Property St',
          propertyCity: formData.propertyCity || 'Los Angeles',
          propertyState: formData.propertyState || 'CA',
          propertyZipCode: formData.propertyZipCode || '90001',
          propertyType: 'single_family',
            propertyValue: Number(formData.propertyValue) || 500000,
            loanAmount: Number(formData.loanAmount) || 400000,
            loanPurpose: formData.loanPurpose || 'purchase',
          downPaymentAmount: Number(formData.propertyValue || 500000) - Number(formData.loanAmount || 400000),
          downPaymentPercentage: ((Number(formData.propertyValue || 500000) - Number(formData.loanAmount || 400000)) / Number(formData.propertyValue || 500000)) * 100,
          },
          assets: {
            bankAccounts: [],
          },
          liabilities: {
            creditCards: [],
            loans: [],
          },
          declarations: {
            outstandingJudgments: formData.outstandingJudgments || false,
          declaredBankruptcy: formData.bankruptcyWithin7Years || false,
          propertyForeclosed: formData.propertyForeclosed || false,
            lawsuitParty: formData.lawsuitParty || false,
            loanOnProperty: formData.loanOnProperty || false,
          coMakerOnNote: formData.cosignerOnAnotherLoan || false,
          usCitizen: formData.citizenship === 'us_citizen' || !formData.citizenship,
          permanentResident: formData.citizenship === 'permanent_resident',
          primaryResidence: formData.intendToOccupy !== false,
          intendToOccupy: formData.intendToOccupy !== false,
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

        // Automatically fetch rates for the application
        try {
          console.log('Fetching rates for application:', applicationId);
          const ratesResponse = await fetch('/api/get-rates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              applicationId,
              forceRefresh: true 
            }),
          });
          
          if (ratesResponse.ok) {
            const ratesData = await ratesResponse.json();
            console.log('Rates fetched successfully:', ratesData);
          } else {
            console.error('Failed to fetch rates');
          }
        } catch (ratesError) {
          console.error('Error fetching rates:', ratesError);
          // Don't fail the submission if rates fail - they can be fetched later
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-600 to-teal-500">
        {/* Logout Loading Overlay */}
        {isLoggingOut && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-slideIn">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Logging Out
                </h3>
                <p className="text-slate-600">
                  Securely ending your session...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Header */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and Navigation */}
              <div className="flex items-center gap-8">
                <button
                  onClick={() => router.push('/customer/dashboard')}
                  className="h-12 w-auto rounded-lg overflow-hidden bg-white border border-gray-200 hover:border-gray-300 transition cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo.jpg" alt="LOANATICKS" className="h-full w-full object-contain" />
                </button>
                
                {/* Navigation Menu */}
                <div className="hidden md:flex items-center gap-1">
                  <button
                    onClick={() => router.push('/customer/dashboard')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => router.push('/customer/loan-application')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition"
                  >
                    Apply for Loan
                  </button>
                </div>
              </div>

              {/* User Info and Logout */}
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-gray-900">
                    {session.user.name}
                  </div>
                  <div className="text-xs text-gray-500">{session.user.email}</div>
                </div>
                
                <span className="px-3 py-1 rounded-full text-xs font-semibold capitalize bg-green-100 text-green-800">
                  {session.user.role}
                </span>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Logging out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4" />
                      <span className="hidden sm:inline">Logout</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 sm:p-8 md:p-12 text-white text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                Home Mortgage Application
              </h1>
              <p className="text-base sm:text-lg text-white/90">
                Uniform Residential Loan Application (URLA)
              </p>
            </div>

            <div className="p-6 sm:p-8 md:p-12">
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Your Path to Homeownership Starts Here 🏡
                </h2>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4 sm:mb-6">
                  Complete this comprehensive mortgage application to secure financing for your dream home. 
                  The process is divided into 13 detailed steps and typically takes 30-45 minutes to complete.
                </p>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  What you&apos;ll need for your mortgage:
                </h3>
                <ul className="space-y-2 text-blue-800 text-xs sm:text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1 flex-shrink-0">•</span>
                    <span>Personal identification and contact information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1 flex-shrink-0">•</span>
                    <span>Current and previous employment details with income verification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1 flex-shrink-0">•</span>
                    <span>Financial information (bank accounts, assets, monthly obligations)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1 flex-shrink-0">•</span>
                    <span>Property details and desired loan amount</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1 flex-shrink-0">•</span>
                    <span>Financial declarations and credit history</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1 flex-shrink-0">•</span>
                    <span>Supporting documents (W-2s, pay stubs, bank statements)</span>
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">13</div>
                  <div className="text-xs sm:text-sm text-gray-600">Steps</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">30-45</div>
                  <div className="text-xs sm:text-sm text-gray-600">Minutes</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">100%</div>
                  <div className="text-xs sm:text-sm text-gray-600">Complete</div>
                </div>
              </div>

              <button
                onClick={() => setShowWelcome(false)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                Start Mortgage Application
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                onClick={() => router.push('/customer/dashboard')}
                className="w-full mt-3 sm:mt-4 text-gray-600 hover:text-gray-900 font-medium py-2 transition-colors text-sm sm:text-base"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center gap-8">
              <button
                onClick={() => router.push('/customer/dashboard')}
                className="h-12 w-auto rounded-lg overflow-hidden bg-white border border-gray-200 hover:border-gray-300 transition cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.jpg" alt="LOANATICKS" className="h-full w-full object-contain" />
              </button>
              
              {/* Navigation Menu */}
              <div className="hidden md:flex items-center gap-1">
                <button
                  onClick={() => router.push('/customer/dashboard')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => router.push('/customer/loan-application')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition"
                >
                  Apply for Loan
                </button>
              </div>
            </div>

            {/* User Info and Logout */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-900">
                  {session.user.name}
                </div>
                <div className="text-xs text-gray-500">{session.user.email}</div>
              </div>
              
              <span className="px-3 py-1 rounded-full text-xs font-semibold capitalize bg-green-100 text-green-800">
                {session.user.role}
              </span>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Logging out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <URLA2019ComprehensiveForm onSubmit={handleFormSubmit} saving={saving} />
    </div>
  );
}

