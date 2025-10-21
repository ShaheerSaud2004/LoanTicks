import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import LoanApplication from '@/models/LoanApplication';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'employee') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');

    // Build query
    const query: Record<string, string> = {};
    if (status) {
      query.status = status;
    }
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    // Fetch applications with populated user data
    const applications = await LoanApplication.find(query)
      .populate('assignedTo', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error fetching employee applications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'employee') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { applicationId, action, ...updateData } = body;

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    const application = await LoanApplication.findById(applicationId);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Handle different actions
    switch (action) {
      case 'assign':
        // Assign application to current employee
        application.assignedTo = session.user.id;
        application.assignedAt = new Date();
        application.status = 'under_review';
        
        // Add to status history
        application.statusHistory.push({
          status: 'under_review',
          changedBy: session.user.id,
          changedAt: new Date(),
          notes: 'Application assigned for review'
        });
        break;

      case 'decision':
        // Make approval/rejection decision
        if (!updateData.decision || !updateData.decisionNotes) {
          return NextResponse.json({ error: 'Decision and notes are required' }, { status: 400 });
        }

        application.decision = updateData.decision;
        application.decisionNotes = updateData.decisionNotes;
        application.reviewedBy = session.user.id;
        application.reviewedAt = new Date();
        application.status = updateData.status || updateData.decision;
        
        // Add to status history
        application.statusHistory.push({
          status: updateData.status || updateData.decision,
          changedBy: session.user.id,
          changedAt: new Date(),
          notes: updateData.decisionNotes
        });
        break;

      case 'update_status':
        // Update application status
        if (!updateData.status) {
          return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        application.status = updateData.status;
        
        // Add to status history
        application.statusHistory.push({
          status: updateData.status,
          changedBy: session.user.id,
          changedAt: new Date(),
          notes: updateData.notes || 'Status updated'
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await application.save();

    // Populate the updated application
    const updatedApplication = await LoanApplication.findById(applicationId)
      .populate('assignedTo', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName email');

    return NextResponse.json({ 
      message: 'Application updated successfully',
      application: updatedApplication 
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'employee') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { applicationId, action } = body;

    if (!applicationId || !action) {
      return NextResponse.json({ error: 'Application ID and action are required' }, { status: 400 });
    }

    const application = await LoanApplication.findById(applicationId);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Handle assignment action
    if (action === 'assign') {
      application.assignedTo = session.user.id;
      application.assignedAt = new Date();
      application.status = 'under_review';
      
      // Add to status history
      application.statusHistory.push({
        status: 'under_review',
        changedBy: session.user.id,
        changedAt: new Date(),
        notes: 'Application assigned for review'
      });

      await application.save();

      return NextResponse.json({ 
        message: 'Application assigned successfully',
        application 
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing employee action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}