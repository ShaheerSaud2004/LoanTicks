import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import LoanApplication from '@/models/LoanApplication';

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get total mortgage applications
    const totalApplications = await LoanApplication.countDocuments();

    // Get active employees (users with employee roles)
    const activeEmployees = await User.countDocuments({
      role: { $in: ['employee', 'senior_employee', 'supervisor'] },
    });

    // Calculate approval rate
    const approvedApplications = await LoanApplication.countDocuments({
      decision: 'approved',
    });
    const approvalRate = totalApplications > 0
      ? Math.round((approvedApplications / totalApplications) * 100)
      : 0;

    // Get pending review applications
    const pendingReview = await LoanApplication.countDocuments({
      status: { $in: ['submitted', 'under_review'] },
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalApplications,
        activeEmployees,
        approvalRate,
        pendingReview,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
