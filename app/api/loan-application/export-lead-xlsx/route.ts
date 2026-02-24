import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import LoanApplication from '@/models/LoanApplication';

function fmtDateMMDDYYYY(d: unknown): string {
  if (!d) return '';
  const dt = typeof d === 'string' ? new Date(d) : (d as Date);
  if (Number.isNaN(dt.getTime())) return '';
  const m = dt.getMonth() + 1;
  const day = dt.getDate();
  const y = dt.getFullYear();
  return `${m.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${y}`;
}

// Lead columns to match expected spreadsheet format
const LEAD_HEADERS = [
  'Primary Lead Owner Email',
  'Created Date (MM/DD/YYYY)',
  'Last Modified Date',
  'Lead Provided By',
  'Lead Status',
  'Lead Source',
  'Lost Reason',
  'First Name *',
  'Last Name *',
  'Email *',
  'Cell Phone',
  'SSN',
  'Date of Birth (MM/DD/YYYY)',
  'Military Service',
  'Street Address',
  'Unit/Apt',
  'City',
  'County',
  'State',
  'Zip Code',
  'Occupancy',
  'Has CoBorrower?',
  'Co-Borrower First Name',
  'Co-Borrower Last Name',
  'Co-Borrower Email',
  'Co-Borrower Cell Phone',
  'Co-Borrower SSN',
  'Co-Borrower Date of Birth (MM/DD/YYYY)',
  'Co-Borrower Military Service',
  'Loan Purpose',
  'Refinance Type',
  'Mortgage Type',
  'Lien Position',
  'Employment Type',
  'Gross Annual Income ($)',
  'Total Liability ($)',
  'Buying Stage',
  'Desired Monthly Payment ($)',
  'Remaining Mortgage Balance (If Any) ($)',
  'Current Interest Rate (If Any) (%)',
  'First Time Home Buyer',
  'Has Real Estate Agent',
  'Currently Owning a Home?',
  'Years Since Foreclosure',
  'Years Since Bankruptcy',
  'Property Street Address',
  'Property Unit/Apt',
  'Property City',
  'Property State',
  'Property Zip Code',
  'Property County',
  'DNC Request',
  'Email Opt Out',
  'SMS Opt Out',
  'Loan Amount ($)',
  'Property TBD',
  'Property Usage',
  'Property Type',
  'Credit Score',
  'Property Value ($)',
];

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
    const curr: any = app.currentAddress || {};
    const emp: any = app.employment || {};
    const fin: any = app.financialInfo || {};
    const prop: any = app.propertyInfo || {};
    const military: any = app.militaryService || {};

    const loanAmount = typeof prop.loanAmount === 'number' ? prop.loanAmount : Number(prop.loanAmount || 0);
    const monthlyIncome = Number(emp.monthlyIncome || fin.grossMonthlyIncome || 0);
    const grossAnnual = monthlyIncome * 12;
    const totalLiability = Number(fin.totalLiabilities || 0);

    // One row matching LEAD_HEADERS order; empty string where we don't have data
    const row: string[] = [
      session?.user?.email ?? '',                                    // Primary Lead Owner Email
      fmtDateMMDDYYYY(app.createdAt),                                // Created Date (MM/DD/YYYY)
      fmtDateMMDDYYYY(app.updatedAt),                                // Last Modified Date
      '',                                                            // Lead Provided By
      app.status || '',                                              // Lead Status
      'LOANATICKS',                                                  // Lead Source
      app.decision === 'rejected' ? 'Rejected' : '',                 // Lost Reason
      b.firstName || '',                                             // First Name *
      b.lastName || '',                                              // Last Name *
      b.email || '',                                                 // Email *
      b.cellPhone || b.phone || '',                                  // Cell Phone
      b.ssn || '',                                                   // SSN (may be masked)
      fmtDateMMDDYYYY(b.dateOfBirth),                                // Date of Birth (MM/DD/YYYY)
      [military?.hasServed, military?.isCurrentlyServing].filter(Boolean).length ? 'Yes' : '', // Military Service
      curr.street || '',                                             // Street Address
      curr.unit || '',                                               // Unit/Apt
      curr.city || '',                                               // City
      '',                                                            // County
      curr.state || '',                                              // State
      curr.zipCode || '',                                            // Zip Code
      prop.occupancyType || curr.residencyType || '',                // Occupancy
      '',                                                            // Has CoBorrower?
      '', '', '', '', '', '', '',                                    // Co-Borrower fields
      prop.loanPurpose || '',                                        // Loan Purpose
      prop.refinancePurpose || '',                                   // Refinance Type
      '',                                                            // Mortgage Type
      '',                                                            // Lien Position
      emp.employmentStatus || '',                                     // Employment Type
      String(grossAnnual),                                           // Gross Annual Income ($)
      String(totalLiability),                                        // Total Liability ($)
      '',                                                            // Buying Stage
      '',                                                            // Desired Monthly Payment ($)
      '',                                                            // Remaining Mortgage Balance (If Any) ($)
      '',                                                            // Current Interest Rate (If Any) (%)
      '', '', '',                                                    // First Time Home Buyer, Has Real Estate Agent, Currently Owning a Home?
      '', '',                                                        // Years Since Foreclosure, Years Since Bankruptcy
      prop.propertyAddress || '',                                    // Property Street Address
      prop.unit || '',                                               // Property Unit/Apt
      prop.propertyCity || '',                                       // Property City
      prop.propertyState || '',                                      // Property State
      prop.propertyZipCode || '',                                    // Property Zip Code
      '',                                                            // Property County
      '', '', '',                                                    // DNC Request, Email Opt Out, SMS Opt Out
      String(loanAmount),                                            // Loan Amount ($)
      '',                                                            // Property TBD
      prop.occupancyType || '',                                      // Property Usage
      prop.propertyType || '',                                       // Property Type
      b.creditScore != null ? String(b.creditScore) : '',             // Credit Score
      String(typeof prop.propertyValue === 'number' ? prop.propertyValue : Number(prop.propertyValue || 0)), // Property Value ($)
    ];

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
