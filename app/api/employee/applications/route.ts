import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import LoanApplication from '@/models/LoanApplication';
import path from 'path';
import { mkdir, readFile, writeFile } from 'fs/promises';

import { LEAD_HEADERS, buildLeadRow } from '@/lib/leadColumns';

async function appendApprovedLeadToSheet(application: any, ownerEmail: string) {
  try {
    const XLSX = await import('xlsx');
    const leadsDir = path.join(process.cwd(), 'private', 'leads');
    await mkdir(leadsDir, { recursive: true });
    const filePath = path.join(leadsDir, 'LeadSample.xlsx');

    let rows: any[][] = [];
    try {
      const buf = await readFile(filePath);
      const wb = XLSX.read(buf, { type: 'buffer' });
      const ws = wb.Sheets['LeadSample'] || wb.Sheets[wb.SheetNames[0]];
      if (ws) rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
    } catch {
      // new file: start with header
    }

    if (!rows || rows.length === 0) {
      rows = [LEAD_HEADERS];
    }
    rows.push(buildLeadRow(application, ownerEmail));

    const newWs = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, newWs, 'LeadSample');
    const out = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
    await writeFile(filePath, out);
  } catch (err) {
    console.error('Error appending approved lead to XLSX:', err);
  }
}

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

    // Fetch applications - no need to populate as userId is just a string
    const applications = await LoanApplication.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Format the applications for response
    const formattedApplications = applications.map(app => ({
      ...app,
      _id: app._id.toString(),
      userId: app.userId?.toString() || app.userId,
      createdAt: app.createdAt?.toISOString(),
      updatedAt: app.updatedAt?.toISOString(),
      submittedAt: app.submittedAt?.toISOString(),
      reviewedAt: app.reviewedAt?.toISOString(),
      assignedAt: app.assignedAt?.toISOString(),
      // Serialize statusHistory properly
      statusHistory: app.statusHistory?.map((entry: any) => ({
        status: entry.status,
        changedBy: entry.changedBy?.toString() || entry.changedBy,
        changedAt: entry.changedAt instanceof Date ? entry.changedAt.toISOString() : entry.changedAt,
        notes: entry.notes,
      })) || [],
    }));

    return NextResponse.json({ applications: formattedApplications });
  } catch (error) {
    console.error('Error fetching employee applications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || (session.user.role !== 'employee' && session.user.role !== 'admin')) {
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

    // Ensure statusHistory is an array (can be missing on older documents)
    if (!Array.isArray(application.statusHistory)) {
      application.statusHistory = [];
      application.markModified('statusHistory');
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
        application.markModified('statusHistory');
        break;

      case 'decision':
        // Make approval/rejection decision
        if (!updateData.decision) {
          return NextResponse.json({ error: 'Decision is required' }, { status: 400 });
        }
        const decisionNotes = updateData.decisionNotes != null ? String(updateData.decisionNotes) : '';

        const wasPreviouslyApproved =
          application.decision === 'approved' || application.status === 'approved';

        application.decision = updateData.decision;
        application.decisionNotes = decisionNotes;
        application.reviewedBy = session.user.id;
        application.reviewedAt = new Date();
        application.status = updateData.status || updateData.decision;
        
        // Add to status history
        application.statusHistory.push({
          status: updateData.status || updateData.decision,
          changedBy: session.user.id,
          changedAt: new Date(),
          notes: decisionNotes
        });
        application.markModified('statusHistory');

        // If this is a fresh approval, try to append to lead XLSX (best-effort; don't fail the request)
        if (updateData.decision === 'approved' && !wasPreviouslyApproved) {
          try {
            const ownerEmail = session.user.email ? String(session.user.email) : '';
            await appendApprovedLeadToSheet(application, ownerEmail);
          } catch (e) {
            console.error('Append lead to XLSX failed (non-fatal):', e);
          }
        }
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
        application.markModified('statusHistory');
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    try {
      await application.save();
    } catch (saveErr) {
      console.error('Application save error:', saveErr);
      const saveMessage = saveErr instanceof Error ? saveErr.message : 'Save failed';
      return NextResponse.json(
        { error: process.env.NODE_ENV === 'development' ? saveMessage : 'Failed to save application' },
        { status: 500 }
      );
    }

    // Get the updated application
    const updatedApplication = await LoanApplication.findById(applicationId).lean();

    return NextResponse.json({ 
      message: 'Application updated successfully',
      application: {
        ...updatedApplication,
        _id: updatedApplication?._id.toString(),
        createdAt: updatedApplication?.createdAt?.toISOString(),
        updatedAt: updatedApplication?.updatedAt?.toISOString(),
        submittedAt: updatedApplication?.submittedAt?.toISOString(),
        reviewedAt: updatedApplication?.reviewedAt?.toISOString(),
        assignedAt: updatedApplication?.assignedAt?.toISOString()
      }
    });
  } catch (error) {
    console.error('Error updating application:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: process.env.NODE_ENV === 'development' ? message : 'Internal server error' },
      { status: 500 }
    );
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