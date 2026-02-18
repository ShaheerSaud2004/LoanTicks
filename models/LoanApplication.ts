import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILoanApplication extends Document {
  userId: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  
  // Section 1a: Borrower Information
  borrowerInfo: {
    firstName: string;
    middleName?: string;
    lastName: string;
    suffix?: string;
    email: string;
    phone: string;
    workPhone?: string;
    cellPhone?: string;
    alternatePhone?: string;
    dateOfBirth: Date;
    ssn: string;
    maritalStatus: 'married' | 'unmarried' | 'separated';
    dependents: number;
    dependentAges?: string;
    preferredContactMethod?: 'phone' | 'email' | 'text';
    
    // Citizenship/Immigration Status
    citizenshipType: 'us_citizen' | 'permanent_resident' | 'non_permanent_resident';
    
    // Credit pull authorization
    creditPullConsent?: boolean;

    // Demographics (for government monitoring - optional)
    creditScore?: number;
    race?: string;
    ethnicity?: string;
    sex?: string;
    demographicInfoProvidedHow?: 'face_to_face' | 'telephone' | 'mail' | 'internet' | 'not_provided';
  };

  // Section 1a-1: Current Address
  currentAddress: {
    street: string;
    unit?: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
    residencyType: 'own' | 'rent' | 'living_rent_free';
    monthlyPayment?: number;
    yearsAtAddress: number;
    monthsAtAddress?: number;
  };

  // Mailing Address (if different from current)
  mailingAddress?: {
    street: string;
    unit?: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };

  // Former Addresses (if less than 2 years at current address)
  formerAddresses?: Array<{
    street: string;
    unit?: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
    residencyType: 'own' | 'rent' | 'living_rent_free';
    monthlyPayment?: number;
    yearsAtAddress: number;
    monthsAtAddress?: number;
  }>;

  // Section 1b: Current Employment/Self-Employment
  employment: {
    employmentStatus: 'employed' | 'self_employed' | 'retired' | 'other';
    employerName?: string;
    phone?: string;
    
    // Employer Address
    street?: string;
    unit?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    
    position?: string;
    startDate?: Date;
    yearsInLineOfWork?: number;
    monthsInLineOfWork?: number;
    isBusinessOwner?: boolean;
    isOwnMoreThan25Percent?: boolean;
    
    // Monthly Income Breakdown
    baseIncome?: number;
    overtime?: number;
    bonus?: number;
    commission?: number;
    militaryEntitlements?: number;
    otherIncome?: number;
    monthlyIncome: number; // Total
  };

  // Section 1c: Additional Employment (if employed less than 2 years or additional jobs)
  additionalEmployment?: Array<{
    employmentStatus: 'employed' | 'self_employed' | 'retired' | 'other';
    employerName: string;
    phone?: string;
    street?: string;
    unit?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    position?: string;
    startDate?: Date;
    endDate?: Date;
    monthlyIncome: number;
  }>;

  // Section 1d: Income from Other Sources
  otherIncomeSources?: Array<{
    type: string; // Alimony, Child Support, Social Security, Disability, Retirement, VA Compensation, etc.
    monthlyAmount: number;
  }>;

  // Section 2a: Financial Information - Assets
  assets: {
    // Checking/Savings accounts
    bankAccounts: Array<{
      accountType: string; // Checking, Savings, Money Market, etc.
      financialInstitution: string;
      accountNumber?: string;
      cashOrMarketValue: number;
    }>;
    
    // Other Assets
    otherAssets?: Array<{
      assetType: string; // Stocks, Bonds, Retirement, Life Insurance, Real Estate, Automobiles, Other
      description?: string;
      cashOrMarketValue: number;
    }>;
  };

  // Section 2b: Financial Information - Liabilities
  liabilities: {
    items: Array<{
      liabilityType: string; // Mortgage, Credit Card, Auto Loan, Student Loan, etc.
      creditorName: string;
      accountNumber?: string;
      monthlyPayment: number;
      monthsLeftToPay?: number;
      unpaidBalance: number;
      toBePaidOff?: boolean; // To be paid off at or before closing
    }>;
    alimony?: number;
    childSupport?: number;
    separateMaintenance?: number;
  };

  // Section 3: Real Estate Owned
  realEstateOwned?: Array<{
    propertyAddress: string;
    city: string;
    state: string;
    zipCode: string;
    propertyStatus: 'sold' | 'pending_sale' | 'retained'; // Intent to sell or property disposition
    intendedOccupancy?: string; // Investment, Second Home, etc.
    propertyValue: number;
    
    // Mortgage Loans on this Property
    mortgageLoans?: Array<{
      creditor: string;
      monthlyMortgagePayment: number;
      unpaidBalance: number;
    }>;
    
    // Expenses
    insurance: number;
    taxes: number;
    hoa?: number;
    
    // Rental Income
    grossRentalIncome?: number;
    netRentalIncome?: number;
  }>;

  // Section 4a: Loan and Property Information
  propertyInfo: {
    loanAmount: number;
    loanPurpose: 'purchase' | 'refinance' | 'other';
    refinancePurpose?: 'cash_out' | 'limited_cash_out' | 'no_cash_out'; // If refinance
    
    // Property Information
    propertyAddress: string;
    unit?: string;
    propertyCity: string;
    propertyState: string;
    propertyZipCode: string;
    numberOfUnits: number; // 1-4 for residential
    propertyValue: number;
    occupancyType: 'primary_residence' | 'second_home' | 'investment_property';
    propertyType: 'single_family' | 'condo' | 'townhouse' | 'multi_family' | 'cooperative' | 'manufactured' | 'other';
    
    // Special Property Types
    isMixedUseProperty?: boolean; // Property with commercial use
    isManufacturedHome?: boolean;
    
    // FHA Secondary Residence
    fhaSecondaryResidence?: boolean;
    
    downPaymentAmount: number;
    downPaymentPercentage: number;
    
    // Title will be held in what name(s)?
    titleHolder?: string;
  };

  // Section 4b: Other New Mortgage Loans on the Property
  additionalMortgages?: Array<{
    creditorName: string;
    lienType: 'first' | 'second' | 'other';
    amount: number;
    monthlyPayment: number;
  }>;

  // Section 4c: Gifts or Grants for this Property
  giftsOrGrants?: Array<{
    source: string; // Community Nonprofit, Employer, Federal Agency, Local Agency, etc.
    cashOrMarketValue: number;
  }>;

  // Legacy field for backward compatibility
  financialInfo: {
    grossMonthlyIncome: number;
    otherIncome?: number;
    otherIncomeSource?: string;
    totalAssets: number;
    totalLiabilities: number;
    checkingAccountBalance: number;
    savingsAccountBalance: number;
  };

  // Section 5: Declarations
  declarations: {
    // Section 5a: About this Property and Your Money for this Loan
    willOccupyAsProperty: boolean; // Will you occupy the property as your primary residence?
    ownershipInterestInLast3Years: boolean; // Have you had an ownership interest in another property in the last 3 years?
    ownershipInterestPropertyType?: string; // If yes, what type?
    ownershipInterestHowHeld?: string; // If yes, how did you hold title?
    
    borrowingDownPayment: boolean; // Are you borrowing any money for this real estate transaction?
    borrowingDownPaymentAmount?: number;
    borrowingDownPaymentSource?: string;
    
    familyRelationshipWithSeller?: boolean; // Purchase: family or business affiliation with seller?
    
    applyingForNewCredit: boolean; // Mortgage on another property not disclosed?
    applyingForNewCreditAmount?: number;
    applyingForNewCreditProperty?: string;
    
    applyingForOtherNewCredit?: boolean; // New credit (installment, credit card) not disclosed?
    
    propertySubjectToLien: boolean; // Will this property be subject to a lien that could take priority?
    
    cosignerOrGuarantor: boolean; // Are you a co-signer or guarantor on any debt or loan?
    cosignerDebtAmount?: number;
    
    // Section 5b: About Your Finances
    outstandingJudgments: boolean; // Are there any outstanding judgments against you?
    federalDebtDelinquent: boolean; // Are you currently delinquent or in default on a Federal debt?
    lawsuitParty: boolean; // Are you party to a lawsuit in which you potentially have any personal financial liability?
    conveyedTitleInLieu: boolean; // Have you conveyed title to any property in lieu of foreclosure in the past 7 years?
    completedPreForeclosureSale: boolean; // Within the past 7 years, have you completed a pre-foreclosure sale or short sale?
    propertyForeclosed: boolean; // Have you had property foreclosed upon in the past 7 years?
    declaredBankruptcy: boolean; // Have you declared bankruptcy within the past 7 years?
    bankruptcyChapter?: string; // If yes, Chapter 7, 11, 12, or 13?
    
    // Legacy fields for compatibility
    loanOnProperty: boolean;
    coMakerOnNote: boolean;
    usCitizen: boolean;
    permanentResident: boolean;
    primaryResidence: boolean;
    intendToOccupy: boolean;
  };

  // Section 7: Military Service
  militaryService?: {
    hasServed: boolean;
    isCurrentlyServing: boolean;
    isRetired: boolean;
    isNonActivatedReservist: boolean;
    isSurvivingSpouse: boolean;
  };

  // Credit Card Information and Borrower Authorization (per LOANATICKS form; no full PAN or CVV stored)
  creditCardAuthorization?: {
    authBorrower1Name?: string;
    authBorrower1SSN?: string;
    authBorrower1DOB?: string;
    authBorrower2Name?: string;
    authBorrower2SSN?: string;
    authBorrower2DOB?: string;
    cardType?: string;
    cardLast4?: string;
    cardExpiration?: string;
    nameOnCard?: string;
    cardBillingAddress?: string;
    amountVerified?: string;
    authorizationAgreed?: boolean;
    authSignature1?: string;
    authDate1?: string;
    authSignature2?: string;
    authDate2?: string;
  };

  // Documents
  documents?: Array<{
    name: string;
    size: number;
    type: string;
    uploadedAt: Date;
    url: string;
    gridFSFileId?: string; // MongoDB GridFS file ID for production storage
    originalName?: string;
    storedName?: string; // Legacy: for backward compatibility
  }>;

  // Employee Assignment & Workflow
  assignedTo?: string; // Employee ID who is working on this application
  assignedAt?: Date;
  
  // Status History & Audit Trail
  statusHistory: Array<{
    status: string;
    changedBy: string; // User ID (employee/admin)
    changedAt: Date;
    notes?: string;
  }>;
  
  // Review & Decision
  reviewedBy?: string; // Employee ID
  reviewedAt?: Date;
  decision?: 'approved' | 'rejected' | 'pending';
  decisionNotes?: string;
  
  // Verification Checklist
  verificationChecklist?: {
    identityDocuments: boolean;
    incomeVerification: boolean;
    propertyInformation: boolean;
    financialDetails: boolean;
    checkedBy?: string; // Employee ID
    checkedAt?: Date;
  };
  
  // Rate Information
  rateQuotes?: any[];
  rateAnalysis?: any;
  rateLastUpdated?: Date;

  // Metadata
  submittedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LoanApplicationSchema = new Schema<ILoanApplication>(
  {
    userId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected'],
      default: 'draft',
    },
    
    borrowerInfo: {
      firstName: { type: String, required: true },
      middleName: String,
      lastName: { type: String, required: true },
      suffix: String,
      email: { type: String, required: true },
      phone: { type: String, required: true },
      workPhone: String,
      cellPhone: String,
      alternatePhone: String,
      dateOfBirth: { type: Date, required: true },
      ssn: { 
        type: String, 
        required: true,
        // Note: In production, this should be encrypted at rest
        // Consider using MongoDB field-level encryption or application-level encryption
        select: false, // Don't return SSN by default in queries
      },
      maritalStatus: {
        type: String,
        enum: ['married', 'unmarried', 'separated'],
        required: true,
      },
      dependents: { type: Number, default: 0 },
      dependentAges: String,
      citizenshipType: {
        type: String,
        enum: ['us_citizen', 'permanent_resident', 'non_permanent_resident'],
        default: 'us_citizen',
      },
      creditPullConsent: { type: Boolean, default: false },
      creditScore: Number,
      race: String,
      ethnicity: String,
      sex: String,
      demographicInfoProvidedHow: String,
    },

    currentAddress: {
      street: { type: String, required: true },
      unit: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: String,
      residencyType: {
        type: String,
        enum: ['own', 'rent', 'living_rent_free'],
        required: true,
      },
      monthlyPayment: Number,
      yearsAtAddress: { type: Number, required: true },
      monthsAtAddress: Number,
    },

    mailingAddress: Schema.Types.Mixed,
    formerAddresses: [Schema.Types.Mixed],

    employment: {
      employmentStatus: {
        type: String,
        enum: ['employed', 'self_employed', 'retired', 'other'],
        required: true,
      },
      employerName: String,
      phone: String,
      street: String,
      unit: String,
      city: String,
      state: String,
      zipCode: String,
      position: String,
      startDate: Date,
      yearsInLineOfWork: Number,
      monthsInLineOfWork: Number,
      isBusinessOwner: Boolean,
      isOwnMoreThan25Percent: Boolean,
      baseIncome: Number,
      overtime: Number,
      bonus: Number,
      commission: Number,
      militaryEntitlements: Number,
      otherIncome: Number,
      monthlyIncome: { type: Number, required: true },
    },

    additionalEmployment: [Schema.Types.Mixed],
    otherIncomeSources: [Schema.Types.Mixed],

    financialInfo: {
      grossMonthlyIncome: { type: Number, required: true },
      otherIncome: Number,
      otherIncomeSource: String,
      totalAssets: { type: Number, required: true },
      totalLiabilities: { type: Number, required: true },
      checkingAccountBalance: { type: Number, default: 0 },
      savingsAccountBalance: { type: Number, default: 0 },
    },

    propertyInfo: {
      loanAmount: { type: Number, required: true },
      loanPurpose: {
        type: String,
        enum: ['purchase', 'refinance', 'other', 'construction'],
        required: true,
      },
      refinancePurpose: String,
      propertyAddress: { type: String, required: true },
      unit: String,
      propertyCity: { type: String, required: true },
      propertyState: { type: String, required: true },
      propertyZipCode: { type: String, required: true },
      numberOfUnits: { type: Number, default: 1 },
      propertyValue: { type: Number, required: true },
      occupancyType: {
        type: String,
        enum: ['primary_residence', 'second_home', 'investment_property'],
        default: 'primary_residence',
      },
      propertyType: {
        type: String,
        enum: ['single_family', 'condo', 'townhouse', 'multi_family', 'cooperative', 'manufactured', 'other'],
        required: true,
      },
      isMixedUseProperty: Boolean,
      isManufacturedHome: Boolean,
      fhaSecondaryResidence: Boolean,
      downPaymentAmount: { type: Number, required: true },
      downPaymentPercentage: { type: Number, required: true },
      titleHolder: String,
    },

    additionalMortgages: [Schema.Types.Mixed],
    giftsOrGrants: [Schema.Types.Mixed],

    assets: {
      bankAccounts: [
        {
          accountType: String,
          financialInstitution: String,
          bankName: String, // legacy
          accountNumber: String,
          cashOrMarketValue: Number,
          balance: Number, // legacy
        },
      ],
      otherAssets: [Schema.Types.Mixed],
    },

    liabilities: {
      items: [
        {
          liabilityType: String,
          creditorName: String,
          accountNumber: String,
          monthlyPayment: Number,
          monthsLeftToPay: Number,
          unpaidBalance: Number,
          toBePaidOff: Boolean,
        },
      ],
      // Legacy fields
      creditCards: [Schema.Types.Mixed],
      loans: [Schema.Types.Mixed],
      alimony: Number,
      childSupport: Number,
      separateMaintenance: Number,
    },

    realEstateOwned: [Schema.Types.Mixed],

    declarations: {
      // Section 5a: About this Property and Your Money
      willOccupyAsProperty: { type: Boolean, default: true },
      ownershipInterestInLast3Years: { type: Boolean, default: false },
      ownershipInterestPropertyType: String,
      ownershipInterestHowHeld: String,
      borrowingDownPayment: { type: Boolean, default: false },
      borrowingDownPaymentAmount: Number,
      borrowingDownPaymentSource: String,
      familyRelationshipWithSeller: Boolean,
      applyingForNewCredit: { type: Boolean, default: false },
      applyingForNewCreditAmount: Number,
      applyingForNewCreditProperty: String,
      applyingForOtherNewCredit: Boolean,
      propertySubjectToLien: { type: Boolean, default: false },
      cosignerOrGuarantor: { type: Boolean, default: false },
      cosignerDebtAmount: Number,
      
      // Section 5b: About Your Finances
      outstandingJudgments: { type: Boolean, default: false },
      federalDebtDelinquent: { type: Boolean, default: false },
      lawsuitParty: { type: Boolean, default: false },
      conveyedTitleInLieu: { type: Boolean, default: false },
      completedPreForeclosureSale: { type: Boolean, default: false },
      propertyForeclosed: { type: Boolean, default: false },
      declaredBankruptcy: { type: Boolean, default: false },
      bankruptcyChapter: String,
      
      // Legacy fields
      loanOnProperty: { type: Boolean, default: false },
      coMakerOnNote: { type: Boolean, default: false },
      usCitizen: { type: Boolean, default: true },
      permanentResident: { type: Boolean, default: false },
      primaryResidence: { type: Boolean, default: true },
      intendToOccupy: { type: Boolean, default: true },
    },

    militaryService: Schema.Types.Mixed,

    creditCardAuthorization: {
      authBorrower1Name: String,
      authBorrower1SSN: String,
      authBorrower1DOB: String,
      authBorrower2Name: String,
      authBorrower2SSN: String,
      authBorrower2DOB: String,
      cardType: String,
      cardLast4: String,
      cardExpiration: String,
      nameOnCard: String,
      cardBillingAddress: String,
      amountVerified: String,
      authorizationAgreed: Boolean,
      authSignature1: String,
      authDate1: String,
      authSignature2: String,
      authDate2: String,
    },

    documents: [
      {
        name: String,
        size: Number,
        type: String,
        uploadedAt: { type: Date, default: Date.now },
        url: String,
        gridFSFileId: String, // MongoDB GridFS file ID
        originalName: String,
        storedName: String, // Legacy: for backward compatibility
      },
    ],

    // Employee Assignment & Workflow
    assignedTo: String,
    assignedAt: Date,
    
    // Status History & Audit Trail
    statusHistory: [
      {
        status: { type: String, required: true },
        changedBy: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        notes: String,
      },
    ],
    
    // Review & Decision
    reviewedBy: String,
    reviewedAt: Date,
    decision: {
      type: String,
      enum: ['approved', 'rejected', 'pending'],
      default: 'pending',
    },
    decisionNotes: String,
    verificationChecklist: {
      identityDocuments: { type: Boolean, default: false },
      incomeVerification: { type: Boolean, default: false },
      propertyInformation: { type: Boolean, default: false },
      financialDetails: { type: Boolean, default: false },
      checkedBy: String,
      checkedAt: Date,
    },
    
    // Rate Information
    rateQuotes: [Schema.Types.Mixed],
    rateAnalysis: Schema.Types.Mixed,
    rateLastUpdated: Date,
    
    // Metadata
    submittedAt: Date,
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
LoanApplicationSchema.index({ userId: 1, status: 1 });
LoanApplicationSchema.index({ createdAt: -1 });

const LoanApplication: Model<ILoanApplication> =
  mongoose.models.LoanApplication ||
  mongoose.model<ILoanApplication>('LoanApplication', LoanApplicationSchema);

export default LoanApplication;

