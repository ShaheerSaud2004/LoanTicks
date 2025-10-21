import { NextRequest, NextResponse } from 'next/server';
import { getAllSimpleRates, SimpleLoanData } from '@/lib/simpleRateEngine';

export async function POST(request: NextRequest) {
  try {
    const loanData: SimpleLoanData = await request.json();

    // Validate required fields
    if (!loanData.loanAmount || !loanData.propertyValue || !loanData.creditScore) {
      return NextResponse.json({
        error: 'Missing required fields: loanAmount, propertyValue, creditScore'
      }, { status: 400 });
    }

    // Get rates using the simple engine
    const rateResults = await getAllSimpleRates(loanData);

    return NextResponse.json({
      success: true,
      loanData,
      rates: rateResults.rates,
      analysis: rateResults.analysis,
      sources: rateResults.sources,
      timestamp: new Date().toISOString(),
      message: 'Rates calculated using market data and simple algorithms'
    });

  } catch (error) {
    console.error('Error calculating simple rates:', error);
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
    const sampleLoanData: SimpleLoanData = {
      loanAmount: 600000,
      propertyValue: 750000,
      downPayment: 150000,
      creditScore: 750,
      propertyType: 'single_family',
      occupancy: 'primary',
      loanPurpose: 'purchase',
      state: 'CA',
      zipCode: '90210'
    };

    const rateResults = await getAllSimpleRates(sampleLoanData);

    return NextResponse.json({
      success: true,
      message: 'Simple rate engine test completed',
      sampleData: sampleLoanData,
      results: rateResults,
      instructions: {
        usage: 'POST to /api/simple-rates with loan data',
        example: {
          loanAmount: 600000,
          propertyValue: 750000,
          downPayment: 150000,
          creditScore: 750,
          propertyType: 'single_family',
          occupancy: 'primary',
          loanPurpose: 'purchase',
          state: 'CA',
          zipCode: '90210'
        },
        advantages: [
          '✅ No API keys required',
          '✅ No complex integrations',
          '✅ Works immediately',
          '✅ Realistic market-based rates',
          '✅ Multiple lender quotes',
          '✅ Rate comparison and analysis'
        ]
      }
    });

  } catch (error) {
    console.error('Simple rate engine test error:', error);
    return NextResponse.json({
      error: 'Simple rate engine test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
