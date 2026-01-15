import { NextResponse } from 'next/server';
import { getAllRates, analyzeRates, LoanData } from '@/lib/rateEngines';

export async function GET() {
  try {
    // Create sample loan data for testing
    const sampleLoanData: LoanData = {
      borrower: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '(555) 123-4567',
        ssn: '123-45-6789',
        dateOfBirth: '1985-06-15',
        annualIncome: 100000,
        creditScore: 750
      },
      property: {
        address: '123 Main Street',
        city: 'Anytown',
        state: 'CA',
        zipCode: '90210',
        propertyType: 'single_family',
        propertyValue: 750000,
        occupancy: 'primary'
      },
      loan: {
        amount: 600000,
        purpose: 'purchase',
        term: 30,
        downPayment: 150000,
        downPaymentPercentage: 20
      }
    };

    console.log('Testing rate engines with sample data...');
    
    // Get rates from all sources
    const rateResults = await getAllRates(sampleLoanData);
    
    // Analyze the rates
    const allQuotes = rateResults.allRates
      .filter(response => response.success)
      .flatMap(response => response.quotes);
    
    const analysis = analyzeRates(allQuotes);

    return NextResponse.json({
      success: true,
      message: 'Rate engine test completed successfully',
      sampleData: sampleLoanData,
      results: {
        totalSources: rateResults.allRates.length,
        successfulSources: rateResults.allRates.filter(r => r.success).length,
        totalQuotes: allQuotes.length,
        summary: rateResults.summary,
        bestRate: rateResults.bestRate,
        analysis
      },
      rateResponses: rateResults.allRates.map(response => ({
        source: response.source,
        success: response.success,
        quoteCount: response.quotes.length,
        error: response.error || null
      })),
      quotes: allQuotes.map(quote => ({
        lender: quote.lender,
        rate: quote.rate,
        apr: quote.apr,
        monthlyPayment: quote.monthlyPayment,
        productType: quote.productType
      })),
      instructions: {
        setup: [
          '1. Add API keys to your .env file:',
          '   QUICKEN_API_KEY=your_quicken_key',
          '   BETTER_API_KEY=your_better_key',
          '   LOANDEPOT_API_KEY=your_loandepot_key',
          '   PENNYMAC_API_KEY=your_pennymac_key',
          '',
          '2. Contact each lender for API access:',
          '   - Quicken Loans: https://developer.quickenloans.com',
          '   - Better Mortgage: https://developer.better.com',
          '   - LoanDepot: https://developer.loandepot.com',
          '   - PennyMac: https://developer.pennymac.com',
          '',
          '3. Test with real applications using:',
          '   POST /api/get-rates with applicationId'
        ],
        features: [
          '✅ Multi-source rate comparison',
          '✅ Custom rate engine fallback',
          '✅ Rate analysis and savings calculation',
          '✅ Caching to avoid excessive API calls',
          '✅ Error handling and fallbacks',
          '✅ Integration with existing loan applications'
        ]
      }
    });

  } catch (error) {
    console.error('Rate engine test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Rate engine test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      troubleshooting: [
        '1. Check that all environment variables are set',
        '2. Verify API endpoints are accessible',
        '3. Check network connectivity',
        '4. Review error logs for specific issues'
      ]
    }, { status: 500 });
  }
}
