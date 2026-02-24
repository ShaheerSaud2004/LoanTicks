import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import LoanApplication from '@/models/LoanApplication';

function fmtDate(d: unknown): string {
  if (!d) return '';
  const dt = typeof d === 'string' ? new Date(d) : (d as Date);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toISOString();
}

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

    const b: any = app.borrowerInfo || {};
    const prop: any = app.propertyInfo || {};

    // Lead-style columns (adjustable once you provide the real template)
    const rows = [
      [
        'First Name',
        'Middle Name',
        'Last Name',
        'Email',
        'Phone',
        'Cell',
        'Property Address',
        'Property City',
        'Property State',
        'Property ZIP',
        'Loan Amount',
        'Property Value',
        'Status',
        'Decision',
        'Submitted At',
        'Application ID',
      ],
      [
        b.firstName || '',
        b.middleName || '',
        b.lastName || '',
        b.email || '',
        b.phone || '',
        b.cellPhone || '',
        prop.propertyAddress || '',
        prop.propertyCity || '',
        prop.propertyState || '',
        prop.propertyZipCode || '',
        typeof prop.loanAmount === 'number' ? prop.loanAmount : Number(prop.loanAmount || 0),
        typeof prop.propertyValue === 'number' ? prop.propertyValue : Number(prop.propertyValue || 0),
        app.status || '',
        app.decision || '',
        fmtDate(app.submittedAt || app.createdAt),
        String(app._id || applicationId),
      ],
    ];

    const XLSX = await import('xlsx');
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
      { wch: 14 },
      { wch: 14 },
      { wch: 18 },
      { wch: 28 },
      { wch: 16 },
      { wch: 16 },
      { wch: 28 },
      { wch: 18 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 13 },
      { wch: 14 },
      { wch: 12 },
      { wch: 24 },
      { wch: 28 },
    ];
    ws['!autofilter'] = { ref: 'A1:P1' } as any;

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

