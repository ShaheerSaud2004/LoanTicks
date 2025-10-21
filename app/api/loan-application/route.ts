import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import LoanApplication from '@/models/LoanApplication';
import { applicationRateLimiter } from '@/lib/rateLimiter';

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await applicationRateLimiter(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const session = await auth();

    if (!session || session.user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();

    const loanApplication = new LoanApplication({
      ...data,
      userId: session.user.id,
    });

    await loanApplication.save();

    return NextResponse.json({
      success: true,
      applicationId: loanApplication._id,
      message: 'Loan application saved successfully',
    });
  } catch (error) {
    console.error('Error saving loan application:', error);
    return NextResponse.json(
      { error: 'Failed to save loan application' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('id');

    if (applicationId) {
      // Get specific application
      const application = await LoanApplication.findById(applicationId);
      
      if (!application) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }

      // Check permission
      if (
        session.user.role === 'customer' &&
        application.userId !== session.user.id
      ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      return NextResponse.json({ application });
    } else {
      // Get all applications for user
      const query =
        session.user.role === 'customer'
          ? { userId: session.user.id }
          : {}; // Admin/Employee can see all

      const applications = await LoanApplication.find(query).sort({
        createdAt: -1,
      });

      return NextResponse.json({ applications });
    }
  } catch (error) {
    console.error('Error fetching loan applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loan applications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { applicationId, ...updates } = await request.json();

    const application = await LoanApplication.findById(applicationId);

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check permission
    if (
      session.user.role === 'customer' &&
      application.userId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Track employee actions
    if (session.user.role === 'employee') {
      // If employee is viewing/working on application, assign it to them
      if (!application.assignedTo) {
        application.assignedTo = session.user.id;
        application.assignedAt = new Date();
      }
      
      // Track status changes
      if (updates.status && updates.status !== application.status) {
        const statusHistoryEntry = {
          status: updates.status,
          changedBy: session.user.id,
          changedAt: new Date(),
          notes: `Status changed to ${updates.status} by employee`
        };
        application.statusHistory = [...(application.statusHistory || []), statusHistoryEntry];
      }
      
      // Track decision changes
      if (updates.decision && updates.decision !== application.decision) {
        application.reviewedBy = session.user.id;
        application.reviewedAt = new Date();
        
        const statusHistoryEntry = {
          status: updates.decision,
          changedBy: session.user.id,
          changedAt: new Date(),
          notes: `Decision: ${updates.decision}${updates.decisionNotes ? ` - ${updates.decisionNotes}` : ''}`
        };
        application.statusHistory = [...(application.statusHistory || []), statusHistoryEntry];
      }
    }

    // Update application
    Object.assign(application, updates);
    await application.save();

    return NextResponse.json({
      success: true,
      application,
      message: 'Loan application updated successfully',
    });
  } catch (error) {
    console.error('Error updating loan application:', error);
    return NextResponse.json(
      { error: 'Failed to update loan application' },
      { status: 500 }
    );
  }
}

