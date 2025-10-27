import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import LoanApplication from '@/models/LoanApplication';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await connectDB();

    const results = {
      timestamp: new Date().toISOString(),
      created: [] as any[],
      summary: { users: 0, applications: 0 }
    };

    // Create demo accounts with clear purposes
    const demoAccounts = [
      {
        name: 'Sarah Johnson (Customer)',
        email: 'sarah.customer@loanticks.com',
        password: 'demo123',
        role: 'customer' as const,
        purpose: 'New customer with no applications'
      },
      {
        name: 'Michael Chen (Customer)',
        email: 'michael.customer@loanticks.com',
        password: 'demo123',
        role: 'customer' as const,
        purpose: 'Customer with pending application'
      },
      {
        name: 'Emily Rodriguez (Customer)',
        email: 'emily.customer@loanticks.com',
        password: 'demo123',
        role: 'customer' as const,
        purpose: 'Customer with approved loan'
      },
      {
        name: 'David Thompson (Customer)',
        email: 'david.customer@loanticks.com',
        password: 'demo123',
        role: 'customer' as const,
        purpose: 'Customer with rejected application'
      },
      {
        name: 'John Smith (Employee)',
        email: 'john.employee@loanticks.com',
        password: 'demo123',
        role: 'employee' as const,
        purpose: 'Employee with assigned applications'
      },
      {
        name: 'Lisa Anderson (Employee)',
        email: 'lisa.employee@loanticks.com',
        password: 'demo123',
        role: 'employee' as const,
        purpose: 'Senior employee with multiple cases'
      },
      {
        name: 'Admin Demo',
        email: 'admin.demo@loanticks.com',
        password: 'demo123',
        role: 'admin' as const,
        purpose: 'Full system access - see everything'
      }
    ];

    // Create all demo accounts
    for (const account of demoAccounts) {
      let user = await User.findOne({ email: account.email });
      
      if (!user) {
        const hashedPassword = await bcrypt.hash(account.password, 12);
        user = new User({
          name: account.name,
          email: account.email,
          password: hashedPassword,
          role: account.role,
          phone: '(555) 000-0000'
        });
        await user.save();
        
        results.created.push({
          type: 'User',
          name: account.name,
          email: account.email,
          role: account.role,
          purpose: account.purpose
        });
        results.summary.users++;
      }
    }

    // Get users for application creation
    const sarah = await User.findOne({ email: 'sarah.customer@loanticks.com' });
    const michael = await User.findOne({ email: 'michael.customer@loanticks.com' });
    const emily = await User.findOne({ email: 'emily.customer@loanticks.com' });
    const david = await User.findOne({ email: 'david.customer@loanticks.com' });
    const john = await User.findOne({ email: 'john.employee@loanticks.com' });
    const lisa = await User.findOne({ email: 'lisa.employee@loanticks.com' });

    // Create demo applications
    const demoApplications = [
      {
        userId: michael?._id.toString(),
        status: 'submitted' as const,
        borrowerInfo: {
          firstName: 'Michael',
          lastName: 'Chen',
          email: 'michael.customer@loanticks.com',
          phone: '(555) 123-4567',
          dateOfBirth: new Date('1985-03-15'),
          ssn: '123-45-6789',
          maritalStatus: 'married' as const,
          dependents: 2,
          creditScore: 740
        },
        currentAddress: {
          street: '456 Oak Avenue',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          residencyType: 'rent' as const,
          monthlyPayment: 2500,
          yearsAtAddress: 3
        },
        employment: {
          employmentStatus: 'employed' as const,
          employerName: 'Tech Solutions Inc',
          position: 'Senior Developer',
          yearsEmployed: 5,
          monthlyIncome: 9500,
          employerPhone: '(555) 987-6543'
        },
        financialInfo: {
          grossMonthlyIncome: 9500,
          otherIncome: 500,
          otherIncomeSource: 'Freelance consulting',
          totalAssets: 85000,
          totalLiabilities: 800,
          checkingAccountBalance: 25000,
          savingsAccountBalance: 60000
        },
        propertyInfo: {
          propertyAddress: '789 Maple Drive',
          propertyCity: 'Los Angeles',
          propertyState: 'CA',
          propertyZipCode: '90210',
          propertyType: 'single_family' as const,
          propertyValue: 650000,
          loanAmount: 520000,
          loanPurpose: 'purchase' as const,
          downPaymentAmount: 130000,
          downPaymentPercentage: 20
        },
        assets: { bankAccounts: [] },
        liabilities: { creditCards: [], loans: [] },
        declarations: {
          outstandingJudgments: false,
          declaredBankruptcy: false,
          propertyForeclosed: false,
          lawsuitParty: false,
          loanOnProperty: false,
          coMakerOnNote: false,
          usCitizen: true,
          permanentResident: false,
          primaryResidence: true,
          intendToOccupy: true
        },
        documents: [
          {
            name: 'Government Issued ID.pdf',
            type: 'application/pdf',
            size: 2457600,
            uploadedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
            category: 'identification'
          },
          {
            name: 'Pay Stubs - Last 2 Months.pdf',
            type: 'application/pdf',
            size: 3145728,
            uploadedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
            category: 'income_verification'
          },
          {
            name: 'Bank Statements - Checking.pdf',
            type: 'application/pdf',
            size: 1835008,
            uploadedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
            category: 'financial'
          },
          {
            name: 'Bank Statements - Savings.pdf',
            type: 'application/pdf',
            size: 1572864,
            uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            category: 'financial'
          },
          {
            name: 'W2 Form - 2024.pdf',
            type: 'application/pdf',
            size: 1048576,
            uploadedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
            category: 'income_verification'
          },
          {
            name: 'Employment Verification Letter.pdf',
            type: 'application/pdf',
            size: 524288,
            uploadedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
            category: 'income_verification'
          }
        ],
        submittedAt: new Date()
      },
      {
        userId: emily?._id.toString(),
        status: 'approved' as const,
        decision: 'approved' as const,
        reviewedBy: lisa?._id.toString(),
        reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        decisionNotes: 'Excellent credit score and stable income. Strong financial position. Approved for prime rate.',
        borrowerInfo: {
          firstName: 'Emily',
          lastName: 'Rodriguez',
          email: 'emily.customer@loanticks.com',
          phone: '(555) 234-5678',
          dateOfBirth: new Date('1988-07-22'),
          ssn: '234-56-7890',
          maritalStatus: 'married' as const,
          dependents: 1,
          creditScore: 780
        },
        currentAddress: {
          street: '123 Sunset Boulevard',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          residencyType: 'rent' as const,
          monthlyPayment: 3200,
          yearsAtAddress: 4
        },
        employment: {
          employmentStatus: 'employed' as const,
          employerName: 'Global Finance Corp',
          position: 'Financial Analyst',
          yearsEmployed: 7,
          monthlyIncome: 11000,
          employerPhone: '(555) 876-5432'
        },
        financialInfo: {
          grossMonthlyIncome: 11000,
          otherIncome: 1000,
          otherIncomeSource: 'Investment income',
          totalAssets: 120000,
          totalLiabilities: 500,
          checkingAccountBalance: 35000,
          savingsAccountBalance: 85000
        },
        propertyInfo: {
          propertyAddress: '456 Golden Gate Ave',
          propertyCity: 'San Francisco',
          propertyState: 'CA',
          propertyZipCode: '94103',
          propertyType: 'condo' as const,
          propertyValue: 850000,
          loanAmount: 680000,
          loanPurpose: 'purchase' as const,
          downPaymentAmount: 170000,
          downPaymentPercentage: 20
        },
        assets: { bankAccounts: [] },
        liabilities: { creditCards: [], loans: [] },
        declarations: {
          outstandingJudgments: false,
          declaredBankruptcy: false,
          propertyForeclosed: false,
          lawsuitParty: false,
          loanOnProperty: false,
          coMakerOnNote: false,
          usCitizen: true,
          permanentResident: false,
          primaryResidence: true,
          intendToOccupy: true
        },
        documents: [
          {
            name: "Driver's License - Front and Back.pdf",
            type: 'application/pdf',
            size: 3670016,
            uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            category: 'identification'
          },
          {
            name: 'Recent Pay Stubs (3 months).pdf',
            type: 'application/pdf',
            size: 4194304,
            uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            category: 'income_verification'
          },
          {
            name: 'Bank Statements - All Accounts.pdf',
            type: 'application/pdf',
            size: 5242880,
            uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            category: 'financial'
          },
          {
            name: 'Tax Returns - 2023 and 2024.pdf',
            type: 'application/pdf',
            size: 6291456,
            uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            category: 'income_verification'
          },
          {
            name: 'Investment Account Statements.pdf',
            type: 'application/pdf',
            size: 2097152,
            uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            category: 'financial'
          },
          {
            name: 'Employment Verification and Offer Letter.pdf',
            type: 'application/pdf',
            size: 786432,
            uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            category: 'income_verification'
          },
          {
            name: 'Credit Report - Full.pdf',
            type: 'application/pdf',
            size: 1310720,
            uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            category: 'credit'
          },
          {
            name: 'Homeowners Insurance Quote.pdf',
            type: 'application/pdf',
            size: 655360,
            uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            category: 'insurance'
          }
        ],
        assignedTo: lisa?._id.toString(),
        assignedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        statusHistory: [
          {
            status: 'submitted',
            changedBy: emily?._id.toString() || 'system',
            changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            notes: 'Application submitted'
          },
          {
            status: 'under_review',
            changedBy: lisa?._id.toString() || 'employee',
            changedAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000),
            notes: 'Assigned to Lisa Anderson for review'
          },
          {
            status: 'approved',
            changedBy: lisa?._id.toString() || 'employee',
            changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            notes: 'Application approved'
          }
        ]
      },
      {
        userId: david?._id.toString(),
        status: 'rejected' as const,
        decision: 'rejected' as const,
        reviewedBy: john?._id.toString(),
        reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        decisionNotes: 'Insufficient income relative to debt obligations. High DTI ratio. Unable to approve at this time.',
        borrowerInfo: {
          firstName: 'David',
          lastName: 'Thompson',
          email: 'david.customer@loanticks.com',
          phone: '(555) 345-6789',
          dateOfBirth: new Date('1992-11-08'),
          ssn: '345-67-8901',
          maritalStatus: 'unmarried' as const,
          dependents: 0,
          creditScore: 620
        },
        currentAddress: {
          street: '789 Broadway Street',
          city: 'San Diego',
          state: 'CA',
          zipCode: '92101',
          residencyType: 'rent' as const,
          monthlyPayment: 1800,
          yearsAtAddress: 2
        },
        employment: {
          employmentStatus: 'employed' as const,
          employerName: 'Retail Plus',
          position: 'Store Manager',
          yearsEmployed: 3,
          monthlyIncome: 4500,
          employerPhone: '(555) 765-4321'
        },
        financialInfo: {
          grossMonthlyIncome: 4500,
          otherIncome: 0,
          otherIncomeSource: '',
          totalAssets: 15000,
          totalLiabilities: 1200,
          checkingAccountBalance: 5000,
          savingsAccountBalance: 10000
        },
        propertyInfo: {
          propertyAddress: '321 Pacific Coast Hwy',
          propertyCity: 'San Diego',
          propertyState: 'CA',
          propertyZipCode: '92109',
          propertyType: 'condo' as const,
          propertyValue: 400000,
          loanAmount: 380000,
          loanPurpose: 'purchase' as const,
          downPaymentAmount: 20000,
          downPaymentPercentage: 5
        },
        assets: { bankAccounts: [] },
        liabilities: { creditCards: [], loans: [] },
        declarations: {
          outstandingJudgments: false,
          declaredBankruptcy: false,
          propertyForeclosed: false,
          lawsuitParty: false,
          loanOnProperty: false,
          coMakerOnNote: false,
          usCitizen: true,
          permanentResident: false,
          primaryResidence: true,
          intendToOccupy: true
        },
        documents: [
          {
            name: 'State ID.pdf',
            type: 'application/pdf',
            size: 1572864,
            uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            category: 'identification'
          },
          {
            name: 'Pay Stubs - Recent.pdf',
            type: 'application/pdf',
            size: 2097152,
            uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            category: 'income_verification'
          },
          {
            name: 'Bank Statements.pdf',
            type: 'application/pdf',
            size: 1048576,
            uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            category: 'financial'
          },
          {
            name: 'Credit Card Statements.pdf',
            type: 'application/pdf',
            size: 1835008,
            uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            category: 'financial'
          }
        ],
        assignedTo: john?._id.toString(),
        assignedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        statusHistory: [
          {
            status: 'submitted',
            changedBy: david?._id.toString() || 'system',
            changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            notes: 'Application submitted'
          },
          {
            status: 'under_review',
            changedBy: john?._id.toString() || 'employee',
            changedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
            notes: 'Assigned to John Smith for review'
          },
          {
            status: 'rejected',
            changedBy: john?._id.toString() || 'employee',
            changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            notes: 'Application rejected - DTI too high'
          }
        ]
      },
      // Additional diverse applications
      {
        userId: sarah?._id.toString(),
        status: 'submitted' as const,
        borrowerInfo: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.customer@loanticks.com',
          phone: '(555) 456-7890',
          dateOfBirth: new Date('1990-05-12'),
          ssn: '456-78-9012',
          maritalStatus: 'unmarried' as const,
          dependents: 1,
          creditScore: 710
        },
        currentAddress: {
          street: '2345 Pine Street',
          city: 'Seattle',
          state: 'WA',
          zipCode: '98101',
          residencyType: 'rent' as const,
          monthlyPayment: 2200,
          yearsAtAddress: 2
        },
        employment: {
          employmentStatus: 'employed' as const,
          employerName: 'Amazon Web Services',
          position: 'Software Engineer',
          yearsEmployed: 4,
          monthlyIncome: 12000,
          employerPhone: '(555) 234-5678'
        },
        financialInfo: {
          grossMonthlyIncome: 12000,
          otherIncome: 0,
          otherIncomeSource: '',
          totalAssets: 95000,
          totalLiabilities: 600,
          checkingAccountBalance: 30000,
          savingsAccountBalance: 65000
        },
        propertyInfo: {
          propertyAddress: '567 Lake View Drive',
          propertyCity: 'Seattle',
          propertyState: 'WA',
          propertyZipCode: '98102',
          propertyType: 'townhouse' as const,
          propertyValue: 550000,
          loanAmount: 440000,
          loanPurpose: 'purchase' as const,
          downPaymentAmount: 110000,
          downPaymentPercentage: 20
        },
        assets: { bankAccounts: [] },
        liabilities: { creditCards: [], loans: [] },
        declarations: {
          outstandingJudgments: false,
          declaredBankruptcy: false,
          propertyForeclosed: false,
          lawsuitParty: false,
          loanOnProperty: false,
          coMakerOnNote: false,
          usCitizen: true,
          permanentResident: false,
          primaryResidence: true,
          intendToOccupy: true
        },
        documents: [
          {
            name: 'Passport.pdf',
            type: 'application/pdf',
            size: 2621440,
            uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            category: 'identification'
          },
          {
            name: 'Employment Verification - AWS.pdf',
            type: 'application/pdf',
            size: 917504,
            uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            category: 'income_verification'
          },
          {
            name: 'Pay Statements - 3 months.pdf',
            type: 'application/pdf',
            size: 3407872,
            uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            category: 'income_verification'
          },
          {
            name: 'Bank Account Verification.pdf',
            type: 'application/pdf',
            size: 2359296,
            uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            category: 'financial'
          },
          {
            name: 'Stock Portfolio Summary.pdf',
            type: 'application/pdf',
            size: 1441792,
            uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            category: 'financial'
          }
        ],
        assignedTo: lisa?._id.toString(),
        assignedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        userId: michael?._id.toString(),
        status: 'submitted' as const,
        borrowerInfo: {
          firstName: 'Robert',
          lastName: 'Martinez',
          email: 'robert.martinez@email.com',
          phone: '(555) 567-8901',
          dateOfBirth: new Date('1983-09-25'),
          ssn: '567-89-0123',
          maritalStatus: 'married' as const,
          dependents: 3,
          creditScore: 695
        },
        currentAddress: {
          street: '8901 Main Street',
          city: 'Austin',
          state: 'TX',
          zipCode: '78701',
          residencyType: 'own' as const,
          monthlyPayment: 1800,
          yearsAtAddress: 6
        },
        employment: {
          employmentStatus: 'employed' as const,
          employerName: 'Dell Technologies',
          position: 'Operations Manager',
          yearsEmployed: 8,
          monthlyIncome: 8500,
          employerPhone: '(555) 345-6789'
        },
        financialInfo: {
          grossMonthlyIncome: 8500,
          otherIncome: 500,
          otherIncomeSource: 'Rental property',
          totalAssets: 110000,
          totalLiabilities: 900,
          checkingAccountBalance: 40000,
          savingsAccountBalance: 70000
        },
        propertyInfo: {
          propertyAddress: '234 Hill Country Blvd',
          propertyCity: 'Austin',
          propertyState: 'TX',
          propertyZipCode: '78702',
          propertyType: 'single_family' as const,
          propertyValue: 475000,
          loanAmount: 380000,
          loanPurpose: 'purchase' as const,
          downPaymentAmount: 95000,
          downPaymentPercentage: 20
        },
        assets: { bankAccounts: [] },
        liabilities: { creditCards: [], loans: [] },
        declarations: {
          outstandingJudgments: false,
          declaredBankruptcy: false,
          propertyForeclosed: false,
          lawsuitParty: false,
          loanOnProperty: false,
          coMakerOnNote: false,
          usCitizen: true,
          permanentResident: false,
          primaryResidence: true,
          intendToOccupy: true
        },
        assignedTo: john?._id.toString(),
        assignedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        userId: emily?._id.toString(),
        status: 'submitted' as const,
        borrowerInfo: {
          firstName: 'Jennifer',
          lastName: 'Williams',
          email: 'jennifer.williams@email.com',
          phone: '(555) 678-9012',
          dateOfBirth: new Date('1987-12-08'),
          ssn: '678-90-1234',
          maritalStatus: 'married' as const,
          dependents: 2,
          creditScore: 730
        },
        currentAddress: {
          street: '456 Park Avenue',
          city: 'Boston',
          state: 'MA',
          zipCode: '02101',
          residencyType: 'rent' as const,
          monthlyPayment: 2800,
          yearsAtAddress: 3
        },
        employment: {
          employmentStatus: 'employed' as const,
          employerName: 'Massachusetts General Hospital',
          position: 'Registered Nurse',
          yearsEmployed: 9,
          monthlyIncome: 9000,
          employerPhone: '(555) 456-7890'
        },
        financialInfo: {
          grossMonthlyIncome: 9000,
          otherIncome: 800,
          otherIncomeSource: 'Per diem shifts',
          totalAssets: 105000,
          totalLiabilities: 700,
          checkingAccountBalance: 35000,
          savingsAccountBalance: 70000
        },
        propertyInfo: {
          propertyAddress: '789 Commonwealth Ave',
          propertyCity: 'Boston',
          propertyState: 'MA',
          propertyZipCode: '02102',
          propertyType: 'condo' as const,
          propertyValue: 625000,
          loanAmount: 500000,
          loanPurpose: 'purchase' as const,
          downPaymentAmount: 125000,
          downPaymentPercentage: 20
        },
        assets: { bankAccounts: [] },
        liabilities: { creditCards: [], loans: [] },
        declarations: {
          outstandingJudgments: false,
          declaredBankruptcy: false,
          propertyForeclosed: false,
          lawsuitParty: false,
          loanOnProperty: false,
          coMakerOnNote: false,
          usCitizen: true,
          permanentResident: false,
          primaryResidence: true,
          intendToOccupy: true
        },
        assignedTo: lisa?._id.toString(),
        assignedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        submittedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      }
    ];

    // Create applications
    for (const appData of demoApplications) {
      const existing = await LoanApplication.findOne({
        userId: appData.userId,
        'borrowerInfo.email': appData.borrowerInfo.email
      });

      if (!existing) {
        const app = new LoanApplication(appData);
        await app.save();
        
        results.created.push({
          type: 'Application',
          borrower: `${appData.borrowerInfo.firstName} ${appData.borrowerInfo.lastName}`,
          status: appData.status,
          loanAmount: `$${appData.propertyInfo.loanAmount.toLocaleString()}`,
          creditScore: appData.borrowerInfo.creditScore
        });
        results.summary.applications++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Demo setup complete! Created ${results.summary.users} users and ${results.summary.applications} applications`,
      results,
      quickAccess: {
        baseUrl: process.env.NEXTAUTH_URL || 'https://loanticks.vercel.app',
        accounts: [
          {
            role: 'Admin',
            name: 'Admin Demo',
            email: 'admin.demo@loanticks.com',
            password: 'demo123',
            features: ['View all applications', 'Manage employees', 'System statistics', 'Full access']
          },
          {
            role: 'Employee',
            name: 'John Smith',
            email: 'john.employee@loanticks.com',
            password: 'demo123',
            features: ['Review applications', 'Approve/reject', 'View rates', 'Make decisions']
          },
          {
            role: 'Employee',
            name: 'Lisa Anderson',
            email: 'lisa.employee@loanticks.com',
            password: 'demo123',
            features: ['Multiple assignments', 'Approved cases', 'Senior employee workflow']
          },
          {
            role: 'Customer',
            name: 'Sarah Johnson',
            email: 'sarah.customer@loanticks.com',
            password: 'demo123',
            features: ['New customer', 'Apply for loan', 'Clean dashboard']
          },
          {
            role: 'Customer',
            name: 'Michael Chen',
            email: 'michael.customer@loanticks.com',
            password: 'demo123',
            features: ['Pending application', 'Track status', 'View progress']
          },
          {
            role: 'Customer',
            name: 'Emily Rodriguez',
            email: 'emily.customer@loanticks.com',
            password: 'demo123',
            features: ['Approved loan!', 'Success story', 'High credit score']
          },
          {
            role: 'Customer',
            name: 'David Thompson',
            email: 'david.customer@loanticks.com',
            password: 'demo123',
            features: ['Rejected application', 'See decision notes', 'Low credit scenario']
          }
        ]
      }
    });

  } catch (error) {
    console.error('Error setting up demo accounts:', error);
    return NextResponse.json(
      { 
        error: 'Failed to setup demo accounts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

