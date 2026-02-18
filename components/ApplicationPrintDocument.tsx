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
  mailingAddress?: Record<string, unknown>;
  formerAddresses?: Array<Record<string, unknown>>;
  employment?: Record<string, unknown>;
  additionalEmployment?: Array<Record<string, unknown>>;
  otherIncomeSources?: Array<Record<string, unknown>>;
  financialInfo?: Record<string, unknown>;
  assets?: Record<string, unknown>;
  liabilities?: Record<string, unknown>;
  propertyInfo?: Record<string, unknown>;
  realEstateOwned?: Array<Record<string, unknown>>;
  additionalMortgages?: Array<Record<string, unknown>>;
  giftsOrGrants?: Array<Record<string, unknown>>;
  declarations?: Record<string, unknown>;
  militaryService?: Record<string, unknown>;
  creditCardAuthorization?: Record<string, unknown>;
  documents?: Array<{ name?: string; type?: string; uploadedAt?: string; url?: string }>;
  statusHistory?: Array<{ status?: string; changedAt?: string; notes?: string }>;
}

function fmt(val: unknown): string {
  if (val == null || val === '') return '—';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (val instanceof Date) return val.toLocaleDateString();
  if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}/)) return new Date(val).toLocaleDateString();
  return String(val);
}

function fmtDollar(val: unknown): string {
  if (val == null || val === '') return '—';
  const n = Number(val);
  if (Number.isNaN(n)) return fmt(val);
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
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
  const mailAddr = application.mailingAddress || {};
  const formerAddrs = application.formerAddresses || [];
  const emp = application.employment || {};
  const addlEmp = application.additionalEmployment || [];
  const otherIncome = application.otherIncomeSources || [];
  const fin = application.financialInfo || {};
  const assets = application.assets || {};
  const liabilities = application.liabilities || {};
  const prop = application.propertyInfo || {};
  const realEstate = application.realEstateOwned || [];
  const addlMortgages = application.additionalMortgages || [];
  const gifts = application.giftsOrGrants || [];
  const decl = application.declarations || {};
  const military = application.militaryService || {};
  const auth = application.creditCardAuthorization || {};
  const docs = application.documents || [];

  const bankAccounts = (assets.bankAccounts as Array<Record<string, unknown>>) || [];
  const otherAssets = (assets.otherAssets as Array<Record<string, unknown>>) || [];
  const liabilityItems = (liabilities.items as Array<Record<string, unknown>>) || [];
  const hasMailing = mailAddr.street || mailAddr.city || mailAddr.state || mailAddr.zipCode;
  const hasAuth = auth && (auth.authorizationAgreed || auth.authBorrower1Name || auth.authSignature1 || auth.cardType);

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
        <Row label="Employer phone" value={fmt(emp.phone)} />
        <Row label="Employer address" value={[fmt(emp.street), fmt(emp.unit), fmt(emp.city), fmt(emp.state), fmt(emp.zipCode)].filter(Boolean).join(', ') || '—'} />
        <Row label="Position" value={fmt(emp.position)} />
        <Row label="Start date" value={fmt(emp.startDate)} />
        <Row label="Years in line of work" value={fmt(emp.yearsInLineOfWork)} />
        <Row label="Base income" value={fmtDollar(emp.baseIncome)} />
        <Row label="Overtime / Bonus / Commission" value={[emp.overtime, emp.bonus, emp.commission].some((v) => v != null && v !== '') ? `${fmtDollar(emp.overtime)} / ${fmtDollar(emp.bonus)} / ${fmtDollar(emp.commission)}` : '—'} />
        <Row label="Monthly income (total)" value={fmtDollar(emp.monthlyIncome)} />
      </Section>

      {/* Additional Employment */}
      {addlEmp.length > 0 && (
        <Section title="4b. Additional Employment">
          {addlEmp.map((job, i) => (
            <div key={i} className="mb-3 pb-2 border-b border-gray-200 last:border-0">
              <Row label="Employer" value={fmt(job.employerName)} />
              <Row label="Position" value={fmt(job.position)} />
              <Row label="Monthly income" value={fmtDollar(job.monthlyIncome)} />
            </div>
          ))}
        </Section>
      )}

      {/* Other Income Sources */}
      {otherIncome.length > 0 && (
        <Section title="4c. Other Income Sources">
          {otherIncome.map((src, i) => (
            <Row key={i} label={fmt(src.type)} value={fmtDollar(src.monthlyAmount)} />
          ))}
        </Section>
      )}

      {/* Financial */}
      <Section title="5. Financial Information">
        <Row label="Gross monthly income" value={fmtDollar(fin.grossMonthlyIncome)} />
        <Row label="Other income" value={fmtDollar(fin.otherIncome)} />
        {fin.otherIncomeSource && <Row label="Other income source" value={fmt(fin.otherIncomeSource)} />}
        <Row label="Total assets" value={fmtDollar(fin.totalAssets)} />
        <Row label="Total liabilities" value={fmtDollar(fin.totalLiabilities)} />
        <Row label="Checking balance" value={fmtDollar(fin.checkingAccountBalance)} />
        <Row label="Savings balance" value={fmtDollar(fin.savingsAccountBalance)} />
      </Section>

      {/* Assets (bank accounts & other) */}
      {(bankAccounts.length > 0 || otherAssets.length > 0) && (
        <Section title="5a. Assets – Bank Accounts & Other">
          {bankAccounts.map((acct, i) => (
            <div key={i} className="mb-2">
              <Row label={`${fmt(acct.accountType)} – ${fmt(acct.financialInstitution)}`} value={fmtDollar(acct.cashOrMarketValue)} />
            </div>
          ))}
          {otherAssets.map((a, i) => (
            <Row key={i} label={fmt(a.assetType)} value={fmtDollar(a.cashOrMarketValue)} />
          ))}
        </Section>
      )}

      {/* Liabilities */}
      {liabilityItems.length > 0 && (
        <Section title="5b. Liabilities">
          {liabilityItems.map((item, i) => (
            <div key={i} className="mb-2">
              <Row label={`${fmt(item.liabilityType)} – ${fmt(item.creditorName)}`} value={`Payment ${fmtDollar(item.monthlyPayment)} · Balance ${fmtDollar(item.unpaidBalance)}`} />
            </div>
          ))}
          {(liabilities.alimony != null || liabilities.childSupport != null) && (
            <>
              <Row label="Alimony" value={fmtDollar(liabilities.alimony)} />
              <Row label="Child support" value={fmtDollar(liabilities.childSupport)} />
            </>
          )}
        </Section>
      )}

      {/* Mailing Address */}
      {hasMailing && (
        <Section title="3a. Mailing Address (if different)">
          <Row label="Street" value={fmt(mailAddr.street)} />
          <Row label="City, State, ZIP" value={[fmt(mailAddr.city), fmt(mailAddr.state), fmt(mailAddr.zipCode)].filter(Boolean).join(', ')} />
        </Section>
      )}

      {/* Former Addresses */}
      {formerAddrs.length > 0 && (
        <Section title="3b. Former Addresses">
          {formerAddrs.map((fa, i) => (
            <div key={i} className="mb-2">
              <Row label="Address" value={[fmt(fa.street), fmt(fa.city), fmt(fa.state), fmt(fa.zipCode)].filter(Boolean).join(', ')} />
              <Row label="Years there" value={fmt(fa.yearsAtAddress)} />
            </div>
          ))}
        </Section>
      )}

      {/* Property */}
      <Section title="6. Property Information">
        <Row label="Address" value={[fmt(prop.propertyAddress), fmt(prop.unit), fmt(prop.propertyCity), fmt(prop.propertyState), fmt(prop.propertyZipCode)].filter(Boolean).join(', ')} />
        <Row label="Property type" value={fmt(prop.propertyType)} />
        <Row label="Occupancy" value={fmt(prop.occupancyType)} />
        <Row label="Number of units" value={fmt(prop.numberOfUnits)} />
        <Row label="Property value" value={fmtDollar(prop.propertyValue)} />
        <Row label="Loan amount" value={fmtDollar(prop.loanAmount)} />
        <Row label="Loan purpose" value={fmt(prop.loanPurpose)} />
        {prop.refinancePurpose && <Row label="Refinance purpose" value={fmt(prop.refinancePurpose)} />}
        <Row label="Down payment" value={fmtDollar(prop.downPaymentAmount)} />
        <Row label="Down payment %" value={typeof prop.downPaymentPercentage === 'number' ? `${Number(prop.downPaymentPercentage).toFixed(1)}%` : fmt(prop.downPaymentPercentage)} />
        {prop.titleHolder && <Row label="Title holder" value={fmt(prop.titleHolder)} />}
      </Section>

      {/* Additional Mortgages / Gifts */}
      {(addlMortgages.length > 0 || gifts.length > 0) && (
        <Section title="6a. Additional Mortgages / Gifts or Grants">
          {addlMortgages.map((m, i) => (
            <Row key={i} label={`Mortgage – ${fmt(m.creditorName)}`} value={fmtDollar(m.amount)} />
          ))}
          {gifts.map((g, i) => (
            <Row key={i} label={`Gift – ${fmt(g.source)}`} value={fmtDollar(g.cashOrMarketValue)} />
          ))}
        </Section>
      )}

      {/* Real Estate Owned */}
      {realEstate.length > 0 && (
        <Section title="6b. Real Estate Owned">
          {realEstate.map((re, i) => (
            <div key={i} className="mb-2">
              <Row label="Property" value={[fmt(re.propertyAddress), fmt(re.city), fmt(re.state), fmt(re.zipCode)].filter(Boolean).join(', ')} />
              <Row label="Value / Status" value={`${fmtDollar(re.propertyValue)} – ${fmt(re.propertyStatus)}`} />
            </div>
          ))}
        </Section>
      )}

      {/* Declarations (Section 12 style) */}
      <Section title="7. Declarations (Section 12)">
        <Row label="Will occupy as primary residence?" value={fmt(decl.willOccupyAsProperty)} />
        <Row label="Ownership interest in property (last 3 yr)?" value={fmt(decl.ownershipInterestInLast3Years)} />
        {decl.ownershipInterestPropertyType && <Row label="Property type (if yes)" value={fmt(decl.ownershipInterestPropertyType)} />}
        <Row label="Borrowing down payment?" value={fmt(decl.borrowingDownPayment)} />
        {decl.familyRelationshipWithSeller != null && <Row label="Family relationship with seller?" value={fmt(decl.familyRelationshipWithSeller)} />}
        <Row label="Applying for new credit (other property)?" value={fmt(decl.applyingForNewCredit)} />
        <Row label="Applying for other new credit?" value={fmt(decl.applyingForOtherNewCredit)} />
        <Row label="Property subject to lien?" value={fmt(decl.propertySubjectToLien)} />
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
        <Row label="Co-maker on note?" value={fmt(decl.coMakerOnNote)} />
        <Row label="U.S. citizen?" value={fmt(decl.usCitizen)} />
        <Row label="Primary residence / intend to occupy?" value={fmt(decl.intendToOccupy)} />
      </Section>

      {/* Military Service */}
      {(military.hasServed != null || military.isCurrentlyServing != null) && (
        <Section title="7a. Military Service">
          <Row label="Has served" value={fmt(military.hasServed)} />
          <Row label="Currently serving" value={fmt(military.isCurrentlyServing)} />
          <Row label="Retired" value={fmt(military.isRetired)} />
        </Section>
      )}

      {/* Credit Card & Borrower Authorization – authorization to check is the main point */}
      {hasAuth ? (
        <Section title="8. Credit Card & Borrower Authorization">
          <div className="mb-3 p-3 bg-gray-100 border border-gray-300 rounded">
            <div className="font-semibold text-gray-900">Authorization to obtain credit report and to charge card</div>
            <div className="mt-1 text-sm">
              Borrower(s) have given authorization to LOANATICKS to obtain their credit report and to charge the provided card for application-related fees (appraisal, credit report, etc.). This authorization has been agreed to and is on file.
            </div>
            <Row label="Authorization given / agreed" value={auth.authorizationAgreed ? 'Yes' : fmt(auth.authorizationAgreed)} />
          </div>
          <Row label="Borrower 1 name" value={fmt(auth.authBorrower1Name)} />
          <Row label="Borrower 1 SSN" value={fmt(auth.authBorrower1SSN)} />
          <Row label="Borrower 1 DOB" value={fmt(auth.authBorrower1DOB)} />
          <Row label="Borrower 2 name" value={fmt(auth.authBorrower2Name)} />
          <Row label="Borrower 2 SSN" value={fmt(auth.authBorrower2SSN)} />
          <Row label="Borrower 2 DOB" value={fmt(auth.authBorrower2DOB)} />
          <Row label="Card type" value={fmt(auth.cardType)} />
          <Row label="Card last 4" value={auth.cardLast4 ? `****${String(auth.cardLast4)}` : '—'} />
          <Row label="Name on card" value={fmt(auth.nameOnCard)} />
          <Row label="Billing address" value={fmt(auth.cardBillingAddress)} />
          <Row label="Amount verified" value={fmt(auth.amountVerified)} />
          <Row label="Signature 1" value={fmt(auth.authSignature1)} />
          <Row label="Date 1" value={fmt(auth.authDate1)} />
          <Row label="Signature 2" value={fmt(auth.authSignature2)} />
          <Row label="Date 2" value={fmt(auth.authDate2)} />
        </Section>
      ) : (
        <Section title="8. Credit Card & Borrower Authorization">
          <p className="text-sm text-gray-600">Not provided. No credit card or authorization data on file for this application.</p>
        </Section>
      )}

      {/* Documents */}
      <Section title="9. Documents">
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
