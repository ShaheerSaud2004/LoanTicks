/**
 * Lead spreadsheet column headers – shared by Excel export and ARIVE table display.
 */
export const LEAD_HEADERS = [
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

export function fmtDateMMDDYYYY(d: unknown): string {
  if (!d) return '';
  const dt = typeof d === 'string' ? new Date(d) : (d as Date);
  if (Number.isNaN(dt.getTime())) return '';
  const m = dt.getMonth() + 1;
  const day = dt.getDate();
  const y = dt.getFullYear();
  return `${m.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${y}`;
}

export function buildLeadRow(application: Record<string, any>, ownerEmail: string): string[] {
  const b = application.borrowerInfo || {};
  const curr = application.currentAddress || {};
  const emp = application.employment || {};
  const fin = application.financialInfo || {};
  const prop = application.propertyInfo || {};
  const military = application.militaryService || {};
  const monthlyIncome = Number(emp.monthlyIncome || fin?.grossMonthlyIncome || 0);
  const grossAnnual = monthlyIncome * 12;
  const totalLiability = Number(fin?.totalLiabilities || 0);
  const loanAmount = typeof prop.loanAmount === 'number' ? prop.loanAmount : Number(prop.loanAmount || 0);
  const propVal = typeof prop.propertyValue === 'number' ? prop.propertyValue : Number(prop.propertyValue || 0);
  return [
    ownerEmail,
    fmtDateMMDDYYYY(application.createdAt),
    fmtDateMMDDYYYY(application.updatedAt),
    '', application.status || '', 'LOANATICKS', application.decision === 'rejected' ? 'Rejected' : '',
    b.firstName || '', b.lastName || '', b.email || '', b.cellPhone || b.phone || '', b.ssn || '',
    fmtDateMMDDYYYY(b.dateOfBirth),
    [military?.hasServed, military?.isCurrentlyServing].filter(Boolean).length ? 'Yes' : '',
    curr.street || '', curr.unit || '', curr.city || '', '', curr.state || '', curr.zipCode || '',
    prop.occupancyType || curr.residencyType || '', '',
    '', '', '', '', '', '', '', '',
    prop.loanPurpose || '', prop.refinancePurpose || '', '', '', emp.employmentStatus || '', String(grossAnnual), String(totalLiability),
    '', '', '', '', '', '', '', '', '',
    prop.propertyAddress || '', prop.unit || '', prop.propertyCity || '', prop.propertyState || '', prop.propertyZipCode || '', '',
    '', '', '', String(loanAmount), '', prop.occupancyType || '', prop.propertyType || '',
    b.creditScore != null ? String(b.creditScore) : '', String(propVal),
  ];
}
