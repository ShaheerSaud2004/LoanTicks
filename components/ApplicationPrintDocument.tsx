'use client';

import React from 'react';

export interface PrintApplication {
  _id: string;
  status?: string;
  decision?: string;
  submittedAt?: string;
  createdAt?: string;
  borrowerInfo?: Record<string, unknown>;
  currentAddress?: Record<string, unknown>;
  employment?: Record<string, unknown>;
  financialInfo?: Record<string, unknown>;
  propertyInfo?: Record<string, unknown>;
  declarations?: Record<string, unknown>;
  creditCardAuthorization?: Record<string, unknown>;
  documents?: Array<{ name?: string; type?: string; uploadedAt?: string }>;
  statusHistory?: Array<{ status?: string; changedAt?: string; notes?: string }>;
}

function fmt(val: unknown): string {
  if (val == null || val === '') return '—';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (val instanceof Date) return val.toLocaleDateString();
  if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}/)) return new Date(val).toLocaleDateString();
  return String(val);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 break-inside-avoid">
      <h2 className="text-sm font-bold uppercase tracking-wide text-gray-600 border-b border-gray-300 pb-1 mb-3">
        {title}
      </h2>
      <div className="text-sm text-gray-900 space-y-1.5">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="font-medium text-gray-600 min-w-[140px]">{label}</span>
      <span>{value ?? '—'}</span>
    </div>
  );
}

