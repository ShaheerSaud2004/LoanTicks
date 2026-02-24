import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import LoanApplication from '@/models/LoanApplication';
import { LEAD_HEADERS, buildLeadRow } from '@/lib/leadColumns';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'employee')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('id') || searchParams.get('applicationId');
    if (!applicationId) {
      return NextResponse.json({ error: 'application id required' }, { status: 400 });
    }

    await connectDB();
    const app = await LoanApplication.findById(applicationId).lean();
    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const ownerEmail = session?.user?.email ?? '';
    const row = buildLeadRow(app as Record<string, any>, ownerEmail);

    const rows = [LEAD_HEADERS, row];
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 1, c: LEAD_HEADERS.length - 1 } }) } as any;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'LeadSample');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
    const filename = `LeadSample-${String(applicationId).slice(-8)}.xlsx`;

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export lead xlsx error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Export failed' },
      { status: 500 }
    );
  }
}
