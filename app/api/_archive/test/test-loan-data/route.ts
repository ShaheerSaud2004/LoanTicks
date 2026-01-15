import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Create comprehensive test data that matches URLA 2019 format
    const testLoanApplication = {
      // Application Metadata
      applicationId: 'TEST-' + Date.now(),
      submittedAt: new Date().toISOString(),
      status: 'submitted',
      decision: 'pending',
      
      // Borrower Information (URLA Section 1)
      borrower: {
        personalInfo: {
          firstName: 'John',
          middleName: 'Michael',
          lastName: 'Smith',
          suffix: 'Jr.',
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
        contactInfo: {
          email: 'john.smith@email.com',
          phone: '(555) 123-4567',
          homePhone: '(555) 123-4567',
          workPhone: '(555) 987-6543'
        }
      },

      // Address Information (URLA Section 3)
      address: {
        current: {
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
        prior: {
          street: '456 Oak Avenue',
          unit: '',
          city: 'Previous City',
          state: 'NY',
          zipCode: '10001',
          housingType: 'own',
          monthlyPayment: 1800,
          yearsAtAddress: 2,
          monthsAtAddress: 0
        }
      },

      // Employment Information (URLA Section 5)
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

      // Financial Information (URLA Sections 6-8)
      financial: {
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
          otherAssetDescription: 'Vehicle',
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

      // Property Information (URLA Section 9)
      property: {
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
          downPaymentPercentage: 20,
          refinancePurpose: ''
        }
      },

      // Loan Information (URLA Section 10)
      loan: {
        amount: 600000,
        purpose: 'purchase',
        refinancePurpose: '',
        type: 'conventional',
        term: '30',
        interestRateType: 'fixed',
        interestRate: '6.5',
        monthlyPayment: 3792,
        pmiRequired: false,
        pmiAmount: 0
      },

      // Declarations (URLA Section 11)
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

      // Military Service (URLA Section 12)
      militaryService: {
        served: false,
        branch: '',
        rank: '',
        serviceDates: ''
      },

      // Additional Information
      additionalInfo: {
        additionalInformation: 'First-time homebuyer. Looking for a family home in a good school district.',
        specialCircumstances: 'None'
      },

      // Documents
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

      // Audit Trail
      auditTrail: {
        assignedTo: null,
        assignedAt: null,
        reviewedBy: null,
        reviewedAt: null,
        statusHistory: [
          {
            status: 'submitted',
            changedBy: 'customer',
            changedAt: new Date().toISOString(),
            notes: 'Application submitted by customer'
          }
        ]
      }
    };

    // Test data for multiple applications
    const testApplications = [
      testLoanApplication,
      {
        ...testLoanApplication,
        applicationId: 'TEST-' + (Date.now() + 1),
        borrower: {
          ...testLoanApplication.borrower,
          personalInfo: {
            ...testLoanApplication.borrower.personalInfo,
            firstName: 'Jane',
            lastName: 'Johnson',
            email: 'jane.johnson@email.com',
            phone: '(555) 234-5678',
            maritalStatus: 'single',
            dependents: 0
          }
        },
        financial: {
          ...testLoanApplication.financial,
          income: {
            ...testLoanApplication.financial.income,
            grossMonthlyIncome: 6200,
            baseIncome: 5800,
            overtimeIncome: 200,
            bonusIncome: 200
          },
          assets: {
            ...testLoanApplication.financial.assets,
            checkingAccountBalance: 8000,
            savingsAccountBalance: 15000,
            totalAssets: 120000
          }
        },
        loan: {
          ...testLoanApplication.loan,
          amount: 480000,
          propertyValue: 600000,
          downPaymentAmount: 120000,
          monthlyPayment: 3034
        }
      }
    ];

    return NextResponse.json({
      success: true,
      message: 'Test loan application data generated successfully',
      data: testApplications,
      testInfo: {
        generatedAt: new Date().toISOString(),
        totalApplications: testApplications.length,
        urlaSections: [
          'Section 1: Borrower Information',
          'Section 2: Contact Information', 
          'Section 3: Current Address',
          'Section 4: Prior Address',
          'Section 5: Employment Information',
          'Section 6: Income Information',
          'Section 7: Assets',
          'Section 8: Liabilities',
          'Section 9: Property Information',
          'Section 10: Loan Information',
          'Section 11: Declarations',
          'Section 12: Military Service',
          'Section 13: Demographics',
          'Section 14: Additional Information',
          'Section 15: Documents'
        ],
        conditionalLogic: {
          priorAddress: 'Shown if years at current address < 2',
          previousEmployment: 'Shown if years at current job < 2',
          jointBorrower: 'Shown if credit type is joint',
          refinancePurpose: 'Shown if loan purpose is refinance',
          militaryService: 'Shown if borrower indicates military service',
          pmiDetails: 'Shown if PMI is required'
        },
        exportFormats: ['json', 'xml', 'csv'],
        integrationReady: true,
        ariseAriveCompatible: true
      }
    });

  } catch (error) {
    console.error('Error generating test loan data:', error);
    return NextResponse.json({ 
      error: 'Failed to generate test loan data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
