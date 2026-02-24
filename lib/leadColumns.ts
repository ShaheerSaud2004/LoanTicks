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
 * All columns that can be filled or derived from Application Info are populated.
 */
export function buildLeadRow(application: Record<string, any>, ownerEmail: string): string[] {
  const b = application.borrowerInfo || {};
  const curr = application.currentAddress || {};
  const emp = application.employment || {};
  const fin = application.financialInfo || {};
  const prop = application.propertyInfo || {};
  const military = application.militaryService || {};
  const decl = application.declarations || {};
  const liabilities = application.liabilities?.items || [];
  const additionalMortgages = application.additionalMortgages || [];

  const monthlyIncome = Number(emp.monthlyIncome ?? fin?.grossMonthlyIncome ?? 0);
  const grossAnnual = monthlyIncome * 12;
  const totalLiability = Number(fin?.totalLiabilities ?? 0);
  const loanAmount = typeof prop.loanAmount === 'number' ? prop.loanAmount : Number(prop.loanAmount || 0);
  const propVal = typeof prop.propertyValue === 'number' ? prop.propertyValue : Number(prop.propertyValue || 0);

  const militaryYes = [military?.hasServed, military?.isCurrentlyServing].filter(Boolean).length > 0 ? 'Yes' : '';
  const currentlyOwningHome = curr.residencyType === 'own' ? 'Yes' : (curr.residencyType === 'rent' ? 'No' : '');

  // —— Derived from application info (logical questions) ——
  const buyingStage = application.status === 'submitted' ? 'Application Submitted' : application.status === 'under_review' ? 'Under Review' : application.status === 'approved' ? 'Approved' : application.status === 'rejected' ? 'Rejected' : application.status || '';
  const remainingMortgageBalance = liabilities
    .filter((item: { liabilityType?: string }) => /mortgage|loan/i.test(String(item.liabilityType || '')))
    .reduce((sum: number, item: { unpaidBalance?: number }) => sum + Number(item.unpaidBalance || 0), 0);
  const firstTimeHomeBuyer = decl.ownershipInterestInLast3Years === false && (curr.residencyType === 'rent' || curr.residencyType === 'living_rent_free') ? 'Yes' : (decl.ownershipInterestInLast3Years === true ? 'No' : '');
  const yearsSinceForeclosure = decl.propertyForeclosed === true ? 'Within 7 years' : (decl.propertyForeclosed === false ? 'No' : '');
  const yearsSinceBankruptcy = decl.declaredBankruptcy === true ? 'Within 7 years' : (decl.declaredBankruptcy === false ? 'No' : '');
  const propertyTBD = !prop.propertyAddress || String(prop.propertyAddress).trim().toLowerCase() === 'tbd' ? 'Yes' : 'No';
  const lienPosition = additionalMortgages.length > 0 && additionalMortgages[0].lienType ? String(additionalMortgages[0].lienType) : '';
  const desiredMonthlyPayment = loanAmount > 0 && monthlyIncome > 0 ? String(Math.round(loanAmount * 0.005)) : '';

  return [
    ownerEmail,                                                                     // 0  Primary Lead Owner Email
    fmtDateMMDDYYYY(application.createdAt),                                         // 1  Created Date (MM/DD/YYYY)
    fmtDateMMDDYYYY(application.updatedAt),                                         // 2  Last Modified Date
    '',                                                                             // 3  Lead Provided By (not collected)
    application.status || '',                                                        // 4  Lead Status
    'LOANATICKS',                                                                    // 5  Lead Source
    application.decision === 'rejected' ? 'Rejected' : '',                           // 6  Lost Reason
    b.firstName || '',                                                               // 7  First Name *
    b.lastName || '',                                                                // 8  Last Name *
    b.email || '',                                                                   // 9  Email *
    b.cellPhone || b.phone || '',                                                    // 10 Cell Phone
    b.ssn || '',                                                                    // 11 SSN
    fmtDateMMDDYYYY(b.dateOfBirth),                                                  // 12 Date of Birth (MM/DD/YYYY)
    militaryYes,                                                                    // 13 Military Service
    curr.street || '',                                                               // 14 Street Address
    curr.unit || '',                                                                // 15 Unit/Apt
    curr.city || '',                                                                // 16 City
    '',                                                                             // 17 County (not collected)
    curr.state || '',                                                                // 18 State
    curr.zipCode || '',                                                              // 19 Zip Code
    prop.occupancyType || curr.residencyType || '',                                  // 20 Occupancy
    '',                                                                             // 21 Has CoBorrower? (not collected)
    '', '', '', '', '', '', '',                                                     // 22–28 Co-borrower (not collected)
    prop.loanPurpose || '',                                                          // 29 Loan Purpose
    prop.refinancePurpose || '',                                                     // 30 Refinance Type
    '',                                                                             // 31 Mortgage Type (not collected)
    lienPosition,                                                                   // 32 Lien Position (from additionalMortgages)
    emp.employmentStatus || '',                                                      // 33 Employment Type
    String(grossAnnual),                                                             // 34 Gross Annual Income ($)
    String(totalLiability),                                                          // 35 Total Liability ($)
    buyingStage,                                                                     // 36 Buying Stage (from status)
    desiredMonthlyPayment,                                                           // 37 Desired Monthly Payment ($) (estimate)
    remainingMortgageBalance > 0 ? String(remainingMortgageBalance) : '',            // 38 Remaining Mortgage Balance (from liabilities)
    '',                                                                             // 39 Current Interest Rate (not collected)
    firstTimeHomeBuyer,                                                              // 40 First Time Home Buyer (from declarations + residency)
    '',                                                                             // 41 Has Real Estate Agent (not collected)
    currentlyOwningHome,                                                             // 42 Currently Owning a Home?
    yearsSinceForeclosure,                                                           // 43 Years Since Foreclosure (from declarations)
    yearsSinceBankruptcy,                                                            // 44 Years Since Bankruptcy (from declarations)
    prop.propertyAddress || '',                                                      // 45 Property Street Address
    prop.unit || '',                                                                // 46 Property Unit/Apt
    prop.propertyCity || '',                                                         // 47 Property City
    prop.propertyState || '',                                                         // 48 Property State
    prop.propertyZipCode || '',                                                       // 49 Property Zip Code
    '',                                                                             // 50 Property County (not collected)
    '', '', '',                                                                     // 51–53 DNC, Email Opt Out, SMS Opt Out (not collected)
    String(loanAmount),                                                              // 54 Loan Amount ($)
    propertyTBD,                                                                     // 55 Property TBD (derived: no address or TBD)
    prop.occupancyType || '',                                                        // 56 Property Usage
    prop.propertyType || '',                                                         // 57 Property Type
    b.creditScore != null ? String(b.creditScore) : '',                              // 58 Credit Score
    String(propVal),                                                                 // 59 Property Value ($)
  ];
}
