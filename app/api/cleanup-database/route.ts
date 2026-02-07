import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import LoanApplication from '@/models/LoanApplication';

export async function POST() {
  try {
    await connectDB();

    // Delete all test/demo users (keep only real users)
    const testEmails = [
      'testcustomer@example.com',
      'testemployee@loanticks.com',
      'sarah.customer@loanticks.com',
      'michael.customer@loanticks.com',
      'emily.customer@loanticks.com',
      'david.customer@loanticks.com',
      'john.employee@loanticks.com',
      'lisa.employee@loanticks.com',
      'admin.demo@loanticks.com',
      'john.smith@loanticks.com',
      'sarah.johnson@loanticks.com',
      'mike.davis@loanticks.com',
      'admin@loanaticks.com',
      'employee@loanaticks.com',
      'customer@loanaticks.com',
    ];

    const deletedUsers = await User.deleteMany({
      email: { $in: testEmails }
    });

    // Delete all loan applications
    const deletedApplications = await LoanApplication.deleteMany({});

    // Optionally clear waitlist (comment out if you want to keep waitlist entries)
    // const deletedWaitlist = await Waitlist.deleteMany({});

    return NextResponse.json({
      success: true,
      message: 'Database cleaned successfully',
      deleted: {
        users: deletedUsers.deletedCount,
        applications: deletedApplications.deletedCount,
        // waitlist: deletedWaitlist.deletedCount,
      }
    });

  } catch (error) {
    console.error('Error cleaning database:', error);
    return NextResponse.json(
      { 
        error: 'Failed to clean database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
