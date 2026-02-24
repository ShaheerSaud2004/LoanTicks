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

/**
 * Build one row for the lead spreadsheet. Each value maps to LEAD_HEADERS by index.
 * Application Info (employee UI) fields are mapped below; columns we don't collect are ''.
 */
export function buildLeadRow(application: Record<string, any>, ownerEmail: string): string[] {
  const b = application.borrowerInfo || {};
  const curr = application.currentAddress || {};
  const emp = application.employment || {};
  const fin = application.financialInfo || {};
  const prop = application.propertyInfo || {};
  const military = application.militaryService || {};
  const monthlyIncome = Number(emp.monthlyIncome ?? fin?.grossMonthlyIncome ?? 0);
  const grossAnnual = monthlyIncome * 12;
  const totalLiability = Number(fin?.totalLiabilities ?? 0);
  const loanAmount = typeof prop.loanAmount === 'number' ? prop.loanAmount : Number(prop.loanAmount || 0);
  const propVal = typeof prop.propertyValue === 'number' ? prop.propertyValue : Number(prop.propertyValue || 0);

  const militaryYes = [military?.hasServed, military?.isCurrentlyServing].filter(Boolean).length > 0 ? 'Yes' : '';
  const currentlyOwningHome = curr.residencyType === 'own' ? 'Yes' : (curr.residencyType === 'rent' ? 'No' : '');

  return [
    ownerEmail,                                                                    // 0  Primary Lead Owner Email
    fmtDateMMDDYYYY(application.createdAt),                                        // 1  Created Date (MM/DD/YYYY)
    fmtDateMMDDYYYY(application.updatedAt),                                        // 2  Last Modified Date
    '',                                                                             // 3  Lead Provided By (not collected)
    application.status || '',                                                        // 4  Lead Status
    'LOANATICKS',                                                                   // 5  Lead Source
    application.decision === 'rejected' ? 'Rejected' : '',                           // 6  Lost Reason
    b.firstName || '',                                                               // 7  First Name *
    b.lastName || '',                                                                // 8  Last Name *
    b.email || '',                                                                   // 9  Email *
    b.cellPhone || b.phone || '',                                                   // 10 Cell Phone
    b.ssn || '',                                                                     // 11 SSN
    fmtDateMMDDYYYY(b.dateOfBirth),                                                 // 12 Date of Birth (MM/DD/YYYY)
    militaryYes,                                                                    // 13 Military Service (borrowerInfo + militaryService)
    curr.street || '',                                                               // 14 Street Address (currentAddress)
    curr.unit || '',                                                                 // 15 Unit/Apt
    curr.city || '',                                                                 // 16 City
    '',                                                                             // 17 County (not collected)
    curr.state || '',                                                                // 18 State
    curr.zipCode || '',                                                              // 19 Zip Code
    prop.occupancyType || curr.residencyType || '',                                  // 20 Occupancy (property or current)
    '',                                                                             // 21 Has CoBorrower? (not collected)
    '', '', '', '', '', '', '',                                                     // 22–28 Co-borrower fields (not collected)
    prop.loanPurpose || '',                                                          // 29 Loan Purpose (propertyInfo)
    prop.refinancePurpose || '',                                                     // 30 Refinance Type
    '',                                                                             // 31 Mortgage Type (not collected)
    '',                                                                             // 32 Lien Position (not collected)
    emp.employmentStatus || '',                                                      // 33 Employment Type (employment)
    String(grossAnnual),                                                             // 34 Gross Annual Income ($) (employment.monthlyIncome * 12 / financialInfo)
    String(totalLiability),                                                         // 35 Total Liability ($) (financialInfo)
    '', '', '', '', '', '',                                                         // 36–43 (8 cols; 6 placeholders + 44–45 to keep row 60)
    currentlyOwningHome,                                                             // 44 Currently Owning a Home? (currentAddress.residencyType)
    '',                                                                             // 45 Years Since Foreclosure (not collected)
    '',                                                                             // 46 Years Since Bankruptcy (not collected)
    prop.propertyAddress || '',                                                       // 47 Property Street Address
    prop.unit || '',                                                                 // 48 Property Unit/Apt
    prop.propertyCity || '',                                                          // 49 Property City
    prop.propertyState || '',                                                         // 50 Property State
    prop.propertyZipCode || '',                                                       // 51 Property Zip Code
    '', '', '', '',                                                                 // 52–55 Property County, DNC, Email Opt Out, SMS Opt Out (not collected)
    String(loanAmount),                                                              // 54 Loan Amount ($)
    '',                                                                             // 55 Property TBD (not collected)
    prop.occupancyType || '',                                                         // 56 Property Usage (propertyInfo.occupancyType)
    prop.propertyType || '',                                                          // 57 Property Type
    b.creditScore != null ? String(b.creditScore) : '',                              // 58 Credit Score (borrowerInfo)
    String(propVal),                                                                 // 59 Property Value ($)
  ];
}
