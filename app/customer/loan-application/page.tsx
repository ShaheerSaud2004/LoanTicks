'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  User, 
  Home, 
  Briefcase, 
  DollarSign, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Save
} from 'lucide-react';

export default function LoanApplicationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    // Borrower Info
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    ssn: '',
    maritalStatus: 'unmarried',
    dependents: 0,
    
    // Current Address
    street: '',
    unit: '',
    city: '',
    state: '',
    zipCode: '',
    residencyType: 'rent',
    monthlyPayment: '',
    yearsAtAddress: '',
    
    // Employment
    employmentStatus: 'employed',
    employerName: '',
    position: '',
    yearsEmployed: '',
    monthlyIncome: '',
    employerPhone: '',
    
    // Financial
    grossMonthlyIncome: '',
    otherIncome: '',
    otherIncomeSource: '',
    checkingAccountBalance: '',
    savingsAccountBalance: '',
    
    // Property & Loan
    propertyAddress: '',
    propertyCity: '',
    propertyState: '',
    propertyZipCode: '',
    propertyType: 'single_family',
    propertyValue: '',
    loanAmount: '',
    loanPurpose: 'purchase',
    downPaymentAmount: '',
    
    // Declarations
    outstandingJudgments: false,
    declaredBankruptcy: false,
    propertyForeclosed: false,
    lawsuitParty: false,
    usCitizen: true,
    primaryResidence: true,
  });

  const steps = [
    { title: 'Personal Information', icon: User },
    { title: 'Address', icon: Home },
    { title: 'Employment', icon: Briefcase },
    { title: 'Financial Info', icon: DollarSign },
    { title: 'Property & Loan', icon: FileText },
    { title: 'Declarations', icon: CheckCircle },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/loan-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'submitted',
          borrowerInfo: {
            firstName: formData.firstName || 'Test',
            middleName: formData.middleName,
            lastName: formData.lastName || 'User',
            email: formData.email || 'test@example.com',
            phone: formData.phone || '555-0000',
            dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : new Date('1990-01-01'),
            ssn: formData.ssn || '000-00-0000',
            maritalStatus: formData.maritalStatus,
            dependents: Number(formData.dependents),
          },
          currentAddress: {
            street: formData.street || 'Test Street',
            unit: formData.unit,
            city: formData.city || 'Test City',
            state: formData.state || 'CA',
            zipCode: formData.zipCode || '00000',
            residencyType: formData.residencyType,
            monthlyPayment: Number(formData.monthlyPayment) || 0,
            yearsAtAddress: Number(formData.yearsAtAddress) || 1,
          },
          employment: {
            employmentStatus: formData.employmentStatus,
            employerName: formData.employerName,
            position: formData.position,
            yearsEmployed: Number(formData.yearsEmployed) || 0,
            monthlyIncome: Number(formData.monthlyIncome) || 1000,
            employerPhone: formData.employerPhone,
          },
          financialInfo: {
            grossMonthlyIncome: Number(formData.grossMonthlyIncome) || 1000,
            otherIncome: Number(formData.otherIncome) || 0,
            otherIncomeSource: formData.otherIncomeSource,
            totalAssets: (Number(formData.checkingAccountBalance) || 0) + (Number(formData.savingsAccountBalance) || 0),
            totalLiabilities: 0,
            checkingAccountBalance: Number(formData.checkingAccountBalance) || 0,
            savingsAccountBalance: Number(formData.savingsAccountBalance) || 0,
          },
          propertyInfo: {
            propertyAddress: formData.propertyAddress || 'Test Property',
            propertyCity: formData.propertyCity || 'Test City',
            propertyState: formData.propertyState || 'CA',
            propertyZipCode: formData.propertyZipCode || '00000',
            propertyType: formData.propertyType,
            propertyValue: Number(formData.propertyValue) || 100000,
            loanAmount: Number(formData.loanAmount) || 50000,
            loanPurpose: formData.loanPurpose,
            downPaymentAmount: Number(formData.downPaymentAmount) || 10000,
            downPaymentPercentage: ((Number(formData.downPaymentAmount) || 10000) / (Number(formData.propertyValue) || 100000)) * 100,
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
            declaredBankruptcy: formData.declaredBankruptcy,
            propertyForeclosed: formData.propertyForeclosed,
            lawsuitParty: formData.lawsuitParty,
            loanOnProperty: false,
            coMakerOnNote: false,
            usCitizen: formData.usCitizen,
            permanentResident: !formData.usCitizen,
            primaryResidence: formData.primaryResidence,
          },
          submittedAt: new Date(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Show success message with application ID
        const successMessage = `
🎉 Application Submitted Successfully!

Your loan application has been received and is now under review.

Application ID: ${data.applicationId?.slice(-8) || 'Pending'}
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
                Loan Application
              </h1>
              <p className="text-lg text-white/90">
                Uniform Residential Loan Application (URLA)
              </p>
            </div>

            <div className="p-8 sm:p-12">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Welcome to Your Loan Application
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  This application will help us understand your financial situation and property needs. 
                  The process is divided into 6 simple steps and should take approximately 15-20 minutes to complete.
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
                    <span>Personal information (SSN, Date of Birth)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Current address and employment details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Financial information (income, assets, debts)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Property and loan details</span>
                  </li>
                </ul>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl font-bold text-green-600 mb-1">6</div>
                  <div className="text-sm text-gray-600">Easy Steps</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl font-bold text-green-600 mb-1">15-20</div>
                  <div className="text-sm text-gray-600">Minutes</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl font-bold text-green-600 mb-1">100%</div>
                  <div className="text-sm text-gray-600">Secure</div>
                </div>
              </div>

              <button
                onClick={() => setShowWelcome(false)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                Start Application
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    index === currentStep 
                      ? 'bg-green-600 text-white' 
                      : index < currentStep 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className={`text-xs text-center hidden sm:block ${
                    index === currentStep ? 'text-green-600 font-semibold' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div 
                key={index} 
                className={`h-2 flex-1 rounded-full ${
                  index <= currentStep ? 'bg-green-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {steps[currentStep].title}
          </h2>

          {/* Step 0: Personal Information */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Social Security Number *
                  </label>
                  <input
                    type="text"
                    name="ssn"
                    value={formData.ssn}
                    onChange={handleInputChange}
                    placeholder="XXX-XX-XXXX"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Marital Status *
                  </label>
                  <select
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  >
                    <option value="unmarried">Unmarried</option>
                    <option value="married">Married</option>
                    <option value="separated">Separated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Number of Dependents
                  </label>
                  <input
                    type="number"
                    name="dependents"
                    value={formData.dependents}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Address */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Unit/Apt #
                  </label>
                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Residency Type *
                  </label>
                  <select
                    name="residencyType"
                    value={formData.residencyType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  >
                    <option value="own">Own</option>
                    <option value="rent">Rent</option>
                    <option value="living_rent_free">Living Rent Free</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Monthly Payment
                  </label>
                  <input
                    type="number"
                    name="monthlyPayment"
                    value={formData.monthlyPayment}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Years at Address *
                  </label>
                  <input
                    type="number"
                    name="yearsAtAddress"
                    value={formData.yearsAtAddress}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Employment */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Employment Status *
                  </label>
                  <select
                    name="employmentStatus"
                    value={formData.employmentStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  >
                    <option value="employed">Employed</option>
                    <option value="self_employed">Self-Employed</option>
                    <option value="retired">Retired</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Employer Name
                  </label>
                  <input
                    type="text"
                    name="employerName"
                    value={formData.employerName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Position/Title
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Years Employed
                  </label>
                  <input
                    type="number"
                    name="yearsEmployed"
                    value={formData.yearsEmployed}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Monthly Income *
                  </label>
                  <input
                    type="number"
                    name="monthlyIncome"
                    value={formData.monthlyIncome}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Employer Phone
                  </label>
                  <input
                    type="tel"
                    name="employerPhone"
                    value={formData.employerPhone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Financial Info */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gross Monthly Income *
                  </label>
                  <input
                    type="number"
                    name="grossMonthlyIncome"
                    value={formData.grossMonthlyIncome}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Other Monthly Income
                  </label>
                  <input
                    type="number"
                    name="otherIncome"
                    value={formData.otherIncome}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Other Income Source
                  </label>
                  <input
                    type="text"
                    name="otherIncomeSource"
                    value={formData.otherIncomeSource}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Checking Account Balance
                  </label>
                  <input
                    type="number"
                    name="checkingAccountBalance"
                    value={formData.checkingAccountBalance}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Savings Account Balance
                  </label>
                  <input
                    type="number"
                    name="savingsAccountBalance"
                    value={formData.savingsAccountBalance}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Property & Loan */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Property Address *
                  </label>
                  <input
                    type="text"
                    name="propertyAddress"
                    value={formData.propertyAddress}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="propertyCity"
                    value={formData.propertyCity}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="propertyState"
                    value={formData.propertyState}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    name="propertyZipCode"
                    value={formData.propertyZipCode}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Property Type *
                  </label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  >
                    <option value="single_family">Single Family</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="multi_family">Multi-Family</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Property Value *
                  </label>
                  <input
                    type="number"
                    name="propertyValue"
                    value={formData.propertyValue}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Loan Amount *
                  </label>
                  <input
                    type="number"
                    name="loanAmount"
                    value={formData.loanAmount}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Loan Purpose *
                  </label>
                  <select
                    name="loanPurpose"
                    value={formData.loanPurpose}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  >
                    <option value="purchase">Purchase</option>
                    <option value="refinance">Refinance</option>
                    <option value="construction">Construction</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Down Payment *
                  </label>
                  <input
                    type="number"
                    name="downPaymentAmount"
                    value={formData.downPaymentAmount}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Declarations */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                Please answer the following questions truthfully:
              </p>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                  <input
                    type="checkbox"
                    name="outstandingJudgments"
                    checked={formData.outstandingJudgments}
                    onChange={handleInputChange}
                    className="mt-1 w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-gray-700">
                    Are there any outstanding judgments against you?
                  </span>
                </label>
                <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                  <input
                    type="checkbox"
                    name="declaredBankruptcy"
                    checked={formData.declaredBankruptcy}
                    onChange={handleInputChange}
                    className="mt-1 w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-gray-700">
                    Have you declared bankruptcy in the past 7 years?
                  </span>
                </label>
                <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                  <input
                    type="checkbox"
                    name="propertyForeclosed"
                    checked={formData.propertyForeclosed}
                    onChange={handleInputChange}
                    className="mt-1 w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-gray-700">
                    Have you had property foreclosed upon in the last 7 years?
                  </span>
                </label>
                <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                  <input
                    type="checkbox"
                    name="lawsuitParty"
                    checked={formData.lawsuitParty}
                    onChange={handleInputChange}
                    className="mt-1 w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-gray-700">
                    Are you a party to a lawsuit?
                  </span>
                </label>
                <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                  <input
                    type="checkbox"
                    name="usCitizen"
                    checked={formData.usCitizen}
                    onChange={handleInputChange}
                    className="mt-1 w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-gray-700">
                    Are you a U.S. citizen?
                  </span>
                </label>
                <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                  <input
                    type="checkbox"
                    name="primaryResidence"
                    checked={formData.primaryResidence}
                    onChange={handleInputChange}
                    className="mt-1 w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-gray-700">
                    Will this be your primary residence?
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 0}
              className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Previous
            </button>

            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Save className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <CheckCircle className="w-5 h-5" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

