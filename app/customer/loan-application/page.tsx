'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { LogOut, Loader2, Mail, CheckCircle2, Home, ArrowRight, Info, X, Sparkles, FileText, CheckCircle } from 'lucide-react';
import URLA2019ComprehensiveForm from '@/components/forms/URLA2019ComprehensiveForm';
import TooltipFixer from '@/components/forms/TooltipFixer';
import Footer from '@/components/layout/Footer';
import ChatbotWidget from '@/components/chatbot/ChatbotWidget';

export default function LoanApplicationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(true);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutStage, setLogoutStage] = useState<'signing-out' | 'clearing' | 'success' | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [documentsUploadedCount, setDocumentsUploadedCount] = useState(0);
  const [successData, setSuccessData] = useState<{
    applicationId: string;
    purchasePrice: number;
    appraisedValue: number;
    loanAmount: number;
    downPayment: number;
    downPaymentPercent: number;
    ltv: number;
    email: string;
    propertyAddress: string;
    propertyCity: string;
    propertyState: string;
    propertyZipCode: string;
  } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Check if user has seen the intro modal before
  useEffect(() => {
    if (status === 'authenticated' && session) {
      const hasSeenIntro = localStorage.getItem('loan-app-intro-seen');
      if (!hasSeenIntro) {
        setShowIntroModal(true);
      }
    }
  }, [status, session]);

  const handleCloseIntroModal = () => {
    setShowIntroModal(false);
    localStorage.setItem('loan-app-intro-seen', 'true');
  };

  const handleLogout = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (isLoggingOut) return; // Prevent double-clicks
    
    try {
    setIsLoggingOut(true);
      setLogoutStage('signing-out');
      
      // Stage 1: Signing out (1.5 seconds)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Sign out from NextAuth
      await signOut({ 
        redirect: false,
        callbackUrl: '/login'
      });
      
      // Stage 2: Clearing session (1 second)
      setLogoutStage('clearing');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Stage 3: Success (1 second)
      setLogoutStage('success');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Final redirect
      router.push('/login');
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, show animation and redirect
      setLogoutStage('success');
      setTimeout(() => {
    router.push('/login');
        setTimeout(() => {
          window.location.href = '/login';
        }, 500);
      }, 1000);
    }
  };

  const handleFormSubmit = async (formData: Record<string, unknown>) => {
    setSaving(true);
    setDocumentsUploadedCount(0);
    try {
      const documents = formData.uploadedDocuments as File[];
      console.log('Submitting loan application...', {
        ...formData,
        documentCount: documents ? documents.length : 0,
        documentNames: documents ? documents.map((f: File) => f.name) : []
      });
      
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
      
      // Transform the comprehensive form data to match the API structure – store all fields for employees/admins
      const applicationData = {
          status: 'submitted',
          borrowerInfo: {
          firstName: formData.firstName || 'Test',
            middleName: formData.middleName || '',
          lastName: formData.lastName || 'User',
          suffix: formData.suffix || '',
          email: formData.email || 'test@example.com',
          phone: String(formData.cellPhone || formData.homePhone || '').trim() || '(555) 000-0000',
          workPhone: formData.workPhone ? String(formData.workPhone).trim() : undefined,
          cellPhone: formData.cellPhone ? String(formData.cellPhone).trim() : undefined,
          alternatePhone: formData.alternatePhone ? String(formData.alternatePhone).trim() : undefined,
          creditPullConsent: !!formData.creditPullConsent,
            dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth as string) : new Date('1990-01-01'),
          ssn: formData.ssn || '000-00-0000',
            maritalStatus: formData.maritalStatus || 'unmarried',
            dependents: Number(formData.dependents) || 0,
          dependentAges: formData.dependentAges ? String(formData.dependentAges).trim() : undefined,
          citizenshipType: (formData.citizenship === 'permanent_resident' ? 'permanent_resident' : formData.citizenship === 'non_permanent_resident' ? 'non_permanent_resident' : 'us_citizen') as 'us_citizen' | 'permanent_resident' | 'non_permanent_resident',
          creditScore: Number(formData.creditScore) || undefined,
          race: Array.isArray(formData.race) ? (formData.race as string[]).join(', ') : (formData.race ? String(formData.race) : ''),
          ethnicity: formData.ethnicity ? String(formData.ethnicity) : '',
          sex: formData.sex ? String(formData.sex) : '',
          preferredContactMethod: formData.preferredContactMethod || 'phone',
          },
          currentAddress: {
          street: formData.currentStreet || '123 Main St',
          unit: formData.currentUnit ? String(formData.currentUnit).trim() : '',
          city: formData.currentCity || 'Los Angeles',
          state: formData.currentState || 'CA',
          zipCode: formData.currentZipCode || '90001',
          residencyType: formData.currentHousing || 'own',
          monthlyPayment: Number(formData.currentMonthlyPayment) || 0,
          yearsAtAddress: Number(formData.yearsAtCurrentAddress) || 1,
          monthsAtAddress: formData.monthsAtCurrentAddress ? Number(formData.monthsAtCurrentAddress) : undefined,
          },
          mailingAddress: (formData.mailingStreet || formData.mailingCity) ? {
            street: String(formData.mailingStreet || '').trim(),
            unit: formData.mailingUnit ? String(formData.mailingUnit).trim() : undefined,
            city: String(formData.mailingCity || '').trim(),
            state: String(formData.mailingState || '').trim(),
            zipCode: String(formData.mailingZipCode || '').trim(),
          } : undefined,
          formerAddresses: formData.hasPriorAddress && formData.priorStreet ? [{
            street: String(formData.priorStreet).trim(),
            unit: formData.priorUnit ? String(formData.priorUnit).trim() : undefined,
            city: String(formData.priorCity || '').trim(),
            state: String(formData.priorState || '').trim(),
            zipCode: String(formData.priorZipCode || '').trim(),
            residencyType: formData.priorHousing || 'rent',
            monthlyPayment: formData.priorMonthlyPayment ? Number(formData.priorMonthlyPayment) : undefined,
            yearsAtAddress: Number(formData.yearsAtPriorAddress) || 0,
            monthsAtAddress: formData.monthsAtPriorAddress ? Number(formData.monthsAtPriorAddress) : undefined,
          }] : undefined,
          employment: {
          employmentStatus: (formData.employmentStatus || 'employed') as 'employed' | 'self_employed' | 'retired' | 'other',
            employerName: formData.employerName || 'Sample Employer',
            phone: formData.workPhone ? String(formData.workPhone).trim() : undefined,
            street: formData.workAddress ? String(formData.workAddress).trim() : undefined,
            city: formData.workCity ? String(formData.workCity).trim() : undefined,
            state: formData.workState ? String(formData.workState).trim() : undefined,
            zipCode: formData.workZipCode ? String(formData.workZipCode).trim() : undefined,
            position: formData.position || 'Employee',
            startDate: formData.employmentStartDate ? new Date(formData.employmentStartDate as string) : undefined,
          yearsInLineOfWork: Number(formData.yearsEmployed ?? formData.yearsInLineOfWork) || undefined,
          monthsInLineOfWork: formData.monthsEmployed ? Number(formData.monthsEmployed) : undefined,
          monthlyIncome: Number(formData.monthlyIncome || formData.totalMonthlyIncome) || 5000,
          baseIncome: formData.baseIncome ? Number(formData.baseIncome) : undefined,
          overtime: formData.overtimeIncome ? Number(formData.overtimeIncome) : undefined,
          bonus: formData.bonusIncome ? Number(formData.bonusIncome) : undefined,
          commission: formData.commissionIncome ? Number(formData.commissionIncome) : undefined,
          otherIncome: formData.otherIncomeAmount ? Number(formData.otherIncomeAmount) : undefined,
          },
          additionalEmployment: formData.hasPreviousEmployment && formData.previousEmployerName ? [{
            employerName: String(formData.previousEmployerName).trim(),
            position: formData.previousPosition ? String(formData.previousPosition).trim() : undefined,
            startDate: formData.previousEmploymentStartDate ? new Date(formData.previousEmploymentStartDate as string) : undefined,
            endDate: formData.previousEmploymentEndDate ? new Date(formData.previousEmploymentEndDate as string) : undefined,
            monthlyIncome: Number(formData.previousMonthlyIncome) || 0,
          }] : undefined,
          financialInfo: {
          grossMonthlyIncome: Number(formData.grossMonthlyIncome || formData.totalMonthlyIncome) || 5000,
          otherIncome: Number(formData.otherIncomeAmount || formData.otherIncome) || 0,
          otherIncomeSource: typeof formData.otherIncomeSource === 'string' ? formData.otherIncomeSource : (Array.isArray(formData.otherIncomeSources) 
            ? (formData.otherIncomeSources as Array<{source?: string}>).map((item) => item?.source ?? '').filter(Boolean).join(', ')
            : ''),
          totalAssets: Number(formData.totalAssets) || 50000,
          totalLiabilities: Number(formData.totalMonthlyLiabilities || formData.totalLiabilities) || 500,
            checkingAccountBalance: Number(formData.checkingAccountBalance) || 0,
            savingsAccountBalance: Number(formData.savingsAccountBalance) || 0,
          },
          assets: {
            bankAccounts: [
              ...(Number(formData.checkingAccountBalance) > 0 ? [{ accountType: 'Checking', financialInstitution: '', cashOrMarketValue: Number(formData.checkingAccountBalance) }] : []),
              ...(Number(formData.savingsAccountBalance) > 0 ? [{ accountType: 'Savings', financialInstitution: '', cashOrMarketValue: Number(formData.savingsAccountBalance) }] : []),
              ...(Number(formData.moneyMarketBalance) > 0 ? [{ accountType: 'Money Market', financialInstitution: '', cashOrMarketValue: Number(formData.moneyMarketBalance) }] : []),
              ...(Number(formData.cdsBalance) > 0 ? [{ accountType: 'CDs', financialInstitution: '', cashOrMarketValue: Number(formData.cdsBalance) }] : []),
            ].filter(Boolean),
          },
          liabilities: {
            items: Array.isArray(formData.creditAccounts) && formData.creditAccounts.length > 0
              ? (formData.creditAccounts as Array<{ creditorName?: string; liabilityType?: string; monthlyPayment?: number; unpaidBalance?: number }>).map((item) => ({
                  liabilityType: item.liabilityType || 'Other',
                  creditorName: item.creditorName || '',
                  monthlyPayment: Number(item.monthlyPayment) || 0,
                  unpaidBalance: Number(item.unpaidBalance) || 0,
                }))
              : [],
          },
          propertyInfo: {
          propertyAddress: formData.propertyAddress || '456 Property St',
          unit: formData.propertyUnit ? String(formData.propertyUnit).trim() : undefined,
          propertyCity: formData.propertyCity || 'Los Angeles',
          propertyState: formData.propertyState || 'CA',
          propertyZipCode: formData.propertyZipCode || '90001',
          propertyType: (formData.propertyType || 'single_family') as 'single_family' | 'condo' | 'townhouse' | 'multi_family' | 'cooperative' | 'manufactured' | 'other',
          numberOfUnits: Number(formData.numberOfUnits) || 1,
          occupancyType: (formData.propertyUse || 'primary_residence') as 'primary_residence' | 'second_home' | 'investment_property',
            propertyValue: Number(formData.purchasePrice || formData.propertyValue) || 500000,
            purchasePrice: Number(formData.purchasePrice || formData.propertyValue) || 500000,
            appraisedValue: Number(formData.appraisedValue || formData.purchasePrice || formData.propertyValue) || 500000,
            loanAmount: Number(formData.loanAmount) || 400000,
            loanPurpose: (formData.loanPurpose || 'purchase') as 'purchase' | 'refinance' | 'other',
          refinancePurpose: formData.refinancePurpose ? String(formData.refinancePurpose).trim() : undefined,
          downPaymentAmount: Number(formData.downPaymentAmount || (Number(formData.purchasePrice || formData.propertyValue || 500000) - Number(formData.loanAmount || 400000))),
          downPaymentPercentage: Number(formData.downPaymentPercentage) || ((Number(formData.purchasePrice || formData.propertyValue || 500000) - Number(formData.loanAmount || 400000)) / Number(formData.purchasePrice || formData.propertyValue || 500000)) * 100,
          },
          declarations: {
            willOccupyAsProperty: formData.intendToOccupy !== false,
            ownershipInterestInLast3Years: !!formData.ownershipInterestInLast3Years,
            ownershipInterestPropertyType: formData.ownershipInterestPropertyType || undefined,
            ownershipInterestHowHeld: formData.ownershipInterestHowHeld || undefined,
            familyRelationshipWithSeller: !!formData.familyRelationshipWithSeller,
            borrowingDownPayment: !!formData.borrowingDownPayment,
            borrowingDownPaymentAmount: formData.borrowingDownPaymentAmount ? Number(formData.borrowingDownPaymentAmount) : undefined,
            applyingForNewCredit: !!formData.applyingForMortgageOtherProperty,
            applyingForOtherNewCredit: !!formData.applyingForOtherNewCredit,
            propertySubjectToLien: !!formData.propertySubjectToLien,
            cosignerOrGuarantor: !!formData.cosignerOrGuarantor,
            outstandingJudgments: !!formData.outstandingJudgments,
            federalDebtDelinquent: !!formData.federalDebtDelinquent,
            lawsuitParty: !!formData.lawsuitParty,
            conveyedTitleInLieu: !!formData.conveyedTitleInLieu,
            completedPreForeclosureSale: !!formData.completedPreForeclosureSale,
            propertyForeclosed: !!formData.propertyForeclosed,
            declaredBankruptcy: !!formData.declaredBankruptcy,
            bankruptcyChapter: [formData.bankruptcyChapter7 && '7', formData.bankruptcyChapter11 && '11', formData.bankruptcyChapter12 && '12', formData.bankruptcyChapter13 && '13'].filter(Boolean).join(', ') || undefined,
            loanOnProperty: !!formData.loanOnProperty,
            coMakerOnNote: !!formData.coMakerOnNote,
            usCitizen: formData.citizenship === 'us_citizen' || !formData.citizenship,
            permanentResident: formData.citizenship === 'permanent_resident',
            primaryResidence: formData.intendToOccupy !== false,
            intendToOccupy: formData.intendToOccupy !== false,
          },
          creditCardAuthorization: formData.authorizationAgreed ? {
            authBorrower1Name: formData.authBorrower1Name || undefined,
            authBorrower1SSN: formData.authBorrower1SSN || undefined,
            authBorrower1DOB: formData.authBorrower1DOB || undefined,
            authBorrower2Name: formData.authBorrower2Name || undefined,
            authBorrower2SSN: formData.authBorrower2SSN || undefined,
            authBorrower2DOB: formData.authBorrower2DOB || undefined,
            cardType: formData.cardType || undefined,
            cardLast4: formData.cardLast4 || undefined,
            cardExpiration: formData.cardExpiration || undefined,
            nameOnCard: formData.nameOnCard || undefined,
            cardBillingAddress: formData.cardBillingAddress || undefined,
            amountVerified: formData.amountVerified || undefined,
            authorizationAgreed: true,
            authSignature1: formData.authSignature1 || undefined,
            authDate1: formData.authDate1 || undefined,
            authSignature2: formData.authSignature2 || undefined,
            authDate2: formData.authDate2 || undefined,
          } : undefined,
          statusHistory: [
            { status: 'submitted', changedBy: session?.user?.id ?? 'customer', changedAt: new Date(), notes: 'Application submitted' },
          ],
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
        const documents = formData.uploadedDocuments as File[];
        if (documents && documents.length > 0) {
          console.log(`Uploading ${documents.length} document(s)...`);
          const uploadFormData = new FormData();
          uploadFormData.append('applicationId', applicationId);
          
          documents.forEach((file: File, index: number) => {
            console.log(`Adding file ${index + 1}: ${file.name} (${(file.size / 1024).toFixed(2)} KB, ${file.type})`);
            uploadFormData.append('files', file);
          });

          try {
            const uploadResponse = await fetch('/api/upload-documents', {
              method: 'POST',
              body: uploadFormData,
            });

            if (uploadResponse.ok) {
              const uploadData = await uploadResponse.json();
              setDocumentsUploadedCount(uploadData.totalDocuments ?? documents.length);
              console.log('✅ Documents uploaded successfully:', uploadData);
            } else {
              const errorData = await uploadResponse.json();
              console.error('❌ Document upload failed:', errorData);
              // Don't show alert for upload failures - application was already submitted
              // The user can upload documents later if needed
            }
          } catch (uploadError) {
            console.error('❌ Error uploading documents:', uploadError);
            // Don't show alert - application was submitted successfully
            // Documents can be uploaded separately if needed
          }
        } else {
          console.log('No documents to upload');
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

        // Show success screen with detailed information
        const purchasePrice = Number(formData.purchasePrice || formData.propertyValue) || 0;
        const appraisedValue = Number(formData.appraisedValue) || 0;
        const loanAmount = Number(formData.loanAmount) || 0;
        const downPayment = purchasePrice - loanAmount;
        const downPaymentPercent = purchasePrice > 0 ? (downPayment / purchasePrice) * 100 : 0;
        const ltv = purchasePrice > 0 ? (loanAmount / purchasePrice) * 100 : 0;

        setSuccessData({
          applicationId: applicationId || '',
          purchasePrice,
          appraisedValue,
          loanAmount,
          downPayment,
          downPaymentPercent,
          ltv,
          email: (formData.email as string) || '',
          propertyAddress: (formData.propertyAddress as string) || '',
          propertyCity: (formData.propertyCity as string) || '',
          propertyState: (formData.propertyState as string) || '',
          propertyZipCode: (formData.propertyZipCode as string) || '',
        });
        setShowSuccess(true);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to submit application:', errorData);
        const msg = errorData.error || 'Please try again or contact support.';
        alert(`We couldn't save your application.\n\n${msg}\n\nCheck that all required fields are filled and try again, or call us at 713-782-1309.`);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      alert(`We couldn't submit your application.\n\n${errorMessage}\n\nPlease check your connection and try again, or call us at 713-782-1309.`);
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Enhanced Logout Animation */}
        {isLoggingOut && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fadeIn"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 md:p-12 border-2 border-gray-200 max-w-md w-full mx-4 animate-scaleIn">
              <div className="flex flex-col items-center gap-4">
                {logoutStage === 'signing-out' && (
                  <>
                    <div className="relative">
                      <Loader2 className="h-12 w-12 md:h-16 md:w-16 text-slate-600 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-8 w-8 md:h-10 md:w-10 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Signing out...</h3>
                      <p className="text-sm md:text-base text-gray-600">Please wait while we securely log you out</p>
                    </div>
                  </>
                )}
                
                {logoutStage === 'clearing' && (
                  <>
                    <div className="relative">
                      <Loader2 className="h-12 w-12 md:h-16 md:w-16 text-slate-400 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-8 w-8 md:h-10 md:w-10 border-4 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Clearing session...</h3>
                      <p className="text-sm md:text-base text-gray-600">Removing your session data</p>
                    </div>
                  </>
                )}
                
                {logoutStage === 'success' && (
                  <>
                    <div className="relative">
                      <div className="h-16 w-16 md:h-20 md:w-20 bg-green-100 rounded-full flex items-center justify-center animate-scaleIn">
                        <CheckCircle2 className="h-10 w-10 md:h-12 md:w-12 text-green-600 animate-checkmark" />
                      </div>
                    </div>
              <div className="text-center">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Logged out successfully!</h3>
                      <p className="text-sm md:text-base text-gray-600">Redirecting to login page...</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Introduction Modal - Why You're Filling This Out */}
        {showIntroModal && (
          <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden animate-scaleIn relative">
              {/* Close Button */}
              <button
                onClick={handleCloseIntroModal}
                className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header with Gradient */}
              <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 p-8 md:p-10 text-center relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
                  <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                </div>
                
                <div className="relative z-10">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-slate-600" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                    Welcome to Your Mortgage Application
                  </h2>
                  <p className="text-lg md:text-xl text-white/90">
                    Let's get you started on your path to homeownership
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                {/* Why Section */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-slate-600 p-3 rounded-lg flex-shrink-0">
                      <Info className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        Why You're Filling This Out
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        This comprehensive mortgage application is the first step toward securing financing for your dream home. 
                        By providing detailed information about your financial situation, employment history, and the property you're interested in, 
                        we can:
                      </p>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                          <span><strong>Assess Your Eligibility:</strong> Determine the loan amount you qualify for based on your income, credit, and financial profile</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                          <span><strong>Get Competitive Rates:</strong> Match you with the best mortgage rates available for your situation</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                          <span><strong>Streamline the Process:</strong> Pre-approve your application so you can shop for homes with confidence</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                          <span><strong>Ensure Compliance:</strong> Meet all regulatory requirements for mortgage lending (URLA 2019 standard)</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* What Happens Next */}
                <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 text-slate-600" />
                    What Happens After You Submit
                </h3>
                  <ul className="space-y-2 text-slate-800 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-slate-600 mt-1">•</span>
                      <span>Our team reviews your application within <strong>24-48 hours</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-slate-600 mt-1">•</span>
                      <span>You'll receive email updates and may be contacted for additional documentation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-slate-600 mt-1">•</span>
                      <span>Once approved, you'll receive a pre-approval letter to use when making offers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-slate-600 mt-1">•</span>
                      <span>Track your application status in real-time from your dashboard</span>
                    </li>
                  </ul>
                </div>

                {/* Security Note */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-sm text-gray-600 text-center">
                    <strong className="text-gray-900">🔒 Your information is secure.</strong> All data is encrypted and protected according to industry standards.
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="bg-gray-50 p-6 md:p-8 border-t border-gray-200">
                <button
                  onClick={handleCloseIntroModal}
                  className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-lg"
                >
                  Got It, Let's Get Started!
                  <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-center text-sm text-gray-500 mt-3">
                  This will only show once. You can always access help by clicking the info icons throughout the form.
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
                  className="h-10 sm:h-12 flex items-center cursor-pointer"
                >
                  <img src="/logo.jpg" alt="LOANATICKS" className="h-full w-auto object-contain" />
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
                
                <span className="px-3 py-1 rounded-full text-xs font-semibold capitalize bg-slate-100 text-slate-800">
                  {session.user.role}
                </span>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 active:bg-red-200 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px]"
                  aria-label="Logout"
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
            <div className="bg-gradient-to-r from-teal-600 to-teal-600 p-6 sm:p-8 md:p-12 text-white text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-slate-600" />
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

              <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  What you&apos;ll need for your mortgage:
                </h3>
                <ul className="space-y-2 text-slate-800 text-xs sm:text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 mt-1 flex-shrink-0">•</span>
                    <span>Personal identification and contact information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 mt-1 flex-shrink-0">•</span>
                    <span>Current and previous employment details with income verification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 mt-1 flex-shrink-0">•</span>
                    <span>Financial information (bank accounts, assets, monthly obligations)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 mt-1 flex-shrink-0">•</span>
                    <span>Property details and desired loan amount</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 mt-1 flex-shrink-0">•</span>
                    <span>Financial declarations and credit history</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 mt-1 flex-shrink-0">•</span>
                    <span>Supporting documents (W-2s, pay stubs, bank statements)</span>
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl sm:text-3xl font-bold text-slate-600 mb-1">13</div>
                  <div className="text-xs sm:text-sm text-gray-600">Steps</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl sm:text-3xl font-bold text-slate-600 mb-1">30-45</div>
                  <div className="text-xs sm:text-sm text-gray-600">Minutes</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl sm:text-3xl font-bold text-slate-600 mb-1">100%</div>
                  <div className="text-xs sm:text-sm text-gray-600">Complete</div>
                </div>
              </div>

              <button
                onClick={() => setShowWelcome(false)}
                className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
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
      {/* Enhanced Logout Animation */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fadeIn"></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 md:p-12 border-2 border-gray-200 max-w-md w-full mx-4 animate-scaleIn">
            <div className="flex flex-col items-center gap-4">
              {logoutStage === 'signing-out' && (
                <>
                  <div className="relative">
                    <Loader2 className="h-12 w-12 md:h-16 md:w-16 text-slate-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-8 w-8 md:h-10 md:w-10 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Signing out...</h3>
                    <p className="text-sm md:text-base text-gray-600">Please wait while we securely log you out</p>
                  </div>
                </>
              )}
              
              {logoutStage === 'clearing' && (
                <>
                  <div className="relative">
                    <Loader2 className="h-12 w-12 md:h-16 md:w-16 text-slate-400 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-8 w-8 md:h-10 md:w-10 border-4 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Clearing session...</h3>
                    <p className="text-sm md:text-base text-gray-600">Removing your session data</p>
                  </div>
                </>
              )}
              
              {logoutStage === 'success' && (
                <>
                  <div className="relative">
                    <div className="h-16 w-16 md:h-20 md:w-20 bg-green-100 rounded-full flex items-center justify-center animate-scaleIn">
                      <CheckCircle2 className="h-10 w-10 md:h-12 md:w-12 text-green-600 animate-checkmark" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Logged out successfully!</h3>
                    <p className="text-sm md:text-base text-gray-600">Redirecting to login page...</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Introduction Modal - Why You're Filling This Out */}
      {showIntroModal && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden animate-scaleIn relative">
            {/* Close Button */}
            <button
              onClick={handleCloseIntroModal}
              className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 p-8 md:p-10 text-center relative overflow-hidden">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 animate-pulse" style={{animationDelay: '0.5s'}}></div>
              </div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-slate-600" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Welcome to Your Mortgage Application
                </h2>
                <p className="text-lg md:text-xl text-white/90">
                  Let's get you started on your path to homeownership
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Why Section */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-slate-600 p-3 rounded-lg flex-shrink-0">
                    <Info className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Why You're Filling This Out
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      This comprehensive mortgage application is the first step toward securing financing for your dream home. 
                      By providing detailed information about your financial situation, employment history, and the property you're interested in, 
                      we can:
                    </p>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Assess Your Eligibility:</strong> Determine the loan amount you qualify for based on your income, credit, and financial profile</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Get Competitive Rates:</strong> Match you with the best mortgage rates available for your situation</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Streamline the Process:</strong> Pre-approve your application so you can shop for homes with confidence</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Ensure Compliance:</strong> Meet all regulatory requirements for mortgage lending (URLA 2019 standard)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* What Happens Next */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <ArrowRight className="w-5 h-5" />
                  What Happens After You Submit
                </h3>
                <ul className="space-y-2 text-slate-800 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 mt-1">•</span>
                    <span>Our team reviews your application within <strong>24-48 hours</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 mt-1">•</span>
                    <span>You'll receive email updates and may be contacted for additional documentation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 mt-1">•</span>
                    <span>Once approved, you'll receive a pre-approval letter to use when making offers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 mt-1">•</span>
                    <span>Track your application status in real-time from your dashboard</span>
                  </li>
                </ul>
              </div>

              {/* Security Note */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-600 text-center">
                  <strong className="text-gray-900">🔒 Your information is secure.</strong> All data is encrypted and protected according to industry standards.
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-gray-50 p-6 md:p-8 border-t border-gray-200">
              <button
                onClick={handleCloseIntroModal}
                className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-lg"
              >
                Got It, Let's Get Started!
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-center text-sm text-gray-500 mt-3">
                This will only show once. You can always access help by clicking the info icons throughout the form.
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
                className="h-10 sm:h-12 flex items-center cursor-pointer"
              >
                <img src="/logo.jpg" alt="LOANATICKS" className="h-full w-auto object-contain" />
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
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLogout(e);
                }}
                disabled={isLoggingOut}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px]"
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

      <TooltipFixer />
      <URLA2019ComprehensiveForm onSubmit={handleFormSubmit} saving={saving} />

      {/* Modern Success Screen */}
      {showSuccess && successData && (
        <div className="fixed inset-0 z-[100] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden animate-scaleIn">
            {/* Success Header with Animation */}
            <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 p-8 md:p-12 text-center relative overflow-hidden">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 animate-pulse" style={{animationDelay: '0.5s'}}></div>
              </div>
              
              {/* Animated Checkmark Circle */}
              <div className="relative z-10">
                <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-white rounded-full animate-scaleIn opacity-20"></div>
                  <div className="absolute inset-0 bg-white rounded-full animate-scaleIn" style={{animationDelay: '0.2s'}}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CheckCircle2 className="w-16 h-16 md:w-20 md:h-20 text-slate-600 animate-scaleIn" strokeWidth={3} style={{animationDelay: '0.3s'}} />
                  </div>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 animate-slideUp">
                  ✨ Successful Application!
                </h2>
                <p className="text-lg md:text-xl text-white/90 animate-slideUp" style={{animationDelay: '0.1s'}}>
                  Your loan application has been submitted
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Success summary */}
              {documentsUploadedCount > 0 && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5 animate-slideUp" style={{animationDelay: '0.15s'}}>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-green-900 mb-1">Application & documents saved</h3>
                      <p className="text-sm text-green-800">
                        Your application was submitted and <strong>{documentsUploadedCount} document{documentsUploadedCount === 1 ? '' : 's'}</strong> were uploaded successfully. Everything has been saved.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {/* Email Notification */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-5 animate-slideUp" style={{animationDelay: '0.2s'}}>
                <div className="flex items-start gap-3">
                  <Mail className="w-6 h-6 text-slate-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Check Your Email</h3>
                    <p className="text-sm text-slate-800">
                      We've sent a confirmation email to <strong>{successData.email}</strong>. 
                      Please check your inbox (and spam folder) for updates and next steps.
                    </p>
                  </div>
                </div>
              </div>

              {/* Application Details */}
              <div className="space-y-4 animate-slideUp" style={{animationDelay: '0.3s'}}>
                <div className="border-b border-gray-200 pb-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Application ID</h3>
                  <p className="text-2xl font-mono font-bold text-slate-600">
                    {successData.applicationId.slice(-8) || 'Pending'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Submitted on {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })} at {new Date().toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>

                {/* Property Information */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Property Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Property Address</p>
                      <p className="font-semibold text-gray-900">
                        {successData.propertyAddress || 'N/A'}
                        {successData.propertyCity && `, ${successData.propertyCity}`}
                        {successData.propertyState && `, ${successData.propertyState}`}
                        {successData.propertyZipCode && ` ${successData.propertyZipCode}`}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Purchase Price</p>
                        <p className="text-lg font-bold text-gray-900">
                          ${successData.purchasePrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Appraised Value</p>
                        <p className="text-lg font-bold text-gray-900">
                          ${successData.appraisedValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Loan Amount</p>
                        <p className="text-lg font-bold text-slate-600">
                          ${successData.loanAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Down Payment</p>
                        <p className="text-lg font-bold text-gray-900">
                          ${successData.downPayment.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          <span className="text-sm text-gray-600 ml-1">
                            ({successData.downPaymentPercent.toFixed(1)}%)
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Loan-to-Value (LTV) Ratio</p>
                      <p className="text-xl font-bold text-gray-900">
                        {successData.ltv.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* What's Next */}
                <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-5">
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <ArrowRight className="w-5 h-5" />
                    What's Next?
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-800">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                      <span>Our team will review your application within <strong>24-48 hours</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                      <span>You'll receive email updates at <strong>{successData.email}</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                      <span>Check your dashboard for real-time application status</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                      <span>We may contact you if additional information is needed</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-gray-50 p-6 md:p-8 border-t border-gray-200 flex flex-col sm:flex-row gap-3 animate-slideUp" style={{animationDelay: '0.4s'}}>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  router.push('/customer/dashboard');
                }}
                className="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Go to Dashboard
              </button>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  setShowWelcome(true);
                }}
                className="flex-1 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Chatbot Widget */}
      <ChatbotWidget />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

