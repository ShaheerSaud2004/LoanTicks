import { NextResponse } from 'next/server';

export async function GET() {
  const testResults = {
    timestamp: new Date().toISOString(),
    tests: [] as any[],
    summary: { passed: 0, failed: 0, total: 0 }
  };

  // Test 1: Check environment variables
  try {
    const hasMongoUri = !!process.env.MONGODB_URI;
    const hasAuthSecret = !!process.env.NEXTAUTH_SECRET;
    
    if (hasMongoUri && hasAuthSecret) {
      testResults.tests.push({
        test: 'Environment Variables Check',
        status: 'PASSED',
        data: {
          MONGODB_URI: hasMongoUri ? 'Set' : 'Missing',
          NEXTAUTH_SECRET: hasAuthSecret ? 'Set' : 'Missing'
        }
      });
      testResults.summary.passed++;
    } else {
      throw new Error('Missing environment variables');
    }
  } catch (error) {
    testResults.tests.push({
      test: 'Environment Variables Check',
      status: 'FAILED',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    testResults.summary.failed++;
  }
  testResults.summary.total++;

  // Test 2: Check database connection
  try {
    const connectDB = (await import('@/lib/mongodb')).default;
    await connectDB();
    
    testResults.tests.push({
      test: 'Database Connection',
      status: 'PASSED',
      data: { message: 'Successfully connected to MongoDB' }
    });
    testResults.summary.passed++;
  } catch (error) {
    testResults.tests.push({
      test: 'Database Connection',
      status: 'FAILED',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    testResults.summary.failed++;
  }
  testResults.summary.total++;

  // Test 3: Check models are accessible
  try {
    const User = (await import('@/models/User')).default;
    const LoanApplication = (await import('@/models/LoanApplication')).default;
    
    testResults.tests.push({
      test: 'Models Check',
      status: 'PASSED',
      data: {
        User: User ? 'Available' : 'Missing',
        LoanApplication: LoanApplication ? 'Available' : 'Missing'
      }
    });
    testResults.summary.passed++;
  } catch (error) {
    testResults.tests.push({
      test: 'Models Check',
      status: 'FAILED',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    testResults.summary.failed++;
  }
  testResults.summary.total++;

  // Test 4: Check rate engines
  try {
    const { getAllRates, analyzeRates } = await import('@/lib/rateEngines');
    
    testResults.tests.push({
      test: 'Rate Engines Check',
      status: 'PASSED',
      data: {
        getAllRates: typeof getAllRates === 'function' ? 'Available' : 'Missing',
        analyzeRates: typeof analyzeRates === 'function' ? 'Available' : 'Missing'
      }
    });
    testResults.summary.passed++;
  } catch (error) {
    testResults.tests.push({
      test: 'Rate Engines Check',
      status: 'FAILED',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    testResults.summary.failed++;
  }
  testResults.summary.total++;

  // Test 5: API Routes Inventory
  const apiRoutes = [
    '/api/auth/[...nextauth]',
    '/api/admin/employees',
    '/api/loan-application',
    '/api/get-rates',
    '/api/employee/applications',
    '/api/test-workflow',
    '/api/test-all-routes',
    '/api/upload-documents'
  ];

  testResults.tests.push({
    test: 'API Routes Inventory',
    status: 'INFO',
    data: {
      totalRoutes: apiRoutes.length,
      routes: apiRoutes
    }
  });

  // Test 6: Pages Inventory
  const pages = [
    '/ (Home/Root)',
    '/login',
    '/admin/dashboard',
    '/admin/employees',
    '/customer/dashboard',
    '/customer/loan-application',
    '/employee/dashboard',
    '/employee/applications/[id]',
    '/employee/applications/[id]/edit',
    '/employee/applications/[id]/decision'
  ];

  testResults.tests.push({
    test: 'Pages Inventory',
    status: 'INFO',
    data: {
      totalPages: pages.length,
      pages: pages
    }
  });

  // Test 7: Check for test accounts
  try {
    const connectDB = (await import('@/lib/mongodb')).default;
    const User = (await import('@/models/User')).default;
    
    await connectDB();
    
    const adminExists = await User.findOne({ email: 'admin@loanaticks.com' });
    const employeeExists = await User.findOne({ email: 'employee@loanaticks.com' });
    const customerExists = await User.findOne({ email: 'customer@loanaticks.com' });
    
    testResults.tests.push({
      test: 'Test Accounts Check',
      status: adminExists && employeeExists && customerExists ? 'PASSED' : 'WARNING',
      data: {
        admin: adminExists ? 'Exists' : 'Missing',
        employee: employeeExists ? 'Exists' : 'Missing',
        customer: customerExists ? 'Exists' : 'Missing'
      }
    });
    
    if (adminExists && employeeExists && customerExists) {
      testResults.summary.passed++;
    }
  } catch (error) {
    testResults.tests.push({
      test: 'Test Accounts Check',
      status: 'FAILED',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    testResults.summary.failed++;
  }
  testResults.summary.total++;

  // Test 8: Check application count
  try {
    const connectDB = (await import('@/lib/mongodb')).default;
    const LoanApplication = (await import('@/models/LoanApplication')).default;
    
    await connectDB();
    
    const totalApps = await LoanApplication.countDocuments();
    const submittedApps = await LoanApplication.countDocuments({ status: 'submitted' });
    const underReviewApps = await LoanApplication.countDocuments({ status: 'under_review' });
    const approvedApps = await LoanApplication.countDocuments({ status: 'approved' });
    
    testResults.tests.push({
      test: 'Application Statistics',
      status: 'INFO',
      data: {
        total: totalApps,
        submitted: submittedApps,
        under_review: underReviewApps,
        approved: approvedApps
      }
    });
  } catch (error) {
    testResults.tests.push({
      test: 'Application Statistics',
      status: 'FAILED',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  return NextResponse.json({
    success: true,
    message: `System Check: ${testResults.summary.passed}/${testResults.summary.total} tests passed`,
    testResults,
    recommendations: generateRecommendations(testResults)
  });
}

function generateRecommendations(testResults: any): string[] {
  const recommendations: string[] = [];
  
  // Check if all critical tests passed
  const criticalTests = ['Environment Variables Check', 'Database Connection', 'Models Check'];
  const failedCritical = testResults.tests.filter((t: any) => 
    criticalTests.includes(t.test) && t.status === 'FAILED'
  );
  
  if (failedCritical.length > 0) {
    recommendations.push('⚠️ Critical system components are not functioning properly');
  } else {
    recommendations.push('✅ All critical system components are operational');
  }
  
  // Check test accounts
  const testAccountCheck = testResults.tests.find((t: any) => t.test === 'Test Accounts Check');
  if (testAccountCheck && testAccountCheck.status !== 'PASSED') {
    recommendations.push('💡 Run /api/create-test-accounts to set up demo accounts');
  }
  
  if (testResults.summary.failed === 0) {
    recommendations.push('🎉 System is fully operational and ready for testing');
  }
  
  return recommendations;
}