export default function ApplicationPrintDocument({ application }: { application: PrintApplication }) {
  const b = application.borrowerInfo || {};
  const addr = application.currentAddress || {};
  const emp = application.employment || {};
  const fin = application.financialInfo || {};
  const prop = application.propertyInfo || {};
  const decl = application.declarations || {};
  const auth = application.creditCardAuthorization || {};
  const docs = application.documents || [];

  return (
    <div className="bg-white text-gray-900 print:bg-white print:text-black" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Header */}
      <header className="text-center border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-2xl font-bold tracking-tight">LOANATICKS</h1>
        <p className="text-sm text-gray-600 mt-1">Loan Application – Official Record</p>
        <div className="flex justify-center gap-6 mt-3 text-sm">
          <span>Application # {application._id?.slice(-8) || '—'}</span>
          <span>Submitted: {fmt(application.submittedAt || application.createdAt)}</span>
          <span>Status: {fmt(application.status)}</span>
          {application.decision && <span>Decision: {String(application.decision).toUpperCase()}</span>}
        </div>
      </header>

      {/* Borrower */}
      <Section title="1. Borrower Information">
        <Row label="Name" value={`${fmt(b.firstName)} ${fmt(b.middleName)} ${fmt(b.lastName)} ${fmt(b.suffix)}`.replace(/\s+/g, ' ').trim()} />
        <Row label="Date of Birth" value={fmt(b.dateOfBirth)} />
        <Row label="SSN" value={fmt(b.ssn)} />
        <Row label="Marital Status" value={fmt(b.maritalStatus)} />
        <Row label="Dependents" value={fmt(b.dependents)} />
        <Row label="Citizenship" value={fmt(b.citizenshipType)} />
        <Row label="Credit pull consent" value={fmt(b.creditPullConsent)} />
      </Section>

      {/* Contact */}
      <Section title="2. Contact Information">
        <Row label="Email" value={fmt(b.email)} />
        <Row label="Phone" value={fmt(b.phone)} />
        <Row label="Cell" value={fmt(b.cellPhone)} />
        <Row label="Work phone" value={fmt(emp.phone || b.workPhone)} />
        <Row label="Preferred contact" value={fmt(b.preferredContactMethod)} />
      </Section>

      {/* Current Address */}
      <Section title="3. Current Address">
        <Row label="Street" value={fmt(addr.street)} />
        <Row label="Unit" value={fmt(addr.unit)} />
        <Row label="City" value={fmt(addr.city)} />
        <Row label="State" value={fmt(addr.state)} />
        <Row label="ZIP" value={fmt(addr.zipCode)} />
        <Row label="Housing" value={fmt(addr.residencyType)} />
        <Row label="Monthly payment" value={typeof addr.monthlyPayment === 'number' ? `$${addr.monthlyPayment}` : fmt(addr.monthlyPayment)} />
        <Row label="Years at address" value={fmt(addr.yearsAtAddress)} />
      </Section>

      {/* Employment */}
      <Section title="4. Employment">
        <Row label="Status" value={fmt(emp.employmentStatus)} />
        <Row label="Employer" value={fmt(emp.employerName)} />
        <Row label="Position" value={fmt(emp.position)} />
        <Row label="Monthly income" value={typeof emp.monthlyIncome === 'number' ? `$${Number(emp.monthlyIncome).toLocaleString()}` : fmt(emp.monthlyIncome)} />
        <Row label="Years in line of work" value={fmt(emp.yearsInLineOfWork)} />
      </Section>

      {/* Financial */}
      <Section title="5. Financial Information">
        <Row label="Gross monthly income" value={typeof fin.grossMonthlyIncome === 'number' ? `$${Number(fin.grossMonthlyIncome).toLocaleString()}` : fmt(fin.grossMonthlyIncome)} />
        <Row label="Other income" value={typeof fin.otherIncome === 'number' ? `$${Number(fin.otherIncome).toLocaleString()}` : fmt(fin.otherIncome)} />
        <Row label="Total assets" value={typeof fin.totalAssets === 'number' ? `$${Number(fin.totalAssets).toLocaleString()}` : fmt(fin.totalAssets)} />
        <Row label="Total liabilities" value={typeof fin.totalLiabilities === 'number' ? `$${Number(fin.totalLiabilities).toLocaleString()}` : fmt(fin.totalLiabilities)} />
        <Row label="Checking balance" value={typeof fin.checkingAccountBalance === 'number' ? `$${Number(fin.checkingAccountBalance).toLocaleString()}` : fmt(fin.checkingAccountBalance)} />
        <Row label="Savings balance" value={typeof fin.savingsAccountBalance === 'number' ? `$${Number(fin.savingsAccountBalance).toLocaleString()}` : fmt(fin.savingsAccountBalance)} />
      </Section>

      {/* Property */}
      <Section title="6. Property Information">
        <Row label="Address" value={[fmt(prop.propertyAddress), fmt(prop.unit), fmt(prop.propertyCity), fmt(prop.propertyState), fmt(prop.propertyZipCode)].filter(Boolean).join(', ')} />
        <Row label="Property value" value={typeof prop.propertyValue === 'number' ? `$${Number(prop.propertyValue).toLocaleString()}` : fmt(prop.propertyValue)} />
        <Row label="Loan amount" value={typeof prop.loanAmount === 'number' ? `$${Number(prop.loanAmount).toLocaleString()}` : fmt(prop.loanAmount)} />
        <Row label="Loan purpose" value={fmt(prop.loanPurpose)} />
        <Row label="Down payment" value={typeof prop.downPaymentAmount === 'number' ? `$${Number(prop.downPaymentAmount).toLocaleString()}` : fmt(prop.downPaymentAmount)} />
        <Row label="Down payment %" value={typeof prop.downPaymentPercentage === 'number' ? `${Number(prop.downPaymentPercentage).toFixed(1)}%` : fmt(prop.downPaymentPercentage)} />
      </Section>

      {/* Declarations (Section 12 style) */}
      <Section title="7. Declarations (Section 12)">
        <Row label="Co-signer/guarantor on undisclosed debt?" value={fmt(decl.cosignerOrGuarantor)} />
        <Row label="Outstanding judgments?" value={fmt(decl.outstandingJudgments)} />
        <Row label="Delinquent on Federal debt?" value={fmt(decl.federalDebtDelinquent)} />
        <Row label="Party to lawsuit (financial liability)?" value={fmt(decl.lawsuitParty)} />
        <Row label="Conveyed title in lieu of foreclosure (7 yr)?" value={fmt(decl.conveyedTitleInLieu)} />
        <Row label="Pre-foreclosure/short sale (7 yr)?" value={fmt(decl.completedPreForeclosureSale)} />
        <Row label="Property foreclosed (7 yr)?" value={fmt(decl.propertyForeclosed)} />
        <Row label="Declared bankruptcy (7 yr)?" value={fmt(decl.declaredBankruptcy)} />
        {decl.bankruptcyChapter && <Row label="Bankruptcy chapter(s)" value={fmt(decl.bankruptcyChapter)} />}
        <Row label="Obligated on loan secured by property?" value={fmt(decl.loanOnProperty)} />
      </Section>

      {/* Credit Card & Authorization */}
      {(auth.authBorrower1Name || auth.authorizationAgreed) && (
        <Section title="8. Credit Card & Borrower Authorization">
          <Row label="Borrower 1 name" value={fmt(auth.authBorrower1Name)} />
          <Row label="Borrower 1 SSN" value={fmt(auth.authBorrower1SSN)} />
          <Row label="Borrower 1 DOB" value={fmt(auth.authBorrower1DOB)} />
          <Row label="Borrower 2 name" value={fmt(auth.authBorrower2Name)} />
          <Row label="Borrower 2 SSN" value={fmt(auth.authBorrower2SSN)} />
          <Row label="Borrower 2 DOB" value={fmt(auth.authBorrower2DOB)} />
          <Row label="Card type" value={fmt(auth.cardType)} />
          <Row label="Card last 4" value={auth.cardLast4 ? `****${auth.cardLast4}` : '—'} />
          <Row label="Name on card" value={fmt(auth.nameOnCard)} />
          <Row label="Billing address" value={fmt(auth.cardBillingAddress)} />
          <Row label="Amount verified" value={fmt(auth.amountVerified)} />
          <Row label="Authorization agreed" value={fmt(auth.authorizationAgreed)} />
          <Row label="Signature 1" value={fmt(auth.authSignature1)} />
          <Row label="Date 1" value={fmt(auth.authDate1)} />
          <Row label="Signature 2" value={fmt(auth.authSignature2)} />
          <Row label="Date 2" value={fmt(auth.authDate2)} />
        </Section>
      )}

      {/* Documents */}
      <Section title={auth.authBorrower1Name || auth.authorizationAgreed ? '9. Documents' : '8. Documents'}>
        {docs.length === 0 ? (
          <div>No documents listed.</div>
        ) : (
          <ul className="list-disc pl-5">
            {docs.map((d, i) => (
              <li key={i}>{d.name || d.type || 'Document'}</li>
            ))}
          </ul>
        )}
      </Section>

      {/* Footer */}
      <footer className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-500 text-center">
        <p>LOANATICKS – Loan Application Record – Printed {new Date().toLocaleString()}</p>
        <p>Application ID: {application._id}</p>
      </footer>
    </div>
  );
}
