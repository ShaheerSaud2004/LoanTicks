import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import LoanApplication from '@/models/LoanApplication';

export async function GET() {
  try {
    await connectDB();

    // Delete all existing demo data
    await User.deleteMany({
      email: {
        $in: [
          'sarah.customer@loanticks.com',
          'michael.customer@loanticks.com',
          'emily.customer@loanticks.com',
          'david.customer@loanticks.com',
          'john.employee@loanticks.com',
          'lisa.employee@loanticks.com',
          'admin.demo@loanticks.com'
        ]
      }
    });

    await LoanApplication.deleteMany({});

    // Now call setup-demo-accounts
    const baseUrl = process.env.NEXTAUTH_URL || 'https://loanticks.vercel.app';
    const response = await fetch(`${baseUrl}/api/setup-demo-accounts`);
    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Demo data refreshed successfully!',
      data
    });

  } catch (error) {
    console.error('Error refreshing demo data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to refresh demo data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

