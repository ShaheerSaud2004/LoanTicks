'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { 
  FileText, 
  User, 
  Home, 
  Briefcase, 
  DollarSign, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Save,
  AlertTriangle,
  Info,
  HelpCircle
} from 'lucide-react';
import FormTooltip from './FormTooltip';

interface URLA2019ComprehensiveFormProps {
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  saving: boolean;
}

export default function URLA2019ComprehensiveForm({ onSubmit, saving }: URLA2019ComprehensiveFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // SECTION 1: BORROWER INFORMATION
    // 1a. Personal Information
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    alternateNames: '',
    ssn: '',
    dateOfBirth: '',
    creditScore: '',
    citizenship: 'us_citizen',
    
    // 1b. Credit Type and Joint Borrowers
    creditType: 'individual',
    jointBorrowers: '',
    otherBorrowerNames: '',
    
    // 1c. Marital Status and Dependents
    maritalStatus: 'unmarried',
    dependents: 0,
    dependentAges: '',
    
    // SECTION 2: CONTACT INFORMATION
    homePhone: '',
    cellPhone: '',
    email: '',
    alternateEmail: '',
    preferredContactMethod: 'phone',
    
    // SECTION 3: CURRENT ADDRESS
    currentStreet: '',
    currentUnit: '',
    currentCity: '',
    currentState: '',
    currentZipCode: '',
    currentHousing: 'own',
    currentMonthlyPayment: '',
    yearsAtCurrentAddress: '',
    monthsAtCurrentAddress: '',
    
    // SECTION 4: PRIOR ADDRESS (if less than 2 years at current)
    hasPriorAddress: false,
    priorStreet: '',
    priorUnit: '',
    priorCity: '',
    priorState: '',
    priorZipCode: '',
    priorHousing: 'rent',
    priorMonthlyPayment: '',
    yearsAtPriorAddress: '',
    monthsAtPriorAddress: '',
    
    // SECTION 5: EMPLOYMENT INFORMATION
    // 5a. Current Employment
    employmentStatus: 'employed',
    employerName: '',
    position: '',
    employmentStartDate: '',
    yearsEmployed: '',
    monthsEmployed: '',
    workAddress: '',
    workCity: '',
    workState: '',
    workZipCode: '',
    workPhone: '',
    monthlyIncome: '',
    otherIncome: '',
    otherIncomeSource: '',
    
    // 5b. Previous Employment (if less than 2 years at current)
    hasPreviousEmployment: false,
    previousEmployerName: '',
    previousPosition: '',
    previousEmploymentStartDate: '',
    previousEmploymentEndDate: '',
    previousYearsEmployed: '',
    previousMonthsEmployed: '',
    previousMonthlyIncome: '',
    
    // SECTION 6: INCOME INFORMATION
    grossMonthlyIncome: '',
    baseIncome: '',
    overtimeIncome: '',
    bonusIncome: '',
    commissionIncome: '',
    otherIncomeAmount: '',
    otherIncomeDescription: '',
    totalMonthlyIncome: '',
    
    // SECTION 7: ASSETS
    // 7a. Bank Accounts
    checkingAccountBalance: '',
    savingsAccountBalance: '',
    moneyMarketBalance: '',
    cdsBalance: '',
    
    // 7b. Real Estate
    realEstateOwned: false,
    realEstateAddress: '',
    realEstateValue: '',
    realEstateMortgageBalance: '',
    realEstateMonthlyRentalIncome: '',
    
    // 7c. Other Assets
    stockBondValue: '',
    lifeInsuranceValue: '',
    retirementAccountValue: '',
    otherAssetValue: '',
    otherAssetDescription: '',
    totalAssets: '',
    
    // SECTION 8: LIABILITIES
    // 8a. Monthly Liabilities
    mortgagePayment: '',
    secondMortgagePayment: '',
    homeEquityPayment: '',
    creditCardPayments: '',
    installmentLoanPayments: '',
    otherMonthlyPayments: '',
    totalMonthlyLiabilities: '',
    
    // 8b. Credit Accounts
    hasCreditAccounts: false,
    creditAccounts: [],
    
    // SECTION 9: PROPERTY INFORMATION
    propertyAddress: '',
    propertyCity: '',
    propertyState: '',
    propertyZipCode: '',
    propertyType: 'single_family',
    propertyUse: 'primary_residence',
    propertyValue: '',
    purchasePrice: '',
    appraisedValue: '',
    downPaymentAmount: '',
    downPaymentPercentage: '',
    loanAmount: '',
    loanPurpose: 'purchase',
    refinancePurpose: '',
    
    // SECTION 10: LOAN INFORMATION
    loanType: 'conventional',
    loanTerm: '',
    interestRateType: 'fixed',
    interestRate: '',
    monthlyPayment: '',
    pmiRequired: false,
    pmiAmount: '',
    
    // SECTION 11: DECLARATIONS
    outstandingJudgments: false,
    declaredBankruptcy: false,
    bankruptcyDate: '',
    propertyForeclosed: false,
    foreclosureDate: '',
    lawsuitParty: false,
    lawsuitDescription: '',
    loanOnProperty: false,
    coMakerOnNote: false,
    usCitizen: true,
    permanentResident: false,
    primaryResidence: true,
    intendToOccupy: true,
    
    // SECTION 12: MILITARY SERVICE
    militaryService: 'none',
    militaryBranch: '',
    militaryRank: '',
    militaryServiceDates: '',
    
    // SECTION 13: DEMOGRAPHIC INFORMATION
    race: [],
    ethnicity: '',
    sex: '',
    
    // SECTION 14: ADDITIONAL INFORMATION
    additionalInformation: '',
    specialCircumstances: '',
    
    // SECTION 15: DOCUMENTS
    uploadedDocuments: [],
    idDocument: null as File | null,
    paystubsDocument: null as File | null
  });

  const steps = [
    { title: 'Personal Information', icon: User, description: 'Basic personal details and identification' },
    { title: 'Contact Information', icon: User, description: 'Phone numbers and email addresses' },
    { title: 'Current Address', icon: Home, description: 'Current residence information' },
    { title: 'Prior Address', icon: Home, description: 'Previous address if applicable' },
    { title: 'Current Employment', icon: Briefcase, description: 'Current job and income details' },
    { title: 'Previous Employment', icon: Briefcase, description: 'Previous job if applicable' },
    { title: 'Income Details', icon: DollarSign, description: 'Detailed income breakdown' },
    { title: 'Assets', icon: DollarSign, description: 'Bank accounts and other assets' },
    { title: 'Liabilities', icon: DollarSign, description: 'Monthly payments and debts' },
    { title: 'Property Information', icon: Home, description: 'Property being purchased/refinanced' },
    { title: 'Loan Details', icon: FileText, description: 'Loan terms and conditions' },
    { title: 'Declarations', icon: CheckCircle, description: 'Legal declarations and disclosures' },
    { title: 'Military Service', icon: User, description: 'Military service information' },
    { title: 'Demographics', icon: User, description: 'Demographic information (optional)' },
    { title: 'Documents', icon: FileText, description: 'Supporting documents upload' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const calculateTotalMonthlyLiabilities = useCallback(() => {
    const mortgage = parseFloat(formData.mortgagePayment) || 0;
    const secondMortgage = parseFloat(formData.secondMortgagePayment) || 0;
    const homeEquity = parseFloat(formData.homeEquityPayment) || 0;
    const creditCards = parseFloat(formData.creditCardPayments) || 0;
    const installment = parseFloat(formData.installmentLoanPayments) || 0;
    const other = parseFloat(formData.otherMonthlyPayments) || 0;
    
    const total = mortgage + secondMortgage + homeEquity + creditCards + installment + other;
    setFormData(prev => ({
      ...prev,
      totalMonthlyLiabilities: total.toString()
    }));
  }, [formData.mortgagePayment, formData.secondMortgagePayment, formData.homeEquityPayment, formData.creditCardPayments, formData.installmentLoanPayments, formData.otherMonthlyPayments]);

  const calculateTotalAssets = useCallback(() => {
    const checking = parseFloat(formData.checkingAccountBalance) || 0;
    const savings = parseFloat(formData.savingsAccountBalance) || 0;
    const moneyMarket = parseFloat(formData.moneyMarketBalance) || 0;
    const cds = parseFloat(formData.cdsBalance) || 0;
    const realEstate = parseFloat(formData.realEstateValue) || 0;
    const stocks = parseFloat(formData.stockBondValue) || 0;
    const lifeInsurance = parseFloat(formData.lifeInsuranceValue) || 0;
    const retirement = parseFloat(formData.retirementAccountValue) || 0;
    const other = parseFloat(formData.otherAssetValue) || 0;
    
    const total = checking + savings + moneyMarket + cds + realEstate + stocks + lifeInsurance + retirement + other;
    setFormData(prev => ({
      ...prev,
      totalAssets: total.toString()
    }));
  }, [formData.checkingAccountBalance, formData.savingsAccountBalance, formData.moneyMarketBalance, formData.cdsBalance, formData.realEstateValue, formData.stockBondValue, formData.lifeInsuranceValue, formData.retirementAccountValue, formData.otherAssetValue]);

  const calculateTotalMonthlyIncome = useCallback(() => {
    const base = parseFloat(formData.baseIncome) || 0;
    const overtime = parseFloat(formData.overtimeIncome) || 0;
    const bonus = parseFloat(formData.bonusIncome) || 0;
    const commission = parseFloat(formData.commissionIncome) || 0;
    const other = parseFloat(formData.otherIncomeAmount) || 0;
    
    const total = base + overtime + bonus + commission + other;
    setFormData(prev => ({
      ...prev,
      totalMonthlyIncome: total.toString()
    }));
  }, [formData.baseIncome, formData.overtimeIncome, formData.bonusIncome, formData.commissionIncome, formData.otherIncomeAmount]);

  useEffect(() => {
    calculateTotalMonthlyLiabilities();
  }, [calculateTotalMonthlyLiabilities]);

  useEffect(() => {
    calculateTotalAssets();
  }, [calculateTotalAssets]);

  useEffect(() => {
    calculateTotalMonthlyIncome();
  }, [calculateTotalMonthlyIncome]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      // Scroll to top of form on step change
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      // Scroll to top of form on step change
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Don't log sensitive form data
    // Only log document count in development
    if (process.env.NODE_ENV === 'development') {
      const documents = formData.uploadedDocuments as File[];
      if (documents && documents.length > 0) {
        console.log(`Submitting form with ${documents.length} document(s)`);
      } else {
        console.log('Submitting form without documents');
      }
    }
    await onSubmit(formData);
  };

  const renderStep = () => {
    // Calculate property values for case 9
    const purchasePriceNum = Number(formData.purchasePrice) || 0;
    const appraisedValueNum = Number(formData.appraisedValue) || 0;
    const loanAmountNum = Number(formData.loanAmount) || 0;
    const downPaymentAmount = purchasePriceNum - loanAmountNum;
    const downPaymentPercent = purchasePriceNum > 0 ? (downPaymentAmount / purchasePriceNum) * 100 : 0;
    
    switch (currentStep) {
      case 0: // Personal Information
        return (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 sm:p-8">
              <h3 className="font-bold text-yellow-900 mb-3 text-xl sm:text-2xl flex items-center gap-3">
                <Info className="w-6 h-6 sm:w-7 sm:h-7" />
                Section 1a: Personal Information
              </h3>
              <p className="text-yellow-800 text-base sm:text-lg leading-relaxed">
                Please provide your complete personal information exactly as it appears on your government-issued identification. This information is used to verify your identity and process your loan application. All fields marked with an asterisk (*) are required.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  First Name *
                    <span className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      <span className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Your legal first name as it appears on your government-issued ID (driver's license, passport, etc.)
                      </span>
                    </span>
                </label>
                  <p className="text-sm text-gray-600 mb-2">Enter your legal first name exactly as shown on your identification documents.</p>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900"
                  required
                />
              </div>
              <div>
                  <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  Middle Name
                    <span className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      <span className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Your middle name or middle initial (optional). Include if it appears on your ID.
                      </span>
                    </span>
                </label>
                  <p className="text-sm text-gray-600 mb-2">Optional: Your middle name if it appears on your identification documents.</p>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => handleInputChange('middleName', e.target.value)}
                    className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900"
                />
              </div>
              <div>
                  <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  Last Name *
                    <span className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      <span className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Your legal last name (surname) as it appears on your government-issued ID.
                      </span>
                    </span>
                </label>
                  <p className="text-sm text-gray-600 mb-2">Enter your legal last name exactly as shown on your identification documents.</p>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900"
                  required
                />
              </div>
              <div>
                  <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  Suffix
                    <span className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      <span className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Name suffix (Jr., Sr., II, III, etc.) if applicable and appears on your ID.
                      </span>
                    </span>
                </label>
                  <p className="text-sm text-gray-600 mb-2">Optional: Select if you have a name suffix that appears on your identification.</p>
                <select
                  value={formData.suffix}
                  onChange={(e) => handleInputChange('suffix', e.target.value)}
                  className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900 cursor-pointer touch-manipulation min-h-[60px] bg-white"
                >
                  <option value="">Select Suffix</option>
                  <option value="Jr.">Jr.</option>
                  <option value="Sr.">Sr.</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                  <option value="IV">IV</option>
                  <option value="V">V</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                Alternate Names (if any)
                <span className="group relative">
                  <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                  <span className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    Any other names you've used (maiden name, former married name, etc.) that might appear on credit reports or other documents.
                  </span>
                </span>
              </label>
              <p className="text-sm text-gray-600 mb-2">List any other names you've used, such as a maiden name or former name, that might appear on your credit history.</p>
              <input
                type="text"
                value={formData.alternateNames}
                onChange={(e) => handleInputChange('alternateNames', e.target.value)}
                placeholder="e.g., maiden name, former name"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none transition text-gray-900"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  Social Security Number *
                  <span className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <span className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      Your 9-digit Social Security Number (SSN) in format XXX-XX-XXXX. Required for credit verification and identity verification.
                    </span>
                  </span>
                </label>
                <p className="text-sm text-gray-600 mb-2">Enter your 9-digit Social Security Number. This is required for credit checks and identity verification.</p>
                <input
                  type="text"
                  value={formData.ssn}
                  onChange={(e) => handleInputChange('ssn', e.target.value)}
                  placeholder="XXX-XX-XXXX"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none transition text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  Date of Birth *
                  <span className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <span className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      Your date of birth as it appears on your government-issued ID. Required for age verification and identity confirmation.
                    </span>
                  </span>
                </label>
                <p className="text-sm text-gray-600 mb-2">Enter your date of birth exactly as shown on your identification documents (MM/DD/YYYY format).</p>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none transition text-gray-900"
                  required
                />
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
              <h3 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Credit Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    Estimated Credit Score
                    <span className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      <span className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Your estimated FICO credit score (300-850). This helps us provide initial rate estimates. We will verify your actual credit score during processing.
                      </span>
                    </span>
                  </label>
                  <p className="text-sm text-gray-600 mb-2">Enter your estimated credit score if known. This helps provide initial rate estimates, but we will pull your official credit report during processing.</p>
                  <input
                    type="number"
                    min="300"
                    max="850"
                    value={formData.creditScore}
                    onChange={(e) => handleInputChange('creditScore', e.target.value)}
                    placeholder="e.g., 720"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none transition text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">Range: 300-850 (Optional, helps with rate estimation)</p>
                </div>
                <div className="flex items-center">
                  <div className="text-sm text-gray-600">
                    <p className="font-semibold mb-1">Credit Score Ranges:</p>
                    <p className="text-xs">• 800-850: Excellent</p>
                    <p className="text-xs">• 740-799: Very Good</p>
                    <p className="text-xs">• 670-739: Good</p>
                    <p className="text-xs">• 580-669: Fair</p>
                    <p className="text-xs">• 300-579: Poor</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Citizenship Status *
              </label>
              <div className="space-y-3">
                {[
                  { value: 'us_citizen', label: 'US Citizen' },
                  { value: 'permanent_resident', label: 'Permanent Resident Alien' },
                  { value: 'non_permanent_resident', label: 'Non-Permanent Resident Alien' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-yellow-500 transition cursor-pointer touch-manipulation min-h-[60px]">
                    <input
                      type="radio"
                      name="citizenship"
                      value={option.value}
                      checked={formData.citizenship === option.value}
                      onChange={(e) => handleInputChange('citizenship', e.target.value)}
                      className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 cursor-pointer flex-shrink-0 accent-yellow-600"
                    />
                    <span className="text-base sm:text-lg text-gray-900 font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
              <h3 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Section 1b: Credit Type
              </h3>
              <div>
                <label className="block text-base sm:text-lg font-bold text-gray-800 mb-3">
                  Credit Type *
                </label>
                <p className="text-sm text-gray-600 mb-3">Select whether this is an individual or joint credit application.</p>
                <div className="space-y-3">
                  {[
                    { value: 'individual', label: 'Individual' },
                    { value: 'joint', label: 'Joint Credit' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-yellow-500 transition cursor-pointer touch-manipulation min-h-[60px]">
                      <input
                        type="radio"
                        name="creditType"
                        value={option.value}
                        checked={formData.creditType === option.value}
                        onChange={(e) => handleInputChange('creditType', e.target.value)}
                        className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 cursor-pointer flex-shrink-0 accent-yellow-600"
                      />
                      <span className="text-base sm:text-lg text-gray-900 font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {formData.creditType === 'joint' && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                <h3 className="font-bold text-yellow-900 mb-2">
                  Joint Borrower Information
                </h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Other Borrower Names
                  </label>
                  <input
                    type="text"
                    value={formData.otherBorrowerNames}
                    onChange={(e) => handleInputChange('otherBorrowerNames', e.target.value)}
                    placeholder="Full names of other borrowers"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none transition text-gray-900"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-base sm:text-lg font-bold text-gray-800 mb-3">
                Marital Status *
              </label>
              <p className="text-sm text-gray-600 mb-3">Select your current marital status.</p>
              <select
                value={formData.maritalStatus}
                onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900 cursor-pointer touch-manipulation min-h-[60px] bg-white"
              >
                <option value="unmarried">Unmarried</option>
                <option value="married">Married</option>
                <option value="separated">Separated</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Dependents
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.dependents}
                  onChange={(e) => handleInputChange('dependents', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none transition text-gray-900"
                />
              </div>
              {formData.dependents > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dependent Ages
                  </label>
                  <input
                    type="text"
                    value={formData.dependentAges}
                    onChange={(e) => handleInputChange('dependentAges', e.target.value)}
                    placeholder="e.g., 5, 8, 12"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none transition text-gray-900"
                  />
                </div>
              )}
            </div>
            </div>
          </div>
        );

      case 1: // Contact Information
        return (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 sm:p-8">
              <h3 className="font-bold text-yellow-900 mb-3 text-xl sm:text-2xl flex items-center gap-3">
                <Info className="w-6 h-6 sm:w-7 sm:h-7" />
                Section 2: Contact Information
              </h3>
              <p className="text-yellow-800 text-base sm:text-lg leading-relaxed">
                Please provide your complete contact information. This information is essential for loan processing, communications, and updates regarding your application status. We will use this to contact you throughout the loan process.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="block text-base sm:text-lg font-bold text-gray-800 mb-3">
                  Home Phone
                </label>
                <input
                  type="tel"
                  value={formData.homePhone}
                  onChange={(e) => handleInputChange('homePhone', e.target.value)}
                  placeholder="(XXX) XXX-XXXX"
                    className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900"
                />
              </div>
              <div>
                  <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  Cell Phone *
                    <span className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      <span className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Your primary mobile phone number. We'll use this to contact you about your application and send important updates.
                      </span>
                    </span>
                </label>
                  <p className="text-sm text-gray-600 mb-2">Enter your primary mobile phone number where we can reach you.</p>
                <input
                  type="tel"
                  value={formData.cellPhone}
                  onChange={(e) => handleInputChange('cellPhone', e.target.value)}
                  placeholder="(XXX) XXX-XXXX"
                    className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900"
                  required
                />
              </div>
              <div>
                  <label className="block text-base sm:text-lg font-bold text-gray-800 mb-3">
                  Work Phone
                </label>
                <input
                  type="tel"
                  value={formData.workPhone}
                  onChange={(e) => handleInputChange('workPhone', e.target.value)}
                  placeholder="(XXX) XXX-XXXX"
                    className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900"
                />
              </div>
              <div>
                  <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  Email Address *
                    <span className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      <span className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Your primary email address. We'll send application updates, documents, and important notifications to this email.
                      </span>
                    </span>
                </label>
                  <p className="text-sm text-gray-600 mb-2">Enter your primary email address where you'll receive application updates and documents.</p>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                    className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900"
                  required
                />
              </div>
            </div>

            <div>
                <label className="block text-base sm:text-lg font-bold text-gray-800 mb-3">
                Alternate Email Address
              </label>
              <input
                type="email"
                value={formData.alternateEmail}
                onChange={(e) => handleInputChange('alternateEmail', e.target.value)}
                placeholder="alternate.email@example.com"
                  className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900"
              />
            </div>

            <div>
                <label className="block text-base sm:text-lg font-bold text-gray-800 mb-3">
                Preferred Contact Method *
              </label>
                <p className="text-sm text-gray-600 mb-3">How would you like us to contact you?</p>
                <div className="space-y-3">
                {[
                  { value: 'phone', label: 'Phone' },
                  { value: 'email', label: 'Email' },
                  { value: 'text', label: 'Text Message' }
                ].map((option) => (
                    <label key={option.value} className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-yellow-500 transition cursor-pointer touch-manipulation min-h-[60px]">
                    <input
                      type="radio"
                      name="preferredContactMethod"
                      value={option.value}
                      checked={formData.preferredContactMethod === option.value}
                      onChange={(e) => handleInputChange('preferredContactMethod', e.target.value)}
                      className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 cursor-pointer flex-shrink-0 accent-yellow-600"
                    />
                    <span className="text-base sm:text-lg text-gray-900 font-medium">{option.label}</span>
                  </label>
                ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Current Address
        return (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 sm:p-8">
              <h3 className="font-bold text-yellow-900 mb-3 text-xl sm:text-2xl flex items-center gap-3">
                <Info className="w-6 h-6 sm:w-7 sm:h-7" />
                Section 3: Current Address
              </h3>
              <p className="text-yellow-800 text-base sm:text-lg leading-relaxed">
                Please provide your current residential address information. This address is used for verification purposes and must match the address on your identification documents. If you have lived at your current address for less than 2 years, you will need to provide your prior address in the next section.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
            <div>
                  <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                Street Address *
                  <span className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <span className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      Your current residential street address. This must match the address on your identification and utility bills.
                    </span>
                  </span>
              </label>
                <p className="text-sm text-gray-600 mb-2">Enter your current residential street address where you currently live.</p>
              <input
                type="text"
                value={formData.currentStreet}
                onChange={(e) => handleInputChange('currentStreet', e.target.value)}
                  className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  Unit/Apt Number
                  <span className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      If you live in an apartment, condo, or unit, enter your unit number here (e.g., Apt 1B, Unit 2, Suite 300). Leave blank if you live in a single-family home.
                    </span>
                  </span>
                </label>
                <p className="text-sm text-gray-600 mb-2">Enter your apartment or unit number if applicable.</p>
                <input
                  type="text"
                  value={formData.currentUnit}
                  onChange={(e) => handleInputChange('currentUnit', e.target.value)}
                  placeholder="Apt 1B, Unit 2, etc."
                    className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900"
                />
              </div>
              <div>
                  <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  City *
                  <span className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      Enter the city where your current residence is located. This must match the city on your identification documents and utility bills.
                    </span>
                  </span>
                </label>
                <p className="text-sm text-gray-600 mb-2">Enter the city where you currently live.</p>
                <input
                  type="text"
                  value={formData.currentCity}
                  onChange={(e) => handleInputChange('currentCity', e.target.value)}
                    className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  State *
                  <span className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      Select the state where your current residence is located. This must match the state on your identification documents and utility bills.
                    </span>
                  </span>
                </label>
                <p className="text-sm text-gray-600 mb-2">Select your state from the dropdown menu.</p>
                <select
                  value={formData.currentState}
                  onChange={(e) => handleInputChange('currentState', e.target.value)}
                  className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900 cursor-pointer touch-manipulation min-h-[60px] bg-white"
                  required
                >
                  <option value="">Select State</option>
                  <option value="AL">Alabama</option>
                  <option value="AK">Alaska</option>
                  <option value="AZ">Arizona</option>
                  <option value="AR">Arkansas</option>
                  <option value="CA">California</option>
                  <option value="CO">Colorado</option>
                  <option value="CT">Connecticut</option>
                  <option value="DE">Delaware</option>
                  <option value="FL">Florida</option>
                  <option value="GA">Georgia</option>
                  <option value="HI">Hawaii</option>
                  <option value="ID">Idaho</option>
                  <option value="IL">Illinois</option>
                  <option value="IN">Indiana</option>
                  <option value="IA">Iowa</option>
                  <option value="KS">Kansas</option>
                  <option value="KY">Kentucky</option>
                  <option value="LA">Louisiana</option>
                  <option value="ME">Maine</option>
                  <option value="MD">Maryland</option>
                  <option value="MA">Massachusetts</option>
                  <option value="MI">Michigan</option>
                  <option value="MN">Minnesota</option>
                  <option value="MS">Mississippi</option>
                  <option value="MO">Missouri</option>
                  <option value="MT">Montana</option>
                  <option value="NE">Nebraska</option>
                  <option value="NV">Nevada</option>
                  <option value="NH">New Hampshire</option>
                  <option value="NJ">New Jersey</option>
                  <option value="NM">New Mexico</option>
                  <option value="NY">New York</option>
                  <option value="NC">North Carolina</option>
                  <option value="ND">North Dakota</option>
                  <option value="OH">Ohio</option>
                  <option value="OK">Oklahoma</option>
                  <option value="OR">Oregon</option>
                  <option value="PA">Pennsylvania</option>
                  <option value="RI">Rhode Island</option>
                  <option value="SC">South Carolina</option>
                  <option value="SD">South Dakota</option>
                  <option value="TN">Tennessee</option>
                  <option value="TX">Texas</option>
                  <option value="UT">Utah</option>
                  <option value="VT">Vermont</option>
                  <option value="VA">Virginia</option>
                  <option value="WA">Washington</option>
                  <option value="WV">West Virginia</option>
                  <option value="WI">Wisconsin</option>
                  <option value="WY">Wyoming</option>
                </select>
              </div>
              <div>
                <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  ZIP Code *
                  <span className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      Enter your 5-digit ZIP code. If you have a ZIP+4 code, you can enter just the 5-digit portion. This must match the ZIP code on your identification and utility bills.
                    </span>
                  </span>
                </label>
                <p className="text-sm text-gray-600 mb-2">Enter your 5-digit ZIP code.</p>
                <input
                  type="text"
                  value={formData.currentZipCode}
                  onChange={(e) => handleInputChange('currentZipCode', e.target.value)}
                  placeholder="12345"
                  className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                Housing Status *
                <span className="group relative">
                  <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                  <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                    Select how you currently occupy this residence: Own (you own the property), Rent (you pay rent), Live Rent Free (no rent payment), or Other (explain in comments if needed).
                  </span>
                </span>
              </label>
              <p className="text-sm text-gray-600 mb-3">Select your current housing situation.</p>
              <div className="space-y-3">
                {[
                  { value: 'own', label: 'Own' },
                  { value: 'rent', label: 'Rent' },
                  { value: 'live_rent_free', label: 'Live Rent Free' },
                  { value: 'other', label: 'Other' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-yellow-500 transition cursor-pointer touch-manipulation min-h-[60px]">
                    <input
                      type="radio"
                      name="currentHousing"
                      value={option.value}
                      checked={formData.currentHousing === option.value}
                      onChange={(e) => handleInputChange('currentHousing', e.target.value)}
                      className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 cursor-pointer flex-shrink-0 accent-yellow-600"
                    />
                    <span className="text-base sm:text-lg text-gray-900 font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  Monthly Payment
                  <span className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      Enter your total monthly housing payment. If you own, include principal, interest, taxes, and insurance (PITI). If you rent, enter your monthly rent amount. If you live rent-free, enter 0.
                    </span>
                  </span>
                </label>
                <p className="text-sm text-gray-600 mb-2">Enter your total monthly housing payment (rent or mortgage).</p>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.currentMonthlyPayment}
                  onChange={(e) => handleInputChange('currentMonthlyPayment', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900"
                />
              </div>
              <div>
                <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  Years at Current Address *
                  <span className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      Enter the number of years you have lived at your current address. If less than 2 years, you will need to provide your prior address in the next section. Count partial years as full years (e.g., 1 year and 6 months = 1 year).
                    </span>
                  </span>
                </label>
                <p className="text-sm text-gray-600 mb-2">How many years have you lived at this address?</p>
                <input
                  type="number"
                  min="0"
                  value={formData.yearsAtCurrentAddress}
                  onChange={(e) => handleInputChange('yearsAtCurrentAddress', e.target.value)}
                  className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900"
                  required
                />
              </div>
            </div>

            {parseInt(formData.yearsAtCurrentAddress) < 2 && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                <h3 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Prior Address Required
                </h3>
                <p className="text-yellow-800 text-sm mb-4">
                  Since you have lived at your current address for less than 2 years, 
                  you will need to provide your prior address information in the next step.
                </p>
                <label className="flex items-center text-gray-900">
                  <input
                    type="checkbox"
                    checked={formData.hasPriorAddress}
                    onChange={(e) => handleInputChange('hasPriorAddress', e.target.checked)}
                    className="mr-2"
                  />
                  I have a prior address to provide
                </label>
              </div>
            )}
            </div>
          </div>
        );

      case 3: // Prior Address
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
              <h3 className="font-bold text-yellow-900 mb-2">Section 3b: Prior Address</h3>
              <p className="text-yellow-800 text-sm">If you lived at your current address for less than 2 years, provide prior address.</p>
            </div>
            {parseInt(formData.yearsAtCurrentAddress) >= 2 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <p className="text-gray-600">No prior address needed (2+ years at current address)</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
                <div>
                  <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                    Prior Street Address *
                    <span className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                        Enter the complete street address where you lived before your current address. This is required if you have lived at your current address for less than 2 years. Include the street number and name.
                      </span>
                    </span>
                  </label>
                  <p className="text-sm text-gray-600 mb-2">Enter your previous residential street address.</p>
                  <input type="text" value={formData.priorStreet} onChange={(e) => handleInputChange('priorStreet', e.target.value)} className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                      City *
                      <span className="group relative">
                        <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                        <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                          Enter the city where your prior residence was located. This helps verify your residential history.
                        </span>
                      </span>
                    </label>
                    <p className="text-sm text-gray-600 mb-2">Enter the city of your prior address.</p>
                    <input type="text" value={formData.priorCity} onChange={(e) => handleInputChange('priorCity', e.target.value)} className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" required />
                  </div>
                  <div>
                    <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                      State *
                      <span className="group relative">
                        <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                        <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                          Enter the state abbreviation (e.g., CA, NY, TX) where your prior residence was located. Use the 2-letter state code.
                        </span>
                      </span>
                    </label>
                    <p className="text-sm text-gray-600 mb-2">Enter the state abbreviation (e.g., CA, NY).</p>
                    <input type="text" value={formData.priorState} onChange={(e) => handleInputChange('priorState', e.target.value)} placeholder="CA" maxLength={2} className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900 uppercase" required />
                  </div>
                  <div>
                    <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                      ZIP Code *
                      <span className="group relative">
                        <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                        <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                          Enter the 5-digit ZIP code for your prior address. This helps verify your residential history and credit reporting.
                        </span>
                      </span>
                    </label>
                    <p className="text-sm text-gray-600 mb-2">Enter the 5-digit ZIP code.</p>
                    <input type="text" value={formData.priorZipCode} onChange={(e) => handleInputChange('priorZipCode', e.target.value)} placeholder="12345" maxLength={5} className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" required />
                  </div>
                  <div>
                    <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                      Years at Prior Address *
                      <span className="group relative">
                        <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                        <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                          Enter how many years you lived at this prior address. This helps establish your residential stability. Count partial years as full years (e.g., 1 year and 6 months = 1 year).
                        </span>
                      </span>
                    </label>
                    <p className="text-sm text-gray-600 mb-2">How many years did you live at this address?</p>
                    <input type="number" value={formData.yearsAtPriorAddress} onChange={(e) => handleInputChange('yearsAtPriorAddress', e.target.value)} min="0" className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" required />
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 4: // Current Employment
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 sm:p-8">
              <h3 className="font-bold text-yellow-900 mb-3 text-xl sm:text-2xl flex items-center gap-3">
                <Info className="w-6 h-6 sm:w-7 sm:h-7" />
                Section 5a: Current Employment
              </h3>
              <p className="text-yellow-800 text-base sm:text-lg leading-relaxed">
                Provide complete details about your current employment. This information is used to verify your income and employment stability. If you have been at your current job for less than 2 years, you will need to provide previous employment information in the next section.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  Employer Name *
                  <span className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      Enter the full legal name of your current employer as it appears on your pay stubs and W-2 forms. If self-employed, enter your business name or "Self-Employed".
                    </span>
                  </span>
                </label>
                <p className="text-sm text-gray-600 mb-2">Enter your current employer's full legal name.</p>
                <input type="text" value={formData.employerName} onChange={(e) => handleInputChange('employerName', e.target.value)} className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" required />
              </div>
              <div>
                <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  Position/Title *
                  <span className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      Enter your current job title or position (e.g., Software Engineer, Sales Manager, Teacher). This should match what appears on your pay stubs and employment verification.
                    </span>
                  </span>
                </label>
                <p className="text-sm text-gray-600 mb-2">Enter your current job title or position.</p>
                <input type="text" value={formData.position} onChange={(e) => handleInputChange('position', e.target.value)} className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" required />
              </div>
              <div>
                <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  Years in Line of Work *
                  <span className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      Enter the total number of years you have worked in your current profession or line of work (not just at your current employer). This demonstrates career stability. If less than 2 years, you'll need to provide previous employment details.
                    </span>
                  </span>
                </label>
                <p className="text-sm text-gray-600 mb-2">How many years have you worked in this profession?</p>
                <input type="number" value={formData.yearsEmployed} onChange={(e) => handleInputChange('yearsEmployed', e.target.value)} min="0" className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" required />
              </div>
              <div>
                <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  Work Phone
                  <span className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      Enter your work phone number including area code (e.g., 555-123-4567). This is used for employment verification. If you don't have a work phone, you can leave this blank.
                    </span>
                  </span>
                </label>
                <p className="text-sm text-gray-600 mb-2">Enter your work phone number (optional).</p>
                <input type="tel" value={formData.workPhone} onChange={(e) => handleInputChange('workPhone', e.target.value)} placeholder="555-123-4567" className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" />
              </div>
            </div>
            </div>
          </div>
        );

      case 5: // Previous Employment  
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
              <h3 className="font-bold text-yellow-900 mb-2">Section 5b: Previous Employment</h3>
              <p className="text-yellow-800 text-sm">If less than 2 years at current job, provide previous employment</p>
            </div>
            {parseInt(formData.yearsEmployed) >= 2 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <p className="text-gray-600">No previous employment needed (2+ years at current job)</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                      Previous Employer *
                      <span className="group relative">
                        <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                        <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                          Enter the full legal name of your previous employer. This is required if you have been at your current job for less than 2 years. This helps establish your employment history and income stability.
                        </span>
                      </span>
                    </label>
                    <p className="text-sm text-gray-600 mb-2">Enter your previous employer's full legal name.</p>
                    <input type="text" value={formData.previousEmployerName} onChange={(e) => handleInputChange('previousEmployerName', e.target.value)} className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" required />
                  </div>
                  <div>
                    <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                      Previous Position *
                      <span className="group relative">
                        <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                        <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                          Enter your job title or position at your previous employer. This should match what appears on your previous employment records or W-2 forms.
                        </span>
                      </span>
                    </label>
                    <p className="text-sm text-gray-600 mb-2">Enter your previous job title or position.</p>
                    <input type="text" value={formData.previousPosition} onChange={(e) => handleInputChange('previousPosition', e.target.value)} className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" required />
                  </div>
                  <div>
                    <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                      Years at Previous Job *
                      <span className="group relative">
                        <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                        <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                          Enter how many years you worked at your previous employer. This helps demonstrate employment stability. Count partial years as full years (e.g., 1 year and 6 months = 1 year).
                        </span>
                      </span>
                    </label>
                    <p className="text-sm text-gray-600 mb-2">How many years did you work at your previous job?</p>
                    <input type="number" value={formData.previousYearsEmployed} onChange={(e) => handleInputChange('previousYearsEmployed', e.target.value)} min="0" className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" required />
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 6: // Income Details
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 sm:p-8">
              <h3 className="font-bold text-yellow-900 mb-3 text-xl sm:text-2xl flex items-center gap-3">
                <Info className="w-6 h-6 sm:w-7 sm:h-7" />
                Section 6: Income Details
              </h3>
              <p className="text-yellow-800 text-base sm:text-lg leading-relaxed">
                Provide a detailed breakdown of your monthly income from all sources. Enter amounts in dollars (e.g., 5000 for $5,000). The total will be calculated automatically. This information is critical for determining your loan eligibility and debt-to-income ratio.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  Base Income *
                  <span className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      Enter your base monthly salary or hourly wage converted to monthly (hourly rate × hours per week × 52 ÷ 12). This is your regular, guaranteed income before overtime, bonuses, or commissions. Do not include overtime, bonuses, or commissions here.
                    </span>
                  </span>
                </label>
                <p className="text-sm text-gray-600 mb-2">Enter your base monthly salary (regular pay before overtime/bonuses).</p>
                <input type="number" value={formData.baseIncome} onChange={(e) => handleInputChange('baseIncome', e.target.value)} min="0" step="0.01" placeholder="5000" className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" required />
              </div>
              <div>
                <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  Overtime Income
                  <span className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      Enter your average monthly overtime income. If overtime is consistent, use your average. If it varies, use a conservative 12-month average. Overtime income must be documented with pay stubs showing at least 2 years of consistent overtime.
                    </span>
                  </span>
                </label>
                <p className="text-sm text-gray-600 mb-2">Enter your average monthly overtime pay (if applicable).</p>
                <input type="number" value={formData.overtimeIncome} onChange={(e) => handleInputChange('overtimeIncome', e.target.value)} min="0" step="0.01" placeholder="0" className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" />
              </div>
              <div>
                <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  Bonus Income
                  <span className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      Enter your average monthly bonus income. If you receive annual bonuses, divide the annual amount by 12. If bonuses are quarterly, divide by 3. Bonuses must be documented with pay stubs or tax returns showing at least 2 years of history.
                    </span>
                  </span>
                </label>
                <p className="text-sm text-gray-600 mb-2">Enter your average monthly bonus income (if applicable).</p>
                <input type="number" value={formData.bonusIncome} onChange={(e) => handleInputChange('bonusIncome', e.target.value)} min="0" step="0.01" placeholder="0" className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" />
              </div>
              <div>
                <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  Commission Income
                  <span className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      Enter your average monthly commission income. Use a 12-month average if commissions vary. Commission income must be documented with pay stubs or tax returns showing at least 2 years of consistent commission earnings.
                    </span>
                  </span>
                </label>
                <p className="text-sm text-gray-600 mb-2">Enter your average monthly commission income (if applicable).</p>
                <input type="number" value={formData.commissionIncome} onChange={(e) => handleInputChange('commissionIncome', e.target.value)} min="0" step="0.01" placeholder="0" className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" />
              </div>
            </div>
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5">
              <h4 className="font-bold text-yellow-900 mb-2 text-lg">Total Monthly Income</h4>
              <p className="text-3xl font-bold text-yellow-600">${parseFloat(formData.totalMonthlyIncome || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-sm text-yellow-700 mt-2">This total is calculated automatically from all income sources above.</p>
            </div>
            </div>
          </div>
        );

      case 7: // Assets
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 sm:p-8">
              <h3 className="font-bold text-yellow-900 mb-3 text-xl sm:text-2xl flex items-center gap-3">
                <Info className="w-6 h-6 sm:w-7 sm:h-7" />
                Section 7: Assets
              </h3>
              <p className="text-yellow-800 text-base sm:text-lg leading-relaxed">
                List all your financial assets. Assets demonstrate your financial stability and ability to cover down payment, closing costs, and reserves. Enter amounts in dollars (e.g., 10000 for $10,000). You may be asked to provide bank statements or account statements to verify these amounts.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  Checking Account Balance
                  <span className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      Enter the current balance in all your checking accounts combined. This should match your most recent bank statement. Include all checking accounts you own (individually or jointly).
                    </span>
                  </span>
                </label>
                <p className="text-sm text-gray-600 mb-2">Enter the total balance in all your checking accounts.</p>
                <input type="number" value={formData.checkingAccountBalance} onChange={(e) => handleInputChange('checkingAccountBalance', e.target.value)} min="0" step="0.01" placeholder="0" className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" />
              </div>
              <div>
                <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  Savings Account Balance
                  <span className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      Enter the current balance in all your savings accounts combined. This should match your most recent bank statement. Include all savings accounts you own (individually or jointly).
                    </span>
                  </span>
                </label>
                <p className="text-sm text-gray-600 mb-2">Enter the total balance in all your savings accounts.</p>
                <input type="number" value={formData.savingsAccountBalance} onChange={(e) => handleInputChange('savingsAccountBalance', e.target.value)} min="0" step="0.01" placeholder="0" className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" />
              </div>
              <div>
                <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  Money Market Balance
                  <span className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      Enter the current balance in all your money market accounts combined. Money market accounts are interest-bearing accounts that typically offer higher interest rates than savings accounts. Include all money market accounts you own.
                    </span>
                  </span>
                </label>
                <p className="text-sm text-gray-600 mb-2">Enter the total balance in all your money market accounts.</p>
                <input type="number" value={formData.moneyMarketBalance} onChange={(e) => handleInputChange('moneyMarketBalance', e.target.value)} min="0" step="0.01" placeholder="0" className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" />
              </div>
              <div>
                <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  Retirement Account Value
                  <span className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      Enter the current value of all your retirement accounts combined (401(k), IRA, Roth IRA, 403(b), pension accounts, etc.). Use the most recent statement value. Note: Only a portion of retirement assets may be counted toward reserves depending on loan program.
                    </span>
                  </span>
                </label>
                <p className="text-sm text-gray-600 mb-2">Enter the total value of all your retirement accounts.</p>
                <input type="number" value={formData.retirementAccountValue} onChange={(e) => handleInputChange('retirementAccountValue', e.target.value)} min="0" step="0.01" placeholder="0" className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" />
              </div>
            </div>
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5">
              <h4 className="font-bold text-yellow-900 mb-2 text-lg">Total Assets</h4>
              <p className="text-3xl font-bold text-yellow-600">${parseFloat(formData.totalAssets || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-sm text-yellow-700 mt-2">This total is calculated automatically from all asset values above.</p>
            </div>
            </div>
          </div>
        );

      case 8: // Liabilities
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 sm:p-8">
              <h3 className="font-bold text-yellow-900 mb-3 text-xl sm:text-2xl flex items-center gap-3">
                <Info className="w-6 h-6 sm:w-7 sm:h-7" />
                Section 8: Liabilities
              </h3>
              <p className="text-yellow-800 text-base sm:text-lg leading-relaxed">
                List all your monthly debt payments and liabilities. This information is used to calculate your debt-to-income (DTI) ratio, which is a key factor in loan approval. Enter the minimum monthly payment amounts, not the total balances. Do not include your current housing payment here.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  Credit Card Payments
                  <span className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      Enter the total minimum monthly payment for all your credit cards combined. This is the minimum amount you must pay each month, not the total balance. If you pay off your credit cards in full each month, enter the average monthly payment amount.
                    </span>
                  </span>
                </label>
                <p className="text-sm text-gray-600 mb-2">Enter the total minimum monthly payment for all credit cards.</p>
                <input type="number" value={formData.creditCardPayments} onChange={(e) => handleInputChange('creditCardPayments', e.target.value)} min="0" step="0.01" placeholder="0" className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" />
              </div>
              <div>
                <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  Installment Loan Payments (Auto, Student, etc.)
                  <FormTooltip content="Enter the total monthly payment for all installment loans (auto loans, student loans, personal loans, etc.). Include the monthly payment amount, not the total balance. If you have multiple loans, add all monthly payments together." />
                </label>
                <p className="text-sm text-gray-600 mb-2">Enter the total monthly payment for all installment loans.</p>
                <input type="number" value={formData.installmentLoanPayments} onChange={(e) => handleInputChange('installmentLoanPayments', e.target.value)} min="0" step="0.01" placeholder="0" className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" />
              </div>
              <div>
                <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  Other Monthly Payments
                  <FormTooltip content="Enter the total monthly payment for any other debts not listed above (e.g., child support, alimony, other loans, etc.). Do not include your current housing payment, utilities, or insurance premiums here." />
                </label>
                <p className="text-sm text-gray-600 mb-2">Enter the total monthly payment for other debts (child support, alimony, etc.).</p>
                <input type="number" value={formData.otherMonthlyPayments} onChange={(e) => handleInputChange('otherMonthlyPayments', e.target.value)} min="0" step="0.01" placeholder="0" className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" />
              </div>
            </div>
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-5">
              <h4 className="font-bold text-orange-900 mb-2 text-lg">Total Monthly Liabilities</h4>
              <p className="text-3xl font-bold text-orange-600">${parseFloat(formData.totalMonthlyLiabilities || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-sm text-orange-700 mt-2">This total is calculated automatically from all liability payments above.</p>
            </div>
            </div>
          </div>
        );

      case 9: // Property Information
        return (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 sm:p-8">
              <h3 className="font-bold text-yellow-900 mb-3 text-xl sm:text-2xl flex items-center gap-3">
                <Info className="w-6 h-6 sm:w-7 sm:h-7" />
                Section 9: Subject Property Information
              </h3>
              <p className="text-yellow-800 text-base sm:text-lg leading-relaxed">
                Please provide complete details about the property you are purchasing or refinancing. This information is critical for loan underwriting and helps us determine the appropriate loan amount and terms.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
            <div>
                <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  Subject Property Address *
                  <span className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      The complete street address of the property you are purchasing or refinancing. This is the property that will secure your loan. Include the house number, street name, and unit/apartment number if applicable. This must match the address on your purchase agreement or property deed.
                    </span>
                  </span>
                </label>
                <p className="text-sm text-gray-600 mb-2">Enter the complete street address of the property (house number, street name, apartment/unit if applicable).</p>
                <input 
                  type="text" 
                  value={formData.propertyAddress} 
                  onChange={(e) => handleInputChange('propertyAddress', e.target.value)} 
                  placeholder="Enter the complete street address"
                  className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" 
                  required 
                />
            </div>
              
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                  <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                    City *
                    <span className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                        Enter the city where the property is located. This must match the city on the property deed and purchase agreement.
                      </span>
                    </span>
                  </label>
                  <p className="text-sm text-gray-600 mb-2">Enter the city where the property is located.</p>
                  <input 
                    type="text" 
                    value={formData.propertyCity} 
                    onChange={(e) => handleInputChange('propertyCity', e.target.value)} 
                    className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" 
                    required 
                  />
              </div>
              <div>
                  <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                    State *
                    <span className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                        Enter the 2-letter state abbreviation where the property is located (e.g., CA for California, NY for New York, TX for Texas). This must match the state on the property deed.
                      </span>
                    </span>
                  </label>
                  <p className="text-sm text-gray-600 mb-2">Enter the 2-letter state abbreviation (e.g., CA, NY, TX).</p>
                  <input 
                    type="text" 
                    value={formData.propertyState} 
                    onChange={(e) => handleInputChange('propertyState', e.target.value.toUpperCase())} 
                    placeholder="e.g., CA, NY, TX"
                    maxLength={2}
                    className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900 uppercase" 
                    required 
                  />
              </div>
              <div>
                  <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                    ZIP Code *
                    <span className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                        Enter the 5-digit ZIP code where the property is located. This must match the ZIP code on the property deed and purchase agreement.
                      </span>
                    </span>
                  </label>
                  <p className="text-sm text-gray-600 mb-2">Enter the 5-digit ZIP code.</p>
                  <input 
                    type="text" 
                    value={formData.propertyZipCode} 
                    onChange={(e) => handleInputChange('propertyZipCode', e.target.value)} 
                    placeholder="12345"
                    maxLength={5}
                    className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" 
                    required 
                  />
              </div>
            </div>

              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5 mt-6">
                <h4 className="font-bold text-amber-900 mb-3 text-lg">Property Financial Details</h4>
                <p className="text-amber-800 text-sm mb-4">
                  Enter the purchase price (what you're paying for the property), the appraised value (professional assessment), and your requested loan amount. The down payment will be calculated automatically.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                    <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                      Purchase Price / Property Value *
                      <span className="group relative">
                        <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                        <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                          The total purchase price you agreed to pay for the property. This is the contract price from your purchase agreement. For refinancing, enter the current market value or the appraised value. This amount is used to calculate your down payment and loan-to-value (LTV) ratio.
                        </span>
                      </span>
                    </label>
                    <p className="text-sm text-gray-600 mb-2">Enter the total purchase price from your purchase agreement or the current market value if refinancing.</p>
                    <input 
                      type="number" 
                      value={formData.purchasePrice || formData.propertyValue} 
                      onChange={(e) => {
                        handleInputChange('purchasePrice', e.target.value);
                        handleInputChange('propertyValue', e.target.value);
                      }} 
                      placeholder="500000"
                      className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                      Appraised Value *
                      <span className="group relative">
                        <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                        <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                          The professional appraisal value determined by a licensed appraiser. If you don't have an appraisal yet, enter your best estimate based on comparable properties or a recent appraisal. We will order an official appraisal during loan processing. The appraised value helps determine the maximum loan amount.
                        </span>
                      </span>
                    </label>
                    <p className="text-sm text-gray-600 mb-2">Enter the appraised value if available, or your best estimate. We will order a professional appraisal during processing.</p>
                    <input 
                      type="number" 
                      value={formData.appraisedValue} 
                      onChange={(e) => handleInputChange('appraisedValue', e.target.value)} 
                      placeholder="500000"
                      className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                      Loan Amount Requested *
                      <span className="group relative">
                        <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                        <span className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                          The total amount you want to borrow. This should be less than or equal to the purchase price minus your down payment. The down payment will be calculated automatically as the difference between purchase price and loan amount. Your loan amount cannot exceed the appraised value.
                        </span>
                      </span>
                    </label>
                    <p className="text-sm text-gray-600 mb-2">Enter the amount you want to borrow. Your down payment will be calculated automatically as the difference between purchase price and loan amount.</p>
                    <input 
                      type="number" 
                      value={formData.loanAmount} 
                      onChange={(e) => handleInputChange('loanAmount', e.target.value)} 
                      placeholder="400000"
                      className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-base sm:text-lg font-bold text-gray-800 mb-3">
                      Down Payment
                    </label>
                    <p className="text-sm text-gray-600 mb-2">Calculated automatically from purchase price and loan amount</p>
                    <div className="w-full px-5 py-4 text-base sm:text-lg border-2 border-yellow-300 bg-yellow-50 rounded-xl font-bold text-yellow-800">
                      ${downPaymentAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({downPaymentPercent.toFixed(2)}%)
                    </div>
                  </div>
                </div>

                {purchasePriceNum > 0 && loanAmountNum > 0 && (
                  <div className="mt-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5">
                    <h4 className="font-bold text-yellow-900 mb-2 text-lg">Loan-to-Value (LTV) Ratio</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {((loanAmountNum / purchasePriceNum) * 100).toFixed(2)}%
                    </p>
                    <p className="text-sm text-blue-700 mt-2">
                      This ratio helps determine your loan terms and whether private mortgage insurance (PMI) is required.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 10: // Loan Details
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
              <h3 className="font-bold text-yellow-900 mb-2">Section 10: Loan Details</h3>
              <p className="text-yellow-800 text-sm">Specify loan amount and purpose</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Loan Amount Requested *</label>
                <input type="number" value={formData.loanAmount} onChange={(e) => handleInputChange('loanAmount', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none transition text-gray-900" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Loan Purpose *</label>
                <select value={formData.loanPurpose} onChange={(e) => handleInputChange('loanPurpose', e.target.value)} className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900 cursor-pointer touch-manipulation min-h-[60px] bg-white" required>
                  <option value="">Select Purpose</option>
                  <option value="purchase">Purchase</option>
                  <option value="refinance">Refinance</option>
                  <option value="construction">Construction</option>
                </select>
              </div>
            </div>
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
              <h4 className="font-bold text-yellow-900 mb-2">Loan-to-Value Ratio</h4>
              <p className="text-lg text-yellow-800">
                {formData.propertyValue && formData.loanAmount 
                  ? `${((Number(formData.loanAmount) / Number(formData.propertyValue)) * 100).toFixed(2)}%` 
                  : 'N/A'}
              </p>
            </div>
          </div>
        );

      case 11: // Declarations
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 sm:p-6">
              <h3 className="font-bold text-yellow-900 mb-2 text-lg sm:text-xl">Section 11: Declarations</h3>
              <p className="text-yellow-800 text-sm sm:text-base">Please answer the following declarations truthfully</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
              <label className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-yellow-500 transition cursor-pointer touch-manipulation min-h-[60px]">
                <input 
                  type="checkbox" 
                  checked={formData.propertyForeclosed} 
                  onChange={(e) => handleInputChange('propertyForeclosed', e.target.checked)} 
                  className="mt-1 w-6 h-6 sm:w-7 sm:h-7 rounded border-2 border-gray-300 text-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 cursor-pointer flex-shrink-0 accent-yellow-600" 
                />
                <span className="text-base sm:text-lg text-gray-700 font-medium leading-relaxed pt-0.5">Have you had property foreclosed upon or given title/deed in lieu of foreclosure?</span>
              </label>
              <label className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-yellow-500 transition cursor-pointer touch-manipulation min-h-[60px]">
                <input 
                  type="checkbox" 
                  checked={formData.lawsuitParty} 
                  onChange={(e) => handleInputChange('lawsuitParty', e.target.checked)} 
                  className="mt-1 w-6 h-6 sm:w-7 sm:h-7 rounded border-2 border-gray-300 text-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 cursor-pointer flex-shrink-0 accent-yellow-600" 
                />
                <span className="text-base sm:text-lg text-gray-700 font-medium leading-relaxed pt-0.5">Are you party to a lawsuit?</span>
              </label>
              <label className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-yellow-500 transition cursor-pointer touch-manipulation min-h-[60px]">
                <input 
                  type="checkbox" 
                  checked={formData.loanOnProperty} 
                  onChange={(e) => handleInputChange('loanOnProperty', e.target.checked)} 
                  className="mt-1 w-6 h-6 sm:w-7 sm:h-7 rounded border-2 border-gray-300 text-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 cursor-pointer flex-shrink-0 accent-yellow-600" 
                />
                <span className="text-base sm:text-lg text-gray-700 font-medium leading-relaxed pt-0.5">Are you currently obligated on any loan secured by a property?</span>
              </label>
              <label className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-yellow-500 transition cursor-pointer touch-manipulation min-h-[60px]">
                <input 
                  type="checkbox" 
                  checked={formData.intendToOccupy} 
                  onChange={(e) => handleInputChange('intendToOccupy', e.target.checked)} 
                  className="mt-1 w-6 h-6 sm:w-7 sm:h-7 rounded border-2 border-gray-300 text-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 cursor-pointer flex-shrink-0 accent-yellow-600" 
                />
                <span className="text-base sm:text-lg text-gray-700 font-medium leading-relaxed pt-0.5">Will you occupy the property as your primary residence?</span>
              </label>
            </div>
          </div>
        );

      case 12: // Military Service
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
              <h3 className="font-bold text-yellow-900 mb-2">Section 12: Military Service</h3>
              <p className="text-yellow-800 text-sm">Military service information</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Military Service Status</label>
              <select value={formData.militaryService} onChange={(e) => handleInputChange('militaryService', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none transition text-gray-900">
                <option value="none">No Military Service</option>
                <option value="active">Active Duty</option>
                <option value="reserve">Reserves/National Guard</option>
                <option value="veteran">Veteran</option>
                <option value="surviving_spouse">Surviving Spouse</option>
              </select>
            </div>
          </div>
        );

      case 13: // Demographics
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
              <h3 className="font-bold text-yellow-900 mb-2">Section 13: Demographics (Optional)</h3>
              <p className="text-yellow-800 text-sm">This information is optional and for monitoring purposes</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Citizenship Status</label>
              <select value={formData.citizenship} onChange={(e) => handleInputChange('citizenship', e.target.value)} className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900 cursor-pointer touch-manipulation min-h-[60px] bg-white">
                <option value="us_citizen">U.S. Citizen</option>
                <option value="permanent_resident">Permanent Resident Alien</option>
                <option value="non_permanent_resident">Non-Permanent Resident Alien</option>
              </select>
            </div>
          </div>
        );

      case 14: // Documents
        return (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 sm:p-8">
              <h3 className="font-bold text-yellow-900 mb-3 text-xl sm:text-2xl flex items-center gap-3">
                <Info className="w-6 h-6 sm:w-7 sm:h-7" />
                Section 14: Supporting Documents
              </h3>
              <p className="text-yellow-800 text-base sm:text-lg leading-relaxed">
                Please upload the required documents to support your loan application. These documents are essential for verifying your identity, income, and financial status. All required documents must be submitted for your application to be processed.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-8">
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5">
                <h4 className="font-bold text-red-900 mb-3 text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Required Documents
                </h4>
                <p className="text-red-800 text-sm mb-4">
                  The following documents are mandatory and must be uploaded before submitting your application.
                </p>
              </div>

          <div className="space-y-6">
                <div>
                  <label className="block text-base sm:text-lg font-bold text-gray-800 mb-3">
                    Government-Issued ID * <span className="text-red-600">(Required)</span>
                  </label>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload a clear copy of your valid government-issued photo identification (Driver's License, Passport, or State ID). The document must be current and clearly legible.
                  </p>
                  <input 
                    type="file" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleInputChange('idDocument', file);
                      if (file) {
                        const currentDocs = (formData.uploadedDocuments as File[]) || [];
                        // Check if file already exists to avoid duplicates
                        const exists = currentDocs.some(doc => doc.name === file.name && doc.size === file.size);
                        if (!exists) {
                          handleInputChange('uploadedDocuments', [...currentDocs, file]);
                        }
                      }
                    }} 
                    className="w-full px-5 py-4 text-base border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" 
                    required
                  />
                  {formData.idDocument && (
                    <p className="text-yellow-700 text-sm mt-2 font-medium">✓ ID Document uploaded: {(formData.idDocument as File).name}</p>
                  )}
            </div>

            <div>
                  <label className="block text-base sm:text-lg font-bold text-gray-800 mb-3">
                    Pay Stubs * <span className="text-red-600">(Required)</span>
                  </label>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload your most recent pay stubs (typically the last 2-3 months). If you are self-employed, please upload your most recent tax returns and profit/loss statements instead.
                  </p>
                  <input 
                    type="file" 
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      const paystubFile = files[0] || null;
                      handleInputChange('paystubsDocument', paystubFile);
                      if (files.length > 0) {
                        const currentDocs = (formData.uploadedDocuments as File[]) || [];
                        // Filter out duplicates
                        const newFiles = files.filter(file => 
                          !currentDocs.some(doc => doc.name === file.name && doc.size === file.size)
                        );
                        if (newFiles.length > 0) {
                          handleInputChange('uploadedDocuments', [...currentDocs, ...newFiles]);
                        }
                      }
                    }} 
                    className="w-full px-5 py-4 text-base border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" 
                    required
                  />
                  {formData.paystubsDocument && (
                    <p className="text-yellow-700 text-sm mt-2 font-medium">✓ Pay Stubs uploaded: {(formData.paystubsDocument as File).name}</p>
                  )}
            </div>

                <div className="border-t-2 border-gray-200 pt-6">
                  <label className="block text-base sm:text-lg font-bold text-gray-800 mb-3">
                    Additional Supporting Documents <span className="text-gray-500 text-sm font-normal">(Optional)</span>
                  </label>
                  <p className="text-sm text-gray-600 mb-3">
                    You may upload additional documents such as bank statements, tax returns, W-2s, or other financial documents that support your application.
                  </p>
                  <input 
                    type="file" 
                    multiple 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) {
                        const currentDocs = (formData.uploadedDocuments as File[]) || [];
                        // Avoid duplicates by checking file names
                        const newFiles = files.filter(file => 
                          !currentDocs.some(doc => doc.name === file.name && doc.size === file.size)
                        );
                        handleInputChange('uploadedDocuments', [...currentDocs, ...newFiles]);
                      }
                    }} 
                    className="w-full px-5 py-4 text-base border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900" 
                  />
                  <p className="text-sm text-gray-500 mt-2">Accepted formats: PDF, JPG, PNG (Max 10MB per file)</p>
                </div>
              </div>

            {(formData.uploadedDocuments as File[])?.length > 0 && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5">
                  <h4 className="font-bold text-yellow-900 mb-3 text-lg">
                    Uploaded Documents Summary ({formData.uploadedDocuments ? (formData.uploadedDocuments as File[]).length : 0} file(s))
                  </h4>
                  <ul className="space-y-2">
                  {(formData.uploadedDocuments as File[]).map((file: File, idx: number) => (
                      <li key={idx} className="text-yellow-800 text-sm flex items-center justify-between gap-2 bg-white p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-yellow-600" />
                          <span className="font-medium">{file.name}</span>
                          <span className="text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const currentDocs = (formData.uploadedDocuments as File[]) || [];
                            const updatedDocs = currentDocs.filter((_, i) => i !== idx);
                            handleInputChange('uploadedDocuments', updatedDocs);
                            // Also clear specific document fields if they match
                            if (formData.idDocument && (formData.idDocument as File).name === file.name) {
                              handleInputChange('idDocument', null);
                            }
                            if (formData.paystubsDocument && (formData.paystubsDocument as File).name === file.name) {
                              handleInputChange('paystubsDocument', null);
                            }
                          }}
                          className="text-red-600 hover:text-red-800 active:text-red-900 text-xs font-medium px-3 py-2 rounded hover:bg-red-50 active:bg-red-100 transition touch-manipulation min-h-[36px] min-w-[80px]"
                          aria-label="Remove document"
                        >
                          Remove
                        </button>
                      </li>
                  ))}
                </ul>
                <p className="text-xs text-yellow-700 mt-3">
                  All documents will be uploaded when you submit the application.
                </p>
              </div>
            )}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Step {currentStep + 1}</h3>
            <p className="text-gray-500">This step is being developed...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Logo Header */}
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-2xl shadow-lg p-4 h-24 w-24 relative">
              <Image src="/logo.jpg" alt="LoanTicks" fill className="object-contain" priority />
            </div>
          </div>
        
        {/* Progress Bar */}
        <div className="bg-white rounded-2xl shadow-2xl mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-600 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">URLA 2019 Comprehensive Application</h1>
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="p-6">
            {/* Step Info */}
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-yellow-100 rounded-xl">
                {steps[currentStep].icon && React.createElement(steps[currentStep].icon, { className: "w-6 h-6 text-yellow-600" })}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{steps[currentStep].title}</h2>
                <p className="text-gray-600">{steps[currentStep].description}</p>
              </div>
            </div>

            {/* Step Content */}
            {renderStep()}

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 sticky bottom-0 bg-white pb-4 pt-4 border-t border-gray-200 -mx-6 px-6 z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  prevStep();
                }}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 active:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px] font-medium"
                aria-label="Previous step"
              >
                <ArrowLeft className="w-5 h-5" />
                Previous
              </button>

              {currentStep === steps.length - 1 ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmit();
                  }}
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-yellow-600 to-yellow-600 text-white rounded-xl hover:from-yellow-700 hover:to-yellow-700 active:from-yellow-800 active:to-yellow-800 transition disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px] font-bold shadow-lg hover:shadow-xl"
                  aria-label="Submit application"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Submit Application
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    nextStep();
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-600 text-white rounded-xl hover:from-yellow-700 hover:to-yellow-700 active:from-yellow-800 active:to-yellow-800 transition touch-manipulation min-h-[44px] font-bold shadow-lg hover:shadow-xl"
                  aria-label="Next step"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
