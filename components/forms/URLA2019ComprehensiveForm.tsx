'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Info
} from 'lucide-react';

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
    uploadedDocuments: []
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
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    await onSubmit(formData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Personal Information
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Section 1a: Personal Information
              </h3>
              <p className="text-blue-800 text-sm">
                Please provide your complete personal information as it appears on your government-issued identification.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Middle Name
                </label>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => handleInputChange('middleName', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Suffix
                </label>
                <select
                  value={formData.suffix}
                  onChange={(e) => handleInputChange('suffix', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Alternate Names (if any)
              </label>
              <input
                type="text"
                value={formData.alternateNames}
                onChange={(e) => handleInputChange('alternateNames', e.target.value)}
                placeholder="e.g., maiden name, former name"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Social Security Number *
                </label>
                <input
                  type="text"
                  value={formData.ssn}
                  onChange={(e) => handleInputChange('ssn', e.target.value)}
                  placeholder="XXX-XX-XXXX"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900"
                  required
                />
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Credit Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Estimated Credit Score
                  </label>
                  <input
                    type="number"
                    min="300"
                    max="850"
                    value={formData.creditScore}
                    onChange={(e) => handleInputChange('creditScore', e.target.value)}
                    placeholder="e.g., 720"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900"
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
              <div className="space-y-2">
                {[
                  { value: 'us_citizen', label: 'US Citizen' },
                  { value: 'permanent_resident', label: 'Permanent Resident Alien' },
                  { value: 'non_permanent_resident', label: 'Non-Permanent Resident Alien' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center text-gray-900">
                    <input
                      type="radio"
                      name="citizenship"
                      value={option.value}
                      checked={formData.citizenship === option.value}
                      onChange={(e) => handleInputChange('citizenship', e.target.value)}
                      className="mr-2"
                    />
                    {option.label}
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Credit Type *
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'individual', label: 'Individual' },
                    { value: 'joint', label: 'Joint Credit' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center text-gray-900">
                      <input
                        type="radio"
                        name="creditType"
                        value={option.value}
                        checked={formData.creditType === option.value}
                        onChange={(e) => handleInputChange('creditType', e.target.value)}
                        className="mr-2"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {formData.creditType === 'joint' && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <h3 className="font-bold text-green-900 mb-2">
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Marital Status *
              </label>
              <select
                value={formData.maritalStatus}
                onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900"
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 1: // Contact Information
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Section 2: Contact Information
              </h3>
              <p className="text-blue-800 text-sm">
                Please provide your contact information. This will be used for loan processing and communications.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Home Phone
                </label>
                <input
                  type="tel"
                  value={formData.homePhone}
                  onChange={(e) => handleInputChange('homePhone', e.target.value)}
                  placeholder="(XXX) XXX-XXXX"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cell Phone *
                </label>
                <input
                  type="tel"
                  value={formData.cellPhone}
                  onChange={(e) => handleInputChange('cellPhone', e.target.value)}
                  placeholder="(XXX) XXX-XXXX"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Work Phone
                </label>
                <input
                  type="tel"
                  value={formData.workPhone}
                  onChange={(e) => handleInputChange('workPhone', e.target.value)}
                  placeholder="(XXX) XXX-XXXX"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Alternate Email Address
              </label>
              <input
                type="email"
                value={formData.alternateEmail}
                onChange={(e) => handleInputChange('alternateEmail', e.target.value)}
                placeholder="alternate.email@example.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Preferred Contact Method *
              </label>
              <div className="space-y-2">
                {[
                  { value: 'phone', label: 'Phone' },
                  { value: 'email', label: 'Email' },
                  { value: 'text', label: 'Text Message' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center text-gray-900">
                    <input
                      type="radio"
                      name="preferredContactMethod"
                      value={option.value}
                      checked={formData.preferredContactMethod === option.value}
                      onChange={(e) => handleInputChange('preferredContactMethod', e.target.value)}
                      className="mr-2"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 2: // Current Address
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Section 3: Current Address
              </h3>
              <p className="text-blue-800 text-sm">
                Please provide your current residential address information.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                value={formData.currentStreet}
                onChange={(e) => handleInputChange('currentStreet', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Unit/Apt Number
                </label>
                <input
                  type="text"
                  value={formData.currentUnit}
                  onChange={(e) => handleInputChange('currentUnit', e.target.value)}
                  placeholder="Apt 1B, Unit 2, etc."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.currentCity}
                  onChange={(e) => handleInputChange('currentCity', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  State *
                </label>
                <select
                  value={formData.currentState}
                  onChange={(e) => handleInputChange('currentState', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900"
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={formData.currentZipCode}
                  onChange={(e) => handleInputChange('currentZipCode', e.target.value)}
                  placeholder="12345"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Housing Status *
              </label>
              <div className="space-y-2">
                {[
                  { value: 'own', label: 'Own' },
                  { value: 'rent', label: 'Rent' },
                  { value: 'live_rent_free', label: 'Live Rent Free' },
                  { value: 'other', label: 'Other' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center text-gray-900">
                    <input
                      type="radio"
                      name="currentHousing"
                      value={option.value}
                      checked={formData.currentHousing === option.value}
                      onChange={(e) => handleInputChange('currentHousing', e.target.value)}
                      className="mr-2"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Monthly Payment
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.currentMonthlyPayment}
                  onChange={(e) => handleInputChange('currentMonthlyPayment', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Years at Current Address *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.yearsAtCurrentAddress}
                  onChange={(e) => handleInputChange('yearsAtCurrentAddress', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900"
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
        );

      case 3: // Prior Address
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <h3 className="font-bold text-blue-900 mb-2">Section 3b: Prior Address</h3>
              <p className="text-blue-800 text-sm">If you lived at your current address for less than 2 years, provide prior address.</p>
            </div>
            {parseInt(formData.yearsAtCurrentAddress) >= 2 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <p className="text-gray-600">No prior address needed (2+ years at current address)</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Prior Street Address</label>
                  <input type="text" value={formData.priorStreet} onChange={(e) => handleInputChange('priorStreet', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                    <input type="text" value={formData.priorCity} onChange={(e) => handleInputChange('priorCity', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                    <input type="text" value={formData.priorState} onChange={(e) => handleInputChange('priorState', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ZIP Code</label>
                    <input type="text" value={formData.priorZipCode} onChange={(e) => handleInputChange('priorZipCode', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Years at Prior Address</label>
                    <input type="number" value={formData.yearsAtPriorAddress} onChange={(e) => handleInputChange('yearsAtPriorAddress', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" />
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 4: // Current Employment
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <h3 className="font-bold text-blue-900 mb-2">Section 5a: Current Employment</h3>
              <p className="text-blue-800 text-sm">Provide details about your current employment</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Employer Name *</label>
                <input type="text" value={formData.employerName} onChange={(e) => handleInputChange('employerName', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Position/Title *</label>
                <input type="text" value={formData.position} onChange={(e) => handleInputChange('position', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Years in Line of Work *</label>
                <input type="number" value={formData.yearsEmployed} onChange={(e) => handleInputChange('yearsEmployed', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Work Phone</label>
                <input type="tel" value={formData.workPhone} onChange={(e) => handleInputChange('workPhone', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" />
              </div>
            </div>
          </div>
        );

      case 5: // Previous Employment  
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <h3 className="font-bold text-blue-900 mb-2">Section 5b: Previous Employment</h3>
              <p className="text-blue-800 text-sm">If less than 2 years at current job, provide previous employment</p>
            </div>
            {parseInt(formData.yearsEmployed) >= 2 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <p className="text-gray-600">No previous employment needed (2+ years at current job)</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Previous Employer</label>
                  <input type="text" value={formData.previousEmployerName} onChange={(e) => handleInputChange('previousEmployerName', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Previous Position</label>
                  <input type="text" value={formData.previousPosition} onChange={(e) => handleInputChange('previousPosition', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Years at Previous Job</label>
                  <input type="number" value={formData.previousYearsEmployed} onChange={(e) => handleInputChange('previousYearsEmployed', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" />
                </div>
              </div>
            )}
          </div>
        );

      case 6: // Income Details
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <h3 className="font-bold text-blue-900 mb-2">Section 6: Income Details</h3>
              <p className="text-blue-800 text-sm">Provide detailed breakdown of your monthly income</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Base Income *</label>
                <input type="number" value={formData.baseIncome} onChange={(e) => handleInputChange('baseIncome', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Overtime Income</label>
                <input type="number" value={formData.overtimeIncome} onChange={(e) => handleInputChange('overtimeIncome', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bonus Income</label>
                <input type="number" value={formData.bonusIncome} onChange={(e) => handleInputChange('bonusIncome', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Commission Income</label>
                <input type="number" value={formData.commissionIncome} onChange={(e) => handleInputChange('commissionIncome', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" />
              </div>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <h4 className="font-bold text-green-900 mb-1">Total Monthly Income</h4>
              <p className="text-2xl font-bold text-green-600">${formData.totalMonthlyIncome || '0'}</p>
            </div>
          </div>
        );

      case 7: // Assets
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <h3 className="font-bold text-blue-900 mb-2">Section 7: Assets</h3>
              <p className="text-blue-800 text-sm">List your financial assets</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Checking Account Balance</label>
                <input type="number" value={formData.checkingAccountBalance} onChange={(e) => handleInputChange('checkingAccountBalance', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Savings Account Balance</label>
                <input type="number" value={formData.savingsAccountBalance} onChange={(e) => handleInputChange('savingsAccountBalance', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Money Market Balance</label>
                <input type="number" value={formData.moneyMarketBalance} onChange={(e) => handleInputChange('moneyMarketBalance', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Retirement Account Value</label>
                <input type="number" value={formData.retirementAccountValue} onChange={(e) => handleInputChange('retirementAccountValue', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" />
              </div>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <h4 className="font-bold text-green-900 mb-1">Total Assets</h4>
              <p className="text-2xl font-bold text-green-600">${formData.totalAssets || '0'}</p>
            </div>
          </div>
        );

      case 8: // Liabilities
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <h3 className="font-bold text-blue-900 mb-2">Section 8: Liabilities</h3>
              <p className="text-blue-800 text-sm">List your monthly debts and liabilities</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Credit Card Payments</label>
                <input type="number" value={formData.creditCardPayments} onChange={(e) => handleInputChange('creditCardPayments', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Installment Loan Payments (Auto, Student, etc.)</label>
                <input type="number" value={formData.installmentLoanPayments} onChange={(e) => handleInputChange('installmentLoanPayments', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Other Monthly Payments</label>
                <input type="number" value={formData.otherMonthlyPayments} onChange={(e) => handleInputChange('otherMonthlyPayments', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" />
              </div>
            </div>
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
              <h4 className="font-bold text-orange-900 mb-1">Total Monthly Liabilities</h4>
              <p className="text-2xl font-bold text-orange-600">${formData.totalMonthlyLiabilities || '0'}</p>
            </div>
          </div>
        );

      case 9: // Property Information
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <h3 className="font-bold text-blue-900 mb-2">Section 9: Property Information</h3>
              <p className="text-blue-800 text-sm">Details about the property</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Property Address *</label>
              <input type="text" value={formData.propertyAddress} onChange={(e) => handleInputChange('propertyAddress', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                <input type="text" value={formData.propertyCity} onChange={(e) => handleInputChange('propertyCity', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">State *</label>
                <input type="text" value={formData.propertyState} onChange={(e) => handleInputChange('propertyState', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">ZIP Code *</label>
                <input type="text" value={formData.propertyZipCode} onChange={(e) => handleInputChange('propertyZipCode', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Property Value *</label>
              <input type="number" value={formData.propertyValue} onChange={(e) => handleInputChange('propertyValue', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" required />
            </div>
          </div>
        );

      case 10: // Loan Details
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <h3 className="font-bold text-blue-900 mb-2">Section 10: Loan Details</h3>
              <p className="text-blue-800 text-sm">Specify loan amount and purpose</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Loan Amount Requested *</label>
                <input type="number" value={formData.loanAmount} onChange={(e) => handleInputChange('loanAmount', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Loan Purpose *</label>
                <select value={formData.loanPurpose} onChange={(e) => handleInputChange('loanPurpose', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" required>
                  <option value="">Select Purpose</option>
                  <option value="purchase">Purchase</option>
                  <option value="refinance">Refinance</option>
                  <option value="construction">Construction</option>
                </select>
              </div>
            </div>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <h4 className="font-bold text-blue-900 mb-2">Loan-to-Value Ratio</h4>
              <p className="text-lg text-blue-800">
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
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <h3 className="font-bold text-blue-900 mb-2">Section 11: Declarations</h3>
              <p className="text-blue-800 text-sm">Please answer the following declarations truthfully</p>
            </div>
            <div className="space-y-4">
              <label className="flex items-start">
                <input type="checkbox" checked={formData.propertyForeclosed} onChange={(e) => handleInputChange('propertyForeclosed', e.target.checked)} className="mt-1 mr-3" />
                <span className="text-gray-700">Have you had property foreclosed upon or given title/deed in lieu of foreclosure?</span>
              </label>
              <label className="flex items-start">
                <input type="checkbox" checked={formData.lawsuitParty} onChange={(e) => handleInputChange('lawsuitParty', e.target.checked)} className="mt-1 mr-3" />
                <span className="text-gray-700">Are you party to a lawsuit?</span>
              </label>
              <label className="flex items-start">
                <input type="checkbox" checked={formData.loanOnProperty} onChange={(e) => handleInputChange('loanOnProperty', e.target.checked)} className="mt-1 mr-3" />
                <span className="text-gray-700">Are you currently obligated on any loan secured by a property?</span>
              </label>
              <label className="flex items-start">
                <input type="checkbox" checked={formData.intendToOccupy} onChange={(e) => handleInputChange('intendToOccupy', e.target.checked)} className="mt-1 mr-3" />
                <span className="text-gray-700">Will you occupy the property as your primary residence?</span>
              </label>
            </div>
          </div>
        );

      case 12: // Military Service
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <h3 className="font-bold text-blue-900 mb-2">Section 12: Military Service</h3>
              <p className="text-blue-800 text-sm">Military service information</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Military Service Status</label>
              <select value={formData.militaryService} onChange={(e) => handleInputChange('militaryService', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900">
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
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <h3 className="font-bold text-blue-900 mb-2">Section 13: Demographics (Optional)</h3>
              <p className="text-blue-800 text-sm">This information is optional and for monitoring purposes</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Citizenship Status</label>
              <select value={formData.citizenship} onChange={(e) => handleInputChange('citizenship', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900">
                <option value="us_citizen">U.S. Citizen</option>
                <option value="permanent_resident">Permanent Resident Alien</option>
                <option value="non_permanent_resident">Non-Permanent Resident Alien</option>
              </select>
            </div>
          </div>
        );

      case 14: // Documents
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <h3 className="font-bold text-blue-900 mb-2">Section 14: Documents Upload</h3>
              <p className="text-blue-800 text-sm">Upload supporting documents (optional)</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Documents</label>
              <input type="file" multiple onChange={(e) => handleInputChange('uploadedDocuments', Array.from(e.target.files || []))} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-gray-900" />
              <p className="text-sm text-gray-500 mt-2">Accepted: PDF, JPG, PNG (Max 10MB each)</p>
            </div>
            {(formData.uploadedDocuments as File[])?.length > 0 && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <h4 className="font-bold text-green-900 mb-2">Files Selected:</h4>
                <ul className="space-y-1">
                  {(formData.uploadedDocuments as File[]).map((file: File, idx: number) => (
                    <li key={idx} className="text-green-800 text-sm">• {file.name}</li>
                  ))}
                </ul>
              </div>
            )}
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
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-600 to-teal-500">
      <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Logo Header */}
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-2xl shadow-lg p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpg" alt="LOANATICKS" className="h-16 w-16 object-contain" />
            </div>
          </div>
        
        {/* Progress Bar */}
        <div className="bg-white rounded-2xl shadow-2xl mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
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
              <div className="p-3 bg-green-100 rounded-xl">
                {steps[currentStep].icon && React.createElement(steps[currentStep].icon, { className: "w-6 h-6 text-green-600" })}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{steps[currentStep].title}</h2>
                <p className="text-gray-600">{steps[currentStep].description}</p>
              </div>
            </div>

            {/* Step Content */}
            {renderStep()}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-5 h-5" />
                Previous
              </button>

              {currentStep === steps.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition"
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
