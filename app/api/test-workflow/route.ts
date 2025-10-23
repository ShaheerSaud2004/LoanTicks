import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import LoanApplication from '@/models/LoanApplication';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await connectDB();

    const testResults = {
      timestamp: new Date().toISOString(),
      tests: [] as any[],
      summary: { passed: 0, failed: 0, total: 0 }
    };

    // TEST 1: Create test customer
    try {
      let customer = await User.findOne({ email: 'testcustomer@example.com' });
      if (!customer) {
        const hashedPassword = await bcrypt.hash('password123', 12);
        customer = new User({
          name: 'Test Customer',
          email: 'testcustomer@example.com',
          password: hashedPassword,
          role: 'customer'
        });
        await customer.save();
      }
      testResults.tests.push({
        test: 'Create Test Customer',
        status: 'PASSED',
        data: { customerId: customer._id, email: customer.email }
      });
      testResults.summary.passed++;
    } catch (error) {
      testResults.tests.push({
        test: 'Create Test Customer',
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      testResults.summary.failed++;
    }
    testResults.summary.total++;

    // TEST 2: Create test employee
    try {
      let employee = await User.findOne({ email: 'testemployee@example.com' });
      if (!employee) {
        const hashedPassword = await bcrypt.hash('password123', 12);
        employee = new User({
          name: 'Test Employee',
          email: 'testemployee@example.com',
          password: hashedPassword,
          role: 'employee'
        });
        await employee.save();
      }
      testResults.tests.push({
        test: 'Create Test Employee',
        status: 'PASSED',
        data: { employeeId: employee._id, email: employee.email }
      });
      testResults.summary.passed++;
    } catch (error) {
      testResults.tests.push({
        test: 'Create Test Employee',
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      testResults.summary.failed++;
    }
    testResults.summary.total++;

    // TEST 3: Create comprehensive loan application
    try {
      const customer = await User.findOne({ email: 'testcustomer@example.com' });
      
      const testApplication = {
        userId: customer?._id.toString() || 'test-user',
        status: 'submitted',
        borrowerInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'testcustomer@example.com',
          phone: '(555) 123-4567',
          dateOfBirth: new Date('1990-01-15'),
          ssn: '123-45-6789',
          maritalStatus: 'unmarried',
          dependents: 2
        },
        currentAddress: {
          street: '123 Main Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          residencyType: 'rent',
          monthlyPayment: 2000,
          yearsAtAddress: 3
        },
        employment: {
          employmentStatus: 'employed',
          employerName: 'Tech Company Inc',
          position: 'Software Engineer',
          yearsEmployed: 5,
          monthlyIncome: 8000,
          employerPhone: '(555) 987-6543'
        },
        financialInfo: {
          grossMonthlyIncome: 8000,
          otherIncome: 500,
          otherIncomeSource: 'Freelance work',
          totalAssets: 50000,
          totalLiabilities: 500,
          checkingAccountBalance: 15000,
          savingsAccountBalance: 35000
        },
        propertyInfo: {
          propertyAddress: '456 Oak Avenue',
          propertyCity: 'San Francisco',
          propertyState: 'CA',
          propertyZipCode: '94103',
          propertyType: 'single_family',
          propertyValue: 600000,
          loanAmount: 480000,
          loanPurpose: 'purchase',
          downPaymentAmount: 120000,
          downPaymentPercentage: 20
        },
        assets: {
          bankAccounts: [
            { bankName: 'Chase Bank', accountType: 'Checking', balance: 15000 },
            { bankName: 'Chase Bank', accountType: 'Savings', balance: 35000 }
          ]
        },
        liabilities: {
          creditCards: [
            { creditor: 'Visa', monthlyPayment: 200, balance: 5000 }
          ],
          loans: [
            { loanType: 'Auto', creditor: 'Auto Lender', monthlyPayment: 300, balance: 15000 }
          ]
        },
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
        submittedAt: new Date()
      };

      const application = new LoanApplication(testApplication);
      await application.save();

      testResults.tests.push({
        test: 'Create Comprehensive Loan Application',
        status: 'PASSED',
        data: {
          applicationId: application._id,
          status: application.status,
          loanAmount: application.propertyInfo.loanAmount,
          propertyValue: application.propertyInfo.propertyValue
        }
      });
      testResults.summary.passed++;
    } catch (error) {
      testResults.tests.push({
        test: 'Create Comprehensive Loan Application',
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      testResults.summary.failed++;
    }
    testResults.summary.total++;

    // TEST 4: Query applications for customer
    try {
      const customer = await User.findOne({ email: 'testcustomer@example.com' });
      const applications = await LoanApplication.find({ userId: customer?._id }).sort({ createdAt: -1 });
      
      testResults.tests.push({
        test: 'Query Customer Applications',
        status: 'PASSED',
        data: {
          totalApplications: applications.length,
          latestApplicationId: applications[0]?._id
        }
      });
      testResults.summary.passed++;
    } catch (error) {
      testResults.tests.push({
        test: 'Query Customer Applications',
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      testResults.summary.failed++;
    }
    testResults.summary.total++;

    // TEST 5: Assign application to employee
    try {
      const employee = await User.findOne({ email: 'testemployee@example.com' });
      const customer = await User.findOne({ email: 'testcustomer@example.com' });
      const application = await LoanApplication.findOne({ userId: customer?._id }).sort({ createdAt: -1 });

      if (application && employee) {
        application.assignedTo = employee._id.toString();
        application.assignedAt = new Date();
        application.status = 'under_review';
        application.statusHistory = [
          ...(application.statusHistory || []),
          {
            status: 'under_review',
            changedBy: employee._id.toString(),
            changedAt: new Date(),
            notes: 'Application assigned to employee for review'
          }
        ];
        await application.save();

        testResults.tests.push({
          test: 'Assign Application to Employee',
          status: 'PASSED',
          data: {
            applicationId: application._id,
            assignedTo: employee.name,
            status: application.status
          }
        });
        testResults.summary.passed++;
      } else {
        throw new Error('Application or employee not found');
      }
    } catch (error) {
      testResults.tests.push({
        test: 'Assign Application to Employee',
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      testResults.summary.failed++;
    }
    testResults.summary.total++;

    // TEST 6: Query applications for employee
    try {
      const employee = await User.findOne({ email: 'testemployee@example.com' });
      const applications = await LoanApplication.find({ assignedTo: employee?._id }).sort({ createdAt: -1 });
      
      testResults.tests.push({
        test: 'Query Employee Assigned Applications',
        status: 'PASSED',
        data: {
          totalAssignedApplications: applications.length,
          latestApplicationId: applications[0]?._id
        }
      });
      testResults.summary.passed++;
    } catch (error) {
      testResults.tests.push({
        test: 'Query Employee Assigned Applications',
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      testResults.summary.failed++;
    }
    testResults.summary.total++;

    // TEST 7: Approve application
    try {
      const employee = await User.findOne({ email: 'testemployee@example.com' });
      const customer = await User.findOne({ email: 'testcustomer@example.com' });
      const application = await LoanApplication.findOne({ userId: customer?._id }).sort({ createdAt: -1 });

      if (application && employee) {
        application.status = 'approved';
        application.decision = 'approved';
        application.reviewedBy = employee._id.toString();
        application.reviewedAt = new Date();
        application.decisionNotes = 'Application approved - all requirements met';
        application.statusHistory = [
          ...(application.statusHistory || []),
          {
            status: 'approved',
            changedBy: employee._id.toString(),
            changedAt: new Date(),
            notes: 'Application approved by employee'
          }
        ];
        await application.save();

        testResults.tests.push({
          test: 'Approve Application',
          status: 'PASSED',
          data: {
            applicationId: application._id,
            decision: application.decision,
            status: application.status,
            reviewedBy: employee.name
          }
        });
        testResults.summary.passed++;
      } else {
        throw new Error('Application or employee not found');
      }
    } catch (error) {
      testResults.tests.push({
        test: 'Approve Application',
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      testResults.summary.failed++;
    }
    testResults.summary.total++;

    // TEST 8: Query all applications (Admin view)
    try {
      const allApplications = await LoanApplication.find().sort({ createdAt: -1 });
      const approvedCount = await LoanApplication.countDocuments({ status: 'approved' });
      const underReviewCount = await LoanApplication.countDocuments({ status: 'under_review' });
      const submittedCount = await LoanApplication.countDocuments({ status: 'submitted' });
      
      testResults.tests.push({
        test: 'Query All Applications (Admin View)',
        status: 'PASSED',
        data: {
          totalApplications: allApplications.length,
          approved: approvedCount,
          underReview: underReviewCount,
          submitted: submittedCount
        }
      });
      testResults.summary.passed++;
    } catch (error) {
      testResults.tests.push({
        test: 'Query All Applications (Admin View)',
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      testResults.summary.failed++;
    }
    testResults.summary.total++;

    // Return test results
    return NextResponse.json({
      success: true,
      message: `Tests completed: ${testResults.summary.passed}/${testResults.summary.total} passed`,
      testResults
    });

  } catch (error) {
    console.error('Error running workflow tests:', error);
    return NextResponse.json(
      { 
        error: 'Failed to run workflow tests',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

