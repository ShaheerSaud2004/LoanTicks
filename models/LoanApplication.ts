import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILoanApplication extends Document {
  userId: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  
  // Section 1: Borrower Information
  borrowerInfo: {
    firstName: string;
    middleName?: string;
    lastName: string;
    suffix?: string;
    email: string;
    phone: string;
    alternatePhone?: string;
    dateOfBirth: Date;
    ssn: string;
    maritalStatus: 'married' | 'unmarried' | 'separated';
    dependents: number;
    creditScore?: number;
    race?: string;
    ethnicity?: string;
    sex?: string;
  };

  // Section 2: Current Address
  currentAddress: {
    street: string;
    unit?: string;
    city: string;
    state: string;
    zipCode: string;
    residencyType: 'own' | 'rent' | 'living_rent_free';
    monthlyPayment?: number;
    yearsAtAddress: number;
  };

  // Section 3: Employment Information
  employment: {
    employmentStatus: 'employed' | 'self_employed' | 'retired' | 'other';
    employerName?: string;
    position?: string;
    yearsEmployed?: number;
    monthlyIncome: number;
    employerPhone?: string;
    employerAddress?: string;
  };

  // Section 4: Financial Information
  financialInfo: {
    grossMonthlyIncome: number;
    otherIncome?: number;
    otherIncomeSource?: string;
    totalAssets: number;
    totalLiabilities: number;
    checkingAccountBalance: number;
    savingsAccountBalance: number;
  };

  // Section 5: Property and Loan Information
  propertyInfo: {
    propertyAddress: string;
    propertyCity: string;
    propertyState: string;
    propertyZipCode: string;
    propertyType: 'single_family' | 'condo' | 'townhouse' | 'multi_family';
    propertyValue: number;
    loanAmount: number;
    loanPurpose: 'purchase' | 'refinance' | 'construction';
    downPaymentAmount: number;
    downPaymentPercentage: number;
  };

  // Section 6: Assets
  assets: {
    bankAccounts: Array<{
      bankName: string;
      accountType: string;
      balance: number;
    }>;
    otherAssets?: string;
  };

  // Section 7: Liabilities
  liabilities: {
    creditCards: Array<{
      creditor: string;
      monthlyPayment: number;
      balance: number;
    }>;
    loans: Array<{
      loanType: string;
      creditor: string;
      monthlyPayment: number;
      balance: number;
    }>;
  };

  // Section 8: Declarations
  declarations: {
    outstandingJudgments: boolean;
    declaredBankruptcy: boolean;
    propertyForeclosed: boolean;
    lawsuitParty: boolean;
    loanOnProperty: boolean;
    coMakerOnNote: boolean;
    usCitizen: boolean;
    permanentResident: boolean;
    primaryResidence: boolean;
    intendToOccupy: boolean;
  };

  // Documents
  documents?: Array<{
    name: string;
    size: number;
    type: string;
    uploadedAt: Date;
    url: string;
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
      alternatePhone: String,
      dateOfBirth: { type: Date, required: true },
      ssn: { type: String, required: true },
      maritalStatus: {
        type: String,
        enum: ['married', 'unmarried', 'separated'],
        required: true,
      },
      dependents: { type: Number, default: 0 },
      creditScore: Number,
      race: String,
      ethnicity: String,
      sex: String,
    },

    currentAddress: {
      street: { type: String, required: true },
      unit: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      residencyType: {
        type: String,
        enum: ['own', 'rent', 'living_rent_free'],
        required: true,
      },
      monthlyPayment: Number,
      yearsAtAddress: { type: Number, required: true },
    },

    employment: {
      employmentStatus: {
        type: String,
        enum: ['employed', 'self_employed', 'retired', 'other'],
        required: true,
      },
      employerName: String,
      position: String,
      yearsEmployed: Number,
      monthlyIncome: { type: Number, required: true },
      employerPhone: String,
      employerAddress: String,
    },

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
      propertyAddress: { type: String, required: true },
      propertyCity: { type: String, required: true },
      propertyState: { type: String, required: true },
      propertyZipCode: { type: String, required: true },
      propertyType: {
        type: String,
        enum: ['single_family', 'condo', 'townhouse', 'multi_family'],
        required: true,
      },
      propertyValue: { type: Number, required: true },
      loanAmount: { type: Number, required: true },
      loanPurpose: {
        type: String,
        enum: ['purchase', 'refinance', 'construction'],
        required: true,
      },
      downPaymentAmount: { type: Number, required: true },
      downPaymentPercentage: { type: Number, required: true },
    },

    assets: {
      bankAccounts: [
        {
          bankName: String,
          accountType: String,
          balance: Number,
        },
      ],
      otherAssets: String,
    },

    liabilities: {
      creditCards: [
        {
          creditor: String,
          monthlyPayment: Number,
          balance: Number,
        },
      ],
      loans: [
        {
          loanType: String,
          creditor: String,
          monthlyPayment: Number,
          balance: Number,
        },
      ],
    },

    declarations: {
      outstandingJudgments: { type: Boolean, default: false },
      declaredBankruptcy: { type: Boolean, default: false },
      propertyForeclosed: { type: Boolean, default: false },
      lawsuitParty: { type: Boolean, default: false },
      loanOnProperty: { type: Boolean, default: false },
      coMakerOnNote: { type: Boolean, default: false },
      usCitizen: { type: Boolean, default: true },
      permanentResident: { type: Boolean, default: false },
      primaryResidence: { type: Boolean, default: true },
      intendToOccupy: { type: Boolean, default: true },
    },

    documents: [
      {
        name: String,
        size: Number,
        type: String,
        uploadedAt: { type: Date, default: Date.now },
        url: String,
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

