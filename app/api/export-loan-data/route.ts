import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import LoanApplication from '@/models/LoanApplication';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user.role !== 'admin' && session.user.role !== 'employee')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');
    const format = searchParams.get('format') || 'json'; // json, xml, csv

    await connectDB();

    let applications;
    if (applicationId) {
      applications = await LoanApplication.findById(applicationId).populate('userId');
      if (!applications) {
        return NextResponse.json({ message: 'Application not found' }, { status: 404 });
      }
      applications = [applications];
    } else {
      applications = await LoanApplication.find().populate('userId');
    }

    // Transform data for Arise/Arive integration
    const transformedData = applications.map(app => ({
      // Application Metadata
      applicationId: app._id,
      submittedAt: app.submittedAt,
      status: app.status,
      decision: app.decision,
      
      // Borrower Information (URLA Section 1)
      borrower: {
        personalInfo: {
          firstName: app.borrowerInfo?.firstName,
          middleName: app.borrowerInfo?.middleName,
          lastName: app.borrowerInfo?.lastName,
          suffix: app.borrowerInfo?.suffix,
          ssn: app.borrowerInfo?.ssn,
          dateOfBirth: app.borrowerInfo?.dateOfBirth,
          citizenship: app.borrowerInfo?.citizenship,
          maritalStatus: app.borrowerInfo?.maritalStatus,
          dependents: app.borrowerInfo?.dependents,
          race: app.borrowerInfo?.race,
          ethnicity: app.borrowerInfo?.ethnicity,
          sex: app.borrowerInfo?.sex
        },
        contactInfo: {
          email: app.borrowerInfo?.email,
          phone: app.borrowerInfo?.phone,
          homePhone: app.borrowerInfo?.homePhone,
          workPhone: app.borrowerInfo?.workPhone
        }
      },

      // Address Information (URLA Section 3)
      address: {
        current: {
          street: app.currentAddress?.street,
          unit: app.currentAddress?.unit,
          city: app.currentAddress?.city,
          state: app.currentAddress?.state,
          zipCode: app.currentAddress?.zipCode,
          housingType: app.currentAddress?.residencyType,
          monthlyPayment: app.currentAddress?.monthlyPayment,
          yearsAtAddress: app.currentAddress?.yearsAtAddress
        },
        prior: app.priorAddress ? {
          street: app.priorAddress?.street,
          city: app.priorAddress?.city,
          state: app.priorAddress?.state,
          zipCode: app.priorAddress?.zipCode,
          housingType: app.priorAddress?.residencyType,
          monthlyPayment: app.priorAddress?.monthlyPayment,
          yearsAtAddress: app.priorAddress?.yearsAtAddress
        } : null
      },

      // Employment Information (URLA Section 5)
      employment: {
        current: {
          status: app.employment?.employmentStatus,
          employerName: app.employment?.employerName,
          position: app.employment?.position,
          startDate: app.employment?.startDate,
          yearsEmployed: app.employment?.yearsEmployed,
          monthlyIncome: app.employment?.monthlyIncome,
          workPhone: app.employment?.workPhone,
          workAddress: {
            street: app.employment?.workAddress,
            city: app.employment?.workCity,
            state: app.employment?.workState,
            zipCode: app.employment?.workZipCode
          }
        },
        previous: app.previousEmployment ? {
          employerName: app.previousEmployment?.employerName,
          position: app.previousEmployment?.position,
          startDate: app.previousEmployment?.startDate,
          endDate: app.previousEmployment?.endDate,
          yearsEmployed: app.previousEmployment?.yearsEmployed,
          monthlyIncome: app.previousEmployment?.monthlyIncome
        } : null
      },

      // Financial Information (URLA Sections 6-8)
      financial: {
        income: {
          grossMonthlyIncome: app.financialInfo?.grossMonthlyIncome,
          baseIncome: app.financialInfo?.baseIncome,
          overtimeIncome: app.financialInfo?.overtimeIncome,
          bonusIncome: app.financialInfo?.bonusIncome,
          commissionIncome: app.financialInfo?.commissionIncome,
          otherIncome: app.financialInfo?.otherIncome,
          otherIncomeSource: app.financialInfo?.otherIncomeSource,
          totalMonthlyIncome: app.financialInfo?.totalMonthlyIncome
        },
        assets: {
          checkingAccountBalance: app.financialInfo?.checkingAccountBalance,
          savingsAccountBalance: app.financialInfo?.savingsAccountBalance,
          moneyMarketBalance: app.financialInfo?.moneyMarketBalance,
          cdsBalance: app.financialInfo?.cdsBalance,
          realEstateValue: app.financialInfo?.realEstateValue,
          stockBondValue: app.financialInfo?.stockBondValue,
          lifeInsuranceValue: app.financialInfo?.lifeInsuranceValue,
          retirementAccountValue: app.financialInfo?.retirementAccountValue,
          otherAssetValue: app.financialInfo?.otherAssetValue,
          totalAssets: app.financialInfo?.totalAssets
        },
        liabilities: {
          mortgagePayment: app.financialInfo?.mortgagePayment,
          secondMortgagePayment: app.financialInfo?.secondMortgagePayment,
          homeEquityPayment: app.financialInfo?.homeEquityPayment,
          creditCardPayments: app.financialInfo?.creditCardPayments,
          installmentLoanPayments: app.financialInfo?.installmentLoanPayments,
          otherMonthlyPayments: app.financialInfo?.otherMonthlyPayments,
          totalMonthlyLiabilities: app.financialInfo?.totalLiabilities
        }
      },

      // Property Information (URLA Section 9)
      property: {
        address: {
          street: app.propertyInfo?.propertyAddress,
          city: app.propertyInfo?.propertyCity,
          state: app.propertyInfo?.propertyState,
          zipCode: app.propertyInfo?.propertyZipCode
        },
        details: {
          propertyType: app.propertyInfo?.propertyType,
          propertyUse: app.propertyInfo?.propertyUse,
          propertyValue: app.propertyInfo?.propertyValue,
          purchasePrice: app.propertyInfo?.purchasePrice,
          downPaymentAmount: app.propertyInfo?.downPaymentAmount,
          downPaymentPercentage: app.propertyInfo?.downPaymentPercentage
        }
      },

      // Loan Information (URLA Section 10)
      loan: {
        amount: app.propertyInfo?.loanAmount,
        purpose: app.propertyInfo?.loanPurpose,
        refinancePurpose: app.propertyInfo?.refinancePurpose,
        type: app.loanDetails?.loanType,
        term: app.loanDetails?.loanTerm,
        interestRateType: app.loanDetails?.interestRateType,
        interestRate: app.loanDetails?.interestRate,
        monthlyPayment: app.loanDetails?.monthlyPayment,
        pmiRequired: app.loanDetails?.pmiRequired,
        pmiAmount: app.loanDetails?.pmiAmount
      },

      // Declarations (URLA Section 11)
      declarations: {
        outstandingJudgments: app.declarations?.outstandingJudgments,
        declaredBankruptcy: app.declarations?.declaredBankruptcy,
        bankruptcyDate: app.declarations?.bankruptcyDate,
        propertyForeclosed: app.declarations?.propertyForeclosed,
        foreclosureDate: app.declarations?.foreclosureDate,
        lawsuitParty: app.declarations?.lawsuitParty,
        lawsuitDescription: app.declarations?.lawsuitDescription,
        loanOnProperty: app.declarations?.loanOnProperty,
        coMakerOnNote: app.declarations?.coMakerOnNote,
        usCitizen: app.declarations?.usCitizen,
        permanentResident: app.declarations?.permanentResident,
        primaryResidence: app.declarations?.primaryResidence,
        intendToOccupy: app.declarations?.intendToOccupy
      },

      // Military Service (URLA Section 12)
      militaryService: {
        served: app.militaryService?.served,
        branch: app.militaryService?.branch,
        rank: app.militaryService?.rank,
        serviceDates: app.militaryService?.serviceDates
      },

      // Additional Information
      additionalInfo: {
        additionalInformation: app.additionalInformation,
        specialCircumstances: app.specialCircumstances
      },

      // Documents
      documents: app.documents?.map(doc => ({
        name: doc.name,
        type: doc.type,
        size: doc.size,
        uploadedAt: doc.uploadedAt
      })) || [],

      // Audit Trail
      auditTrail: {
        assignedTo: app.assignedTo,
        assignedAt: app.assignedAt,
        reviewedBy: app.reviewedBy,
        reviewedAt: app.reviewedAt,
        statusHistory: app.statusHistory?.map(entry => ({
          status: entry.status,
          changedBy: entry.changedBy,
          changedAt: entry.changedAt,
          notes: entry.notes
        })) || []
      }
    }));

    // Return data in requested format
    if (format === 'xml') {
      const xmlData = generateXML(transformedData);
      return new NextResponse(xmlData, {
        headers: {
          'Content-Type': 'application/xml',
          'Content-Disposition': `attachment; filename="loan-applications-${new Date().toISOString().split('T')[0]}.xml"`
        }
      });
    } else if (format === 'csv') {
      const csvData = generateCSV(transformedData);
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="loan-applications-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    } else {
      return NextResponse.json({
        success: true,
        data: transformedData,
        exportInfo: {
          exportedAt: new Date().toISOString(),
          totalApplications: transformedData.length,
          format: 'json'
        }
      });
    }

  } catch (error) {
    console.error('Error exporting loan data:', error);
    return NextResponse.json({ error: 'Failed to export loan data' }, { status: 500 });
  }
}

