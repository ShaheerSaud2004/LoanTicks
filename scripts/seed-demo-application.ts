import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

import mongoose from 'mongoose';
import User from '../models/User';
import LoanApplication from '../models/LoanApplication';
import connectDB from '../lib/mongodb';

const BLANK_DOCUMENTS = [
  { name: 'Government ID (not provided)', size: 0, type: 'application/pdf', uploadedAt: new Date(), url: '' },
  { name: 'Pay Stub – Current (not provided)', size: 0, type: 'application/pdf', uploadedAt: new Date(), url: '' },
  { name: 'Pay Stub – Previous (not provided)', size: 0, type: 'application/pdf', uploadedAt: new Date(), url: '' },
  { name: 'Bank Statement (not provided)', size: 0, type: 'application/pdf', uploadedAt: new Date(), url: '' },
];

function encryptSSN(ssn: string): string {
  try {
    const { encryptSensitiveData } = require('../lib/encryption');
    return encryptSensitiveData(ssn);
  } catch {
    console.warn('⚠️  Encryption not available, using plain text for demo SSN');
    return ssn;
  }
}

// Random demo customer data for admin comparison
const DEMO_APPLICATION = {
  status: 'submitted' as const,
  borrowerInfo: {
    firstName: 'Jamie',
    middleName: 'Lynn',
    lastName: 'Rivera',
    email: 'jamie.rivera@example.com',
    phone: '(512) 555-0198',
    cellPhone: '(512) 555-0198',
    workPhone: '(512) 555-0199',
    dateOfBirth: new Date('1987-09-14'),
    ssn: '', // set below with encryption
    maritalStatus: 'unmarried' as const,
    dependents: 1,
    dependentAges: '6',
    citizenshipType: 'us_citizen' as const,
    preferredContactMethod: 'email' as const,
    creditPullConsent: true,
    creditScore: 698,
  },
  currentAddress: {
    street: '8842 Cedar Creek Dr',
    unit: 'B',
    city: 'Austin',
    state: 'TX',
    zipCode: '78745',
    residencyType: 'rent' as const,
    monthlyPayment: 1850,
    yearsAtAddress: 2,
  },
  employment: {
    employmentStatus: 'employed' as const,
    employerName: 'Lone Star Logistics',
    position: 'Operations Coordinator',
    phone: '(512) 555-0200',
    street: '1200 Industrial Blvd',
    city: 'Austin',
    state: 'TX',
    zipCode: '78758',
    yearsInLineOfWork: 4,
    baseIncome: 4200,
    overtime: 300,
    monthlyIncome: 4500,
  },
  financialInfo: {
    grossMonthlyIncome: 4500,
    otherIncome: 0,
    totalAssets: 28000,
    totalLiabilities: 4200,
    checkingAccountBalance: 8500,
    savingsAccountBalance: 19500,
  },
  assets: {
    bankAccounts: [
      { accountType: 'Checking', financialInstitution: 'Frost Bank', cashOrMarketValue: 8500 },
      { accountType: 'Savings', financialInstitution: 'Frost Bank', cashOrMarketValue: 19500 },
    ],
  },
  liabilities: {
    items: [
      { liabilityType: 'Auto Loan', creditorName: 'Capital One Auto', monthlyPayment: 320, unpaidBalance: 12000 },
      { liabilityType: 'Credit Card', creditorName: 'Discover', monthlyPayment: 85, unpaidBalance: 2200 },
    ],
  },
  propertyInfo: {
    loanAmount: 285000,
    loanPurpose: 'purchase' as const,
    propertyAddress: '4102 Willow Run',
    propertyCity: 'Round Rock',
    propertyState: 'TX',
    propertyZipCode: '78664',
    numberOfUnits: 1,
    propertyValue: 320000,
    propertyType: 'single_family' as const,
    occupancyType: 'primary_residence' as const,
    downPaymentAmount: 35000,
    downPaymentPercentage: 10.94,
  },
  declarations: {
    willOccupyAsProperty: true,
    ownershipInterestInLast3Years: false,
    borrowingDownPayment: false,
    applyingForNewCredit: false,
    propertySubjectToLien: false,
    cosignerOrGuarantor: false,
    outstandingJudgments: false,
    federalDebtDelinquent: false,
    lawsuitParty: false,
    conveyedTitleInLieu: false,
    completedPreForeclosureSale: false,
    propertyForeclosed: false,
    declaredBankruptcy: false,
    bankruptcyWithin7Years: false,
    loanOnProperty: false,
    coMakerOnNote: false,
    usCitizen: true,
    permanentResident: false,
    primaryResidence: true,
    intendToOccupy: true,
  },
  statusHistory: [
    { status: 'submitted', changedBy: '', changedAt: new Date(), notes: 'Demo application – documents blank for comparison' },
  ],
  submittedAt: new Date(),
  decision: 'pending' as const,
};

async function seedDemoApplication() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    const customer = await User.findOne({ role: 'customer' });
    if (!customer) {
      console.error('No customer user found. Run "npm run seed" first to create admin, employee, and customer.');
      process.exit(1);
    }

    DEMO_APPLICATION.borrowerInfo.ssn = encryptSSN('501-62-8847');
    DEMO_APPLICATION.statusHistory[0].changedBy = customer._id.toString();

    const app = new LoanApplication({
      ...DEMO_APPLICATION,
      userId: customer._id.toString(),
    });
    await app.save();
    const appId = app._id.toString();

    await LoanApplication.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(appId) },
      { $set: { documents: BLANK_DOCUMENTS } }
    );

    console.log('\n✅ Demo loan application created (submitted, blank documents).');
    console.log('   Borrower: Jamie Lynn Rivera');
    console.log('   Application ID:', app._id.toString());
    console.log('\n   Log in as admin (admin@loanaticks.com) or employee to view and compare.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding demo application:', error);
    process.exit(1);
  }
}

seedDemoApplication();
