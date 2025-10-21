import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import LoanApplication from '@/models/LoanApplication';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await connectDB();

    // Create test employees if they don't exist
    const testEmployees = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@loanticks.com',
        password: 'password123',
        role: 'employee',
        status: 'active'
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@loanticks.com',
        password: 'password123',
        role: 'senior_employee',
        status: 'active'
      },
      {
        firstName: 'Mike',
        lastName: 'Davis',
        email: 'mike.davis@loanticks.com',
        password: 'password123',
        role: 'supervisor',
        status: 'active'
      }
    ];

    const createdEmployees = [];
    for (const employeeData of testEmployees) {
      let employee = await User.findOne({ email: employeeData.email });
      if (!employee) {
        const hashedPassword = await bcrypt.hash(employeeData.password, 12);
        employee = new User({
          ...employeeData,
          password: hashedPassword
        });
        await employee.save();
      }
      createdEmployees.push({
        _id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        role: employee.role,
        status: employee.status,
        password: employeeData.password // Include for testing
      });
    }

    // Create test loan applications with employee assignments
    const testApplications = [
      {
        userId: 'test-customer-1',
        status: 'under_review',
        assignedTo: createdEmployees[0]._id,
        assignedAt: new Date(),
        borrowerInfo: {
          firstName: 'Alice',
          lastName: 'Wilson',
          email: 'alice.wilson@email.com',
          phone: '(555) 123-4567',
          ssn: '123-45-6789',
          dateOfBirth: '1985-06-15',
          maritalStatus: 'married',
          dependents: 2
        },
        currentAddress: {
          street: '123 Main Street',
          city: 'Anytown',
          state: 'CA',
          zipCode: '90210',
          residencyType: 'rent',
          monthlyPayment: 2500,
          yearsAtAddress: 3
        },
        employment: {
          employmentStatus: 'employed',
          employerName: 'Tech Solutions Inc.',
          position: 'Software Engineer',
          monthlyIncome: 7500,
          yearsEmployed: 5
        },
        financialInfo: {
          grossMonthlyIncome: 7500,
          totalAssets: 150000,
          totalLiabilities: 50000
        },
        propertyInfo: {
          propertyAddress: '456 Dream Lane',
          propertyCity: 'Desired City',
          propertyState: 'CA',
          propertyValue: 650000,
          loanAmount: 520000,
          loanPurpose: 'purchase'
        },
        declarations: {
          outstandingJudgments: false,
          declaredBankruptcy: false,
          propertyForeclosed: false,
          usCitizen: true,
          primaryResidence: true
        },
        statusHistory: [
          {
            status: 'submitted',
            changedBy: 'customer',
            changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            notes: 'Application submitted by customer'
          },
          {
            status: 'under_review',
            changedBy: createdEmployees[0]._id,
            changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            notes: 'Assigned to employee for review'
          }
        ],
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        userId: 'test-customer-2',
        status: 'approved',
        assignedTo: createdEmployees[1]._id,
        assignedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        reviewedBy: createdEmployees[1]._id,
        reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        decision: 'approved',
        decisionNotes: 'Strong application with good credit and stable income',
        borrowerInfo: {
          firstName: 'Bob',
          lastName: 'Brown',
          email: 'bob.brown@email.com',
          phone: '(555) 987-6543',
          ssn: '987-65-4321',
          dateOfBirth: '1980-03-22',
          maritalStatus: 'single',
          dependents: 0
        },
        currentAddress: {
          street: '789 Oak Avenue',
          city: 'Another City',
          state: 'NY',
          zipCode: '10001',
          residencyType: 'own',
          monthlyPayment: 1800,
          yearsAtAddress: 5
        },
        employment: {
          employmentStatus: 'employed',
          employerName: 'Finance Corp',
          position: 'Senior Analyst',
          monthlyIncome: 8500,
          yearsEmployed: 8
        },
        financialInfo: {
          grossMonthlyIncome: 8500,
          totalAssets: 200000,
          totalLiabilities: 30000
        },
        propertyInfo: {
          propertyAddress: '321 Pine Street',
          propertyCity: 'Target City',
          propertyState: 'NY',
          propertyValue: 750000,
          loanAmount: 600000,
          loanPurpose: 'purchase'
        },
        declarations: {
          outstandingJudgments: false,
          declaredBankruptcy: false,
          propertyForeclosed: false,
          usCitizen: true,
          primaryResidence: true
        },
        statusHistory: [
          {
            status: 'submitted',
            changedBy: 'customer',
            changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            notes: 'Application submitted by customer'
          },
          {
            status: 'under_review',
            changedBy: createdEmployees[1]._id,
            changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            notes: 'Assigned to senior employee for review'
          },
          {
            status: 'approved',
            changedBy: createdEmployees[1]._id,
            changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            notes: 'Application approved - strong financial profile'
          }
        ],
        submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        userId: 'test-customer-3',
        status: 'rejected',
        assignedTo: createdEmployees[2]._id,
        assignedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        reviewedBy: createdEmployees[2]._id,
        reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        decision: 'rejected',
        decisionNotes: 'Insufficient income for requested loan amount',
        borrowerInfo: {
          firstName: 'Carol',
          lastName: 'Green',
          email: 'carol.green@email.com',
          phone: '(555) 456-7890',
          ssn: '456-78-9012',
          dateOfBirth: '1990-12-10',
          maritalStatus: 'married',
          dependents: 1
        },
        currentAddress: {
          street: '555 Elm Street',
          city: 'Small Town',
          state: 'TX',
          zipCode: '75001',
          residencyType: 'rent',
          monthlyPayment: 1200,
          yearsAtAddress: 2
        },
        employment: {
          employmentStatus: 'employed',
          employerName: 'Local Business',
          position: 'Assistant Manager',
          monthlyIncome: 3500,
          yearsEmployed: 2
        },
        financialInfo: {
          grossMonthlyIncome: 3500,
          totalAssets: 25000,
          totalLiabilities: 15000
        },
        propertyInfo: {
          propertyAddress: '777 Aspen Drive',
          propertyCity: 'Wishful City',
          propertyState: 'TX',
          propertyValue: 400000,
          loanAmount: 380000,
          loanPurpose: 'purchase'
        },
        declarations: {
          outstandingJudgments: false,
          declaredBankruptcy: false,
          propertyForeclosed: false,
          usCitizen: true,
          primaryResidence: true
        },
        statusHistory: [
          {
            status: 'submitted',
            changedBy: 'customer',
            changedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
            notes: 'Application submitted by customer'
          },
          {
            status: 'under_review',
            changedBy: createdEmployees[2]._id,
            changedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
            notes: 'Assigned to supervisor for review'
          },
          {
            status: 'rejected',
            changedBy: createdEmployees[2]._id,
            changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            notes: 'Application rejected - insufficient income'
          }
        ],
        submittedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      }
    ];

    const createdApplications = [];
    for (const appData of testApplications) {
      let application = await LoanApplication.findOne({ 
        'borrowerInfo.email': appData.borrowerInfo.email 
      });
      if (!application) {
        application = new LoanApplication(appData);
        await application.save();
      }
      createdApplications.push(application);
    }

    // Calculate system statistics
    const totalEmployees = await User.countDocuments({ 
      role: { $in: ['employee', 'senior_employee', 'supervisor'] } 
    });
    const totalApplications = await LoanApplication.countDocuments();
    const pendingApplications = await LoanApplication.countDocuments({ status: 'under_review' });
    const approvedApplications = await LoanApplication.countDocuments({ decision: 'approved' });
    const rejectedApplications = await LoanApplication.countDocuments({ decision: 'rejected' });

    return NextResponse.json({
      success: true,
      message: 'Test system data created successfully',
      data: {
        employees: createdEmployees,
        applications: createdApplications,
        statistics: {
          totalEmployees,
          totalApplications,
          pendingApplications,
          approvedApplications,
          rejectedApplications
        }
      },
      testCredentials: {
        employees: createdEmployees.map(emp => ({
          email: emp.email,
          password: emp.password,
          role: emp.role
        }))
      },
      testInfo: {
        createdAt: new Date().toISOString(),
        description: 'Complete test system with employees and loan applications',
        features: [
          'Employee tracking and assignment',
          'Status history and audit trails',
          'Performance metrics',
          'Admin oversight capabilities',
          'Employee management system'
        ]
      }
    });

  } catch (error) {
    console.error('Error creating test system:', error);
    return NextResponse.json({ 
      error: 'Failed to create test system',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
