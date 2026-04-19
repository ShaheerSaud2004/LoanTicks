/**
 * Seeds users + one submitted loan application for local E2E (customer → employee → admin).
 * Run: npx tsx scripts/e2e-workflow-seed.ts
 * Uses passwords from scripts/seed.ts (12+ chars, meets User model).
 */
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

import connectDB from '../lib/mongodb';
import User from '../models/User';
import LoanApplication from '../models/LoanApplication';
import { encryptSensitiveData } from '../lib/encryption';

const USERS = [
  {
    name: 'E2E Admin',
    email: 'e2e-admin@loanaticks.com',
    password: 'Admin123!@#$',
    role: 'admin' as const,
    phone: '+1-555-0201',
  },
  {
    name: 'E2E Employee',
    email: 'e2e-employee@loanaticks.com',
    password: 'Employee123!@#',
    role: 'employee' as const,
    phone: '+1-555-0202',
  },
  {
    name: 'E2E Customer',
    email: 'e2e-customer@loanaticks.com',
    password: 'Customer123!@#',
    role: 'customer' as const,
    phone: '+1-555-0203',
  },
];

function buildApplication(userId: string) {
  const ssnPlain = '987-65-4321';
  let ssnStored: string;
  try {
    ssnStored = encryptSensitiveData(ssnPlain);
  } catch {
    ssnStored = ssnPlain;
  }

  return {
    userId,
    status: 'submitted' as const,
    borrowerInfo: {
      firstName: 'E2EWorkflow',
      middleName: '',
      lastName: 'Borrower',
      suffix: '',
      email: 'e2e-customer@loanaticks.com',
      phone: '(555) 444-0100',
      cellPhone: '(555) 444-0100',
      dateOfBirth: new Date('1988-04-12'),
      ssn: ssnStored,
      maritalStatus: 'unmarried' as const,
      dependents: 0,
      citizenshipType: 'us_citizen' as const,
      creditPullConsent: true,
      creditScore: 720,
      race: '',
      ethnicity: '',
      sex: '',
      preferredContactMethod: 'email' as const,
    },
    currentAddress: {
      street: '500 E2E Test Lane',
      unit: '',
      city: 'Houston',
      state: 'TX',
      zipCode: '77002',
      residencyType: 'rent' as const,
      monthlyPayment: 1800,
      yearsAtAddress: 4,
    },
    employment: {
      employmentStatus: 'employed' as const,
      employerName: 'E2E Employer LLC',
      position: 'Engineer',
      phone: '(555) 444-0200',
      monthlyIncome: 9200,
      yearsInLineOfWork: 6,
    },
    financialInfo: {
      grossMonthlyIncome: 9200,
      otherIncome: 0,
      otherIncomeSource: '',
      totalAssets: 62000,
      totalLiabilities: 400,
      checkingAccountBalance: 12000,
      savingsAccountBalance: 50000,
    },
    assets: {
      bankAccounts: [
        { accountType: 'Checking', financialInstitution: 'Test Bank', cashOrMarketValue: 12000 },
        { accountType: 'Savings', financialInstitution: 'Test Bank', cashOrMarketValue: 50000 },
      ],
    },
    liabilities: { items: [] as unknown[] },
    propertyInfo: {
      loanAmount: 425000,
      loanPurpose: 'purchase' as const,
      propertyAddress: '900 E2E Property Rd',
      propertyCity: 'Houston',
      propertyState: 'TX',
      propertyZipCode: '77003',
      numberOfUnits: 1,
      propertyValue: 550000,
      occupancyType: 'primary_residence' as const,
      propertyType: 'single_family' as const,
      downPaymentAmount: 125000,
      downPaymentPercentage: (125000 / 550000) * 100,
    },
    declarations: {
      willOccupyAsProperty: true,
      ownershipInterestInLast3Years: false,
      familyRelationshipWithSeller: false,
      borrowingDownPayment: false,
      applyingForNewCredit: false,
      applyingForOtherNewCredit: false,
      propertySubjectToLien: false,
      cosignerOrGuarantor: false,
      outstandingJudgments: false,
      federalDebtDelinquent: false,
      lawsuitParty: false,
      conveyedTitleInLieu: false,
      completedPreForeclosureSale: false,
      propertyForeclosed: false,
      declaredBankruptcy: false,
      loanOnProperty: false,
      coMakerOnNote: false,
      usCitizen: true,
      permanentResident: false,
      primaryResidence: true,
      intendToOccupy: true,
    },
    statusHistory: [
      {
        status: 'submitted',
        changedBy: userId,
        changedAt: new Date(),
        notes: 'E2E seed application',
      },
    ],
    submittedAt: new Date(),
    decision: 'pending' as const,
  };
}

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI required (.env.local)');
    process.exit(1);
  }

  await connectDB();

  for (const u of USERS) {
    let user = await User.findOne({ email: u.email });
    if (!user) {
      user = new User({
        name: u.name,
        email: u.email,
        password: u.password,
        role: u.role,
        phone: u.phone,
        isApproved: true,
        provider: 'credentials',
      });
      await user.save();
      console.log(`Created user ${u.email}`);
    } else {
      user.name = u.name;
      user.password = u.password;
      user.role = u.role;
      user.isApproved = true;
      user.provider = 'credentials';
      user.providerId = undefined;
      await user.save();
      console.log(`Updated user ${u.email}`);
    }
  }

  const customer = await User.findOne({ email: 'e2e-customer@loanaticks.com' });
  if (!customer) throw new Error('Customer missing');
  const uid = customer._id.toString();

  await LoanApplication.deleteMany({ userId: uid });
  const doc = new LoanApplication(buildApplication(uid));
  await doc.save();
  const id = doc._id.toString();
  console.log(`Created loan application ${id} for e2e-customer`);

  // Marker consumed by e2e-workflow-browser.mjs
  console.log(`//E2E_RESULT:${JSON.stringify({ applicationId: id, customerEmail: USERS[2].email, employeeEmail: USERS[1].email, adminEmail: USERS[0].email })}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
