import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import LoanApplication from '@/models/LoanApplication';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await connectDB();

    // Create test users if they don't exist
    const testUsers = [
      {
        name: 'Test Customer',
        email: 'testcustomer@example.com',
        password: 'test123',
        role: 'customer'
      },
      {
        name: 'Test Employee',
        email: 'testemployee@loanticks.com',
        password: 'test123',
        role: 'employee'
      }
    ];

    const users = [];
    for (const userData of testUsers) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        user = new User({
          ...userData,
          password: hashedPassword
        });
        await user.save();
      }
      users.push(user);
    }

    const customer = users.find(u => u.role === 'customer');
    const employee = users.find(u => u.role === 'employee');

    // Create comprehensive test loan application
    const testApplication = {
      userId: customer._id,
      status: 'submitted',
      borrowerInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '(555) 123-4567',
        ssn: '123-45-6789',
        dateOfBirth: '1985-06-15',
        citizenship: 'us_citizen',
        maritalStatus: 'married',
        dependents: 2,
        dependentAges: '8, 12',
        race: ['White'],
        ethnicity: 'Not Hispanic or Latino',
        sex: 'Male'
      },
      currentAddress: {
        street: '123 Main Street',
        unit: 'Apt 2B',
        city: 'Anytown',
        state: 'CA',
        zipCode: '90210',
        housingType: 'rent',
        monthlyPayment: 2500,
        yearsAtAddress: 3,
        monthsAtAddress: 6
      },
      priorAddress: {
        street: '456 Oak Avenue',
        city: 'Previous City',
        state: 'NY',
        zipCode: '10001',
        housingType: 'own',
        monthlyPayment: 1800,
        yearsAtAddress: 2,
        monthsAtAddress: 0
      },
      employment: {
        current: {
          status: 'employed',
          employerName: 'Tech Solutions Inc.',
          position: 'Senior Software Engineer',
          startDate: '2020-01-15',
          yearsEmployed: 4,
          monthsEmployed: 3,
          monthlyIncome: 8500,
          workPhone: '(555) 987-6543',
          workAddress: {
            street: '789 Business Blvd',
            city: 'Tech City',
            state: 'CA',
            zipCode: '90211'
          }
        },
        previous: {
          employerName: 'Previous Corp',
          position: 'Software Engineer',
          startDate: '2018-03-01',
          endDate: '2019-12-31',
          yearsEmployed: 1,
          monthsEmployed: 10,
          monthlyIncome: 6500
        }
      },
      financialInfo: {
        income: {
          grossMonthlyIncome: 8500,
          baseIncome: 7500,
          overtimeIncome: 500,
          bonusIncome: 300,
          commissionIncome: 0,
          otherIncome: 200,
          otherIncomeSource: 'Investment dividends',
          totalMonthlyIncome: 8500
        },
        assets: {
          checkingAccountBalance: 15000,
          savingsAccountBalance: 25000,
          moneyMarketBalance: 10000,
          cdsBalance: 5000,
          realEstateValue: 0,
          stockBondValue: 45000,
          lifeInsuranceValue: 50000,
          retirementAccountValue: 75000,
          otherAssetValue: 5000,
          totalAssets: 185000
        },
        liabilities: {
          mortgagePayment: 0,
          secondMortgagePayment: 0,
          homeEquityPayment: 0,
          creditCardPayments: 450,
          installmentLoanPayments: 350,
          otherMonthlyPayments: 200,
          totalMonthlyLiabilities: 1000
        }
      },
      propertyInfo: {
        address: {
          street: '321 Dream Lane',
          city: 'Desired City',
          state: 'CA',
          zipCode: '90212'
        },
        details: {
          propertyType: 'single_family',
          propertyUse: 'primary_residence',
          propertyValue: 750000,
          purchasePrice: 750000,
          downPaymentAmount: 150000,
          downPaymentPercentage: 20
        }
      },
      loan: {
        amount: 600000,
        purpose: 'purchase',
        type: 'conventional',
        term: '30',
        interestRateType: 'fixed',
        interestRate: '6.5',
        monthlyPayment: 3792,
        pmiRequired: false,
        pmiAmount: 0
      },
      declarations: {
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
        intendToOccupy: true
      },
      militaryService: {
        served: false,
        branch: '',
        rank: '',
        serviceDates: ''
      },
      additionalInfo: {
        additionalInformation: 'First-time homebuyer. Looking for a family home in a good school district.',
        specialCircumstances: 'None'
      },
      documents: [
        {
          name: 'W-2_2023.pdf',
          type: 'tax_return',
          size: 245760,
          uploadedAt: new Date().toISOString()
        },
        {
          name: 'Pay_Stub_Recent.pdf',
          type: 'pay_stub',
          size: 156432,
          uploadedAt: new Date().toISOString()
        },
        {
          name: 'Bank_Statement.pdf',
          type: 'bank_statement',
          size: 892345,
          uploadedAt: new Date().toISOString()
        }
      ],
      statusHistory: [
        {
          status: 'submitted',
          changedBy: customer._id,
          changedAt: new Date().toISOString(),
          notes: 'Application submitted by customer'
        }
      ],
      submittedAt: new Date().toISOString()
    };

    // Create or update test application
    let application = await LoanApplication.findOne({ 
      'borrowerInfo.email': testApplication.borrowerInfo.email 
    });
    
    if (!application) {
      application = new LoanApplication(testApplication);
    } else {
      Object.assign(application, testApplication);
    }
    
    await application.save();

    // Simulate employee workflow
    const employeeActions = [
      {
        action: 'assign',
        status: 'under_review',
        assignedTo: employee._id,
        assignedAt: new Date(),
        notes: 'Application assigned to employee for review'
      },
      {
        action: 'review',
        status: 'under_review',
        notes: 'Application under review by employee'
      },
      {
        action: 'decision',
        status: 'approved',
        decision: 'approved',
        reviewedBy: employee._id,
        reviewedAt: new Date(),
        decisionNotes: 'Strong application with excellent credit and stable income. All requirements met.',
        notes: 'Application approved by employee'
      }
    ];

    // Apply employee actions to demonstrate tracking
    for (const action of employeeActions) {
      const statusEntry = {
        status: action.status,
        changedBy: employee._id,
        changedAt: new Date(),
        notes: action.notes
      };
      
      application.statusHistory.push(statusEntry);
      
      if (action.assignedTo) {
        application.assignedTo = action.assignedTo;
        application.assignedAt = action.assignedAt;
      }
      
      if (action.reviewedBy) {
        application.reviewedBy = action.reviewedBy;
        application.reviewedAt = action.reviewedAt;
        application.decision = action.decision;
        application.decisionNotes = action.decisionNotes;
      }
    }

    await application.save();

    // Get system statistics
    const totalUsers = await User.countDocuments();
    const totalApplications = await LoanApplication.countDocuments();
    const totalEmployees = await User.countDocuments({ 
      role: { $in: ['employee', 'senior_employee', 'supervisor'] } 
    });

    return NextResponse.json({
      success: true,
      message: 'Complete workflow test data created successfully',
      data: {
        users: users.map(u => ({
          _id: u._id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          role: u.role,
          status: u.status
        })),
        application: {
          _id: application._id,
          status: application.status,
          decision: application.decision,
          assignedTo: application.assignedTo,
          reviewedBy: application.reviewedBy,
          borrowerInfo: application.borrowerInfo,
          statusHistory: application.statusHistory
        },
        statistics: {
          totalUsers,
          totalApplications,
          totalEmployees
        }
      },
      testCredentials: {
        customer: {
          email: 'testcustomer@example.com',
          password: 'test123',
          role: 'customer'
        },
        employee: {
          email: 'testemployee@loanticks.com',
          password: 'test123',
          role: 'employee'
        }
      },
      workflow: {
        description: 'Complete loan application workflow with employee tracking',
        steps: [
          '1. Customer submits comprehensive loan application',
          '2. Employee is automatically assigned when viewing application',
          '3. Employee reviews application and makes decision',
          '4. All actions are tracked with timestamps and employee attribution',
          '5. Admin can view complete audit trail and employee performance'
        ],
        features: [
          'Automatic employee assignment tracking',
          'Complete status history with employee attribution',
          'Decision tracking with notes and timestamps',
          'Performance metrics calculation',
          'Admin oversight and employee management'
        ]
      },
      testing: {
        urls: {
          customer: '/customer/dashboard',
          employee: '/employee/dashboard',
          admin: '/admin/dashboard',
          loanApplication: '/customer/loan-application',
          employeeManagement: '/admin/employees'
        },
        api: {
          exportData: '/api/export-loan-data',
          testData: '/api/test-loan-data',
          createAccounts: '/api/create-test-accounts'
        }
      }
    });

  } catch (error) {
    console.error('Error creating complete workflow test:', error);
    return NextResponse.json({ 
      error: 'Failed to create complete workflow test',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