function generateXML(data: any[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<LoanApplications>\n';
  
  data.forEach(app => {
    xml += '  <LoanApplication>\n';
    xml += `    <ApplicationId>${app.applicationId}</ApplicationId>\n`;
    xml += `    <Status>${app.status}</Status>\n`;
    xml += `    <SubmittedAt>${app.submittedAt}</SubmittedAt>\n`;
    
    // Borrower Info
    xml += '    <Borrower>\n';
    xml += `      <FirstName>${app.borrower.personalInfo.firstName || ''}</FirstName>\n`;
    xml += `      <LastName>${app.borrower.personalInfo.lastName || ''}</LastName>\n`;
    xml += `      <Email>${app.borrower.contactInfo.email || ''}</Email>\n`;
    xml += `      <Phone>${app.borrower.contactInfo.phone || ''}</Phone>\n`;
    xml += `      <SSN>${app.borrower.personalInfo.ssn || ''}</SSN>\n`;
    xml += `      <DateOfBirth>${app.borrower.personalInfo.dateOfBirth || ''}</DateOfBirth>\n`;
    xml += '    </Borrower>\n';
    
    // Loan Info
    xml += '    <Loan>\n';
    xml += `      <Amount>${app.loan.amount || 0}</Amount>\n`;
    xml += `      <Purpose>${app.loan.purpose || ''}</Purpose>\n`;
    xml += `      <PropertyValue>${app.property.details.propertyValue || 0}</PropertyValue>\n`;
    xml += '    </Loan>\n';
    
    xml += '  </LoanApplication>\n';
  });
  
  xml += '</LoanApplications>';
  return xml;
}

function generateCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  const headers = [
    'ApplicationId', 'Status', 'SubmittedAt', 'FirstName', 'LastName', 'Email', 'Phone',
    'SSN', 'DateOfBirth', 'LoanAmount', 'LoanPurpose', 'PropertyValue', 'MonthlyIncome',
    'TotalAssets', 'TotalLiabilities', 'EmploymentStatus', 'EmployerName'
  ];
  
  let csv = headers.join(',') + '\n';
  
  data.forEach(app => {
    const row = [
      app.applicationId || '',
      app.status || '',
      app.submittedAt || '',
      app.borrower.personalInfo.firstName || '',
      app.borrower.personalInfo.lastName || '',
      app.borrower.contactInfo.email || '',
      app.borrower.contactInfo.phone || '',
      app.borrower.personalInfo.ssn || '',
      app.borrower.personalInfo.dateOfBirth || '',
      app.loan.amount || 0,
      app.loan.purpose || '',
      app.property.details.propertyValue || 0,
      app.financial.income.totalMonthlyIncome || 0,
      app.financial.assets.totalAssets || 0,
      app.financial.liabilities.totalMonthlyLiabilities || 0,
      app.employment.current.status || '',
      app.employment.current.employerName || ''
    ];
    
    csv += row.map(field => `"${field}"`).join(',') + '\n';
  });
  
  return csv;
}
