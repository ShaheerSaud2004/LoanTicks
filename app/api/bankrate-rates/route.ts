import { NextRequest, NextResponse } from 'next/server';
import { getBankrateRates, BankrateLoanData } from '@/lib/bankrateEngine';

export async function POST(request: NextRequest) {
  try {
    const loanData: BankrateLoanData = await request.json();

    // Validate required fields
    if (!loanData.loanAmount || !loanData.propertyValue || !loanData.creditScore) {
      return NextResponse.json({
        error: 'Missing required fields: loanAmount, propertyValue, creditScore'
      }, { status: 400 });
    }

    // Get Bankrate-style rates
    const rateResults = getBankrateRates(loanData);

    return NextResponse.json({
      success: true,
      loanData,
      ...rateResults,
      message: 'Bankrate-style rates calculated successfully'
    });

  } catch (error) {
    console.error('Error calculating Bankrate rates:', error);
    return NextResponse.json({
      error: 'Failed to calculate rates',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint for testing
export async function GET() {
  try {
    // Sample loan data for testing
    const sampleLoanData: BankrateLoanData = {
      loanAmount: 600000,
      propertyValue: 750000,
      downPayment: 150000,
      creditScore: 750,
      propertyType: 'single_family',
      occupancy: 'primary',
      loanPurpose: 'purchase',
      state: 'CA',
      zipCode: '90210',
      annualIncome: 120000
    };

    const rateResults = getBankrateRates(sampleLoanData);

    return NextResponse.json({
      success: true,
      message: 'Bankrate-style rate engine test completed',
      sampleData: sampleLoanData,
      results: rateResults,
      instructions: {
        usage: 'POST to /api/bankrate-rates with loan data',
        example: {
          loanAmount: 600000,
          propertyValue: 750000,
          downPayment: 150000,
          creditScore: 750,
          propertyType: 'single_family',
          occupancy: 'primary',
          loanPurpose: 'purchase',
          state: 'CA',
          zipCode: '90210',
          annualIncome: 120000
        },
        features: [
          '✅ Bankrate-style rate aggregation',
          '✅ 8 major lenders included',
          '✅ Comprehensive rate analysis',
          '✅ APR and fee comparisons',
          '✅ Savings calculations',
          '✅ No API keys required',
          '✅ Works immediately'
        ],
        lenders: [
          'Quicken Loans',
          'Better Mortgage', 
          'LoanDepot',
          'PennyMac',
          'Rocket Mortgage',
          'Guild Mortgage',
          'New American Funding',
          'Movement Mortgage'
        ]
      }
    });

  } catch (error) {
    console.error('Bankrate rate engine test error:', error);
    return NextResponse.json({
      error: 'Bankrate rate engine test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
