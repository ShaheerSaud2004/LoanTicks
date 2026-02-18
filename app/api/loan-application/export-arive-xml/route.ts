import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import LoanApplication from '@/models/LoanApplication';
import { decryptSensitiveData } from '@/lib/encryption';

const NS = 'http://www.mismo.org/residential/2009/schemas';
const NS_XML = 'http://www.w3.org/2001/XMLSchema-instance';

function esc(s: unknown): string {
  if (s == null || s === undefined) return '';
  const t = String(s);
  return t
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function dateStr(d: unknown): string {
  if (!d) return '';
  try {
    const date = typeof d === 'string' ? new Date(d) : d as Date;
    return date.toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

function numStr(n: unknown): string {
  if (n == null || n === '') return '';
  const x = Number(n);
  return Number.isNaN(x) ? '' : String(x);
}

/**
 * Build MISMO 3.4–style XML for ARIVE import (Import 3.2 & 3.4 Files).
 * ARIVE accepts 3.2 and 3.4; we output a 3.4-compatible structure with borrower and loan data.
 */
function buildMismo34Xml(app: Record<string, unknown>, ssnPlain: string): string {
  const b = (app.borrowerInfo as Record<string, unknown>) || {};
  const addr = (app.currentAddress as Record<string, unknown>) || {};
  const emp = (app.employment as Record<string, unknown>) || {};
  const fin = (app.financialInfo as Record<string, unknown>) || {};
  const prop = (app.propertyInfo as Record<string, unknown>) || {};
  const dealId = `LOANATICKS-${(app._id as string) || 'unknown'}`;

  const firstName = esc(b.firstName);
  const middleName = esc(b.middleName);
  const lastName = esc(b.lastName);
  const suffix = esc(b.suffix);
  const email = esc(b.email);
  const phone = esc(b.phone || b.cellPhone);
  const cellPhone = esc(b.cellPhone || b.phone);
  const workPhone = esc(b.workPhone || emp.phone);
  const dob = dateStr(b.dateOfBirth);
  const maritalStatus = esc(b.maritalStatus);
  const dependents = numStr(b.dependents);
  const citizenship = esc(b.citizenshipType);

  const street = esc(addr.street);
  const unit = esc(addr.unit);
  const city = esc(addr.city);
  const state = esc(addr.state);
  const zipCode = esc(addr.zipCode);
  const residencyType = esc(addr.residencyType);
  const monthlyPayment = numStr(addr.monthlyPayment);
  const yearsAtAddress = numStr(addr.yearsAtAddress);

  const employerName = esc(emp.employerName);
  const position = esc(emp.position);
  const monthlyIncome = numStr(emp.monthlyIncome);
  const employmentStatus = esc(emp.employmentStatus);

  const grossMonthlyIncome = numStr(fin.grossMonthlyIncome);
  const otherIncome = numStr(fin.otherIncome);
  const totalAssets = numStr(fin.totalAssets);
  const totalLiabilities = numStr(fin.totalLiabilities);
  const checkingBalance = numStr(fin.checkingAccountBalance);
  const savingsBalance = numStr(fin.savingsAccountBalance);

  const propertyAddress = esc(prop.propertyAddress);
  const propertyCity = esc(prop.propertyCity);
  const propertyState = esc(prop.propertyState);
  const propertyZipCode = esc(prop.propertyZipCode);
  const propertyValue = numStr(prop.propertyValue);
  const loanAmount = numStr(prop.loanAmount);
  const loanPurpose = esc(prop.loanPurpose);
  const downPaymentAmount = numStr(prop.downPaymentAmount);
  const downPaymentPercentage = numStr(prop.downPaymentPercentage);
  const propertyType = esc(prop.propertyType);
  const occupancyType = esc(prop.occupancyType);

  return `<?xml version="1.0" encoding="UTF-8"?>
<MESSAGE xmlns="${NS}" xmlns:xsi="${NS_XML}" xsi:schemaLocation="${NS} MISMO_3.4.0_B324.xsd">
  <DEAL_SETS>
    <DEAL_SET>
      <DEALS>
        <DEAL MISMOLogicalDataDictionaryIdentifier="3.4.0" MISMOReferenceModelIdentifier="3.4.0">
          <DEAL_DETAIL>
            <DEAL_IDENTIFIERS>
              <DEAL_IDENTIFIER>
                <DEAL_IDENTIFIER_TYPE>LoanTicksApplication</DEAL_IDENTIFIER_TYPE>
                <DEAL_IDENTIFIER_VALUE>${esc(dealId)}</DEAL_IDENTIFIER_VALUE>
              </DEAL_IDENTIFIER>
            </DEAL_IDENTIFIERS>
          </DEAL_DETAIL>
          <PARTIES>
            <PARTY SequenceNumber="1">
              <PARTY_DETAIL>
                <INDIVIDUAL>
                  <NAME>
                    <PERSON_NAME>
                      <PERSON_NAME_TYPE>Borrower</PERSON_NAME_TYPE>
                      <FIRST_NAME>${firstName}</FIRST_NAME>
                      <MIDDLE_NAME>${middleName}</MIDDLE_NAME>
                      <LAST_NAME>${lastName}</LAST_NAME>
                      <SUFFIX_NAME>${suffix}</SUFFIX_NAME>
                    </PERSON_NAME>
                  </NAME>
                  <BIRTH_DATE>${dob}</BIRTH_DATE>
                  <TAXPAYER_IDENTIFIER>${esc(ssnPlain)}</TAXPAYER_IDENTIFIER>
                  <MARITAL_STATUS_TYPE>${maritalStatus}</MARITAL_STATUS_TYPE>
                  <DEPENDENT_COUNT>${dependents}</DEPENDENT_COUNT>
                  <CITIZENSHIP_RESIDENCY_TYPE>${citizenship}</CITIZENSHIP_RESIDENCY_TYPE>
                </INDIVIDUAL>
              </PARTY_DETAIL>
              <ROLES>
                <ROLE>
                  <ROLE_TYPE>Borrower</ROLE_TYPE>
                </ROLE>
              </ROLES>
              <ADDRESSES>
                <ADDRESS>
                  <ADDRESS_TYPE>Current</ADDRESS_TYPE>
                  <ADDRESS_LINE_TEXT>${street}</ADDRESS_LINE_TEXT>
                  <ADDRESS_LINE_TEXT>${unit}</ADDRESS_LINE_TEXT>
                  <CITY_NAME>${city}</CITY_NAME>
                  <STATE_CODE>${state}</STATE_CODE>
                  <POSTAL_CODE>${zipCode}</POSTAL_CODE>
                  <RESIDENCE_TYPE>${residencyType}</RESIDENCE_TYPE>
                  <STRUCTURE_PAYMENT_AMOUNT>${monthlyPayment}</STRUCTURE_PAYMENT_AMOUNT>
                  <RESIDENCE_DURATION_YEARS_COUNT>${yearsAtAddress}</RESIDENCE_DURATION_YEARS_COUNT>
                </ADDRESS>
              </ADDRESSES>
              <CONTACT_POINTS>
                <CONTACT_POINT>
                  <CONTACT_POINT_TYPE>Email</CONTACT_POINT_TYPE>
                  <CONTACT_POINT_VALUE>${email}</CONTACT_POINT_VALUE>
                </CONTACT_POINT>
                <CONTACT_POINT>
                  <CONTACT_POINT_TYPE>Home</CONTACT_POINT_TYPE>
                  <CONTACT_POINT_VALUE>${phone}</CONTACT_POINT_VALUE>
                </CONTACT_POINT>
                <CONTACT_POINT>
                  <CONTACT_POINT_TYPE>Cell</CONTACT_POINT_TYPE>
                  <CONTACT_POINT_VALUE>${cellPhone}</CONTACT_POINT_VALUE>
                </CONTACT_POINT>
                <CONTACT_POINT>
                  <CONTACT_POINT_TYPE>Work</CONTACT_POINT_TYPE>
                  <CONTACT_POINT_VALUE>${workPhone}</CONTACT_POINT_VALUE>
                </CONTACT_POINT>
              </CONTACT_POINTS>
              <EMPLOYMENTS>
                <EMPLOYMENT>
                  <EMPLOYMENT_POSITION_TYPE>${position}</EMPLOYMENT_POSITION_TYPE>
                  <EMPLOYER_NAME>${employerName}</EMPLOYER_NAME>
                  <EMPLOYMENT_STATUS_TYPE>${employmentStatus}</EMPLOYMENT_STATUS_TYPE>
                  <MONTHLY_INCOME_AMOUNT>${monthlyIncome}</MONTHLY_INCOME_AMOUNT>
                </EMPLOYMENT>
              </EMPLOYMENTS>
            </PARTY>
          </PARTIES>
          <ASSETS>
            <ASSET>
              <ASSET_TYPE>CheckingAccount</ASSET_TYPE>
              <CASH_OR_MARKET_VALUE_AMOUNT>${checkingBalance}</CASH_OR_MARKET_VALUE_AMOUNT>
            </ASSET>
            <ASSET>
              <ASSET_TYPE>SavingsAccount</ASSET_TYPE>
              <CASH_OR_MARKET_VALUE_AMOUNT>${savingsBalance}</CASH_OR_MARKET_VALUE_AMOUNT>
            </ASSET>
            <ASSET_TOTAL_CALCULATED_AMOUNT>${totalAssets}</ASSET_TOTAL_CALCULATED_AMOUNT>
          </ASSETS>
          <LIABILITIES>
            <LIABILITY_TOTAL_CALCULATED_AMOUNT>${totalLiabilities}</LIABILITY_TOTAL_CALCULATED_AMOUNT>
          </LIABILITIES>
          <COLLATERALS>
            <COLLATERAL>
              <COLLATERAL_DETAIL>
                <SUBJECT_PROPERTY>
                  <ADDRESS>
                    <ADDRESS_LINE_TEXT>${propertyAddress}</ADDRESS_LINE_TEXT>
                    <CITY_NAME>${propertyCity}</CITY_NAME>
                    <STATE_CODE>${propertyState}</STATE_CODE>
                    <POSTAL_CODE>${propertyZipCode}</POSTAL_CODE>
                  </ADDRESS>
                  <STRUCTURE_PRICE_AMOUNT>${propertyValue}</STRUCTURE_PRICE_AMOUNT>
                  <STRUCTURE_TYPE>${propertyType}</STRUCTURE_TYPE>
                  <OCCUPANCY_TYPE>${occupancyType}</OCCUPANCY_TYPE>
                </SUBJECT_PROPERTY>
              </COLLATERAL_DETAIL>
            </COLLATERAL>
          </COLLATERALS>
          <LOANS>
            <LOAN>
              <LOAN_DETAIL>
                <LOAN_AMOUNT>${loanAmount}</LOAN_AMOUNT>
                <LOAN_PURPOSE_TYPE>${loanPurpose}</LOAN_PURPOSE_TYPE>
                <DOWN_PAYMENT_AMOUNT>${downPaymentAmount}</DOWN_PAYMENT_AMOUNT>
                <DOWN_PAYMENT_PERCENT>${downPaymentPercentage}</DOWN_PAYMENT_PERCENT>
              </LOAN_DETAIL>
            </LOAN>
          </LOANS>
        </DEAL>
      </DEALS>
    </DEAL_SET>
  </DEAL_SETS>
</MESSAGE>`;
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

    const application = await LoanApplication.findById(applicationId)
      .select('+borrowerInfo.ssn')
      .lean();

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const appUserId = (application.userId as any)?.toString?.() || application.userId;
    if (session.user.role === 'customer' && appUserId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let ssnPlain = '';
    try {
      const raw = (application.borrowerInfo as any)?.ssn;
      if (raw) {
        try {
          ssnPlain = decryptSensitiveData(raw);
        } catch {
          ssnPlain = typeof raw === 'string' ? raw : '';
        }
      }
    } catch {
      ssnPlain = '';
    }

    const appObj = {
      ...application,
      _id: (application as any)._id?.toString?.() || applicationId,
    } as Record<string, unknown>;

    const xml = buildMismo34Xml(appObj, ssnPlain);
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `arive-import-${String(applicationId).slice(-8)}-${today}.xml`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export ARIVE XML error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Export failed' },
      { status: 500 }
    );
  }
}
