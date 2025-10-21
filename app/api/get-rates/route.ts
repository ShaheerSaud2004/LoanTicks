import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import LoanApplication from '@/models/LoanApplication';
import { getAllRates, analyzeRates, LoanData } from '@/lib/rateEngines';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { applicationId, forceRefresh = false } = await request.json();

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    // Get the loan application
    const application = await LoanApplication.findById(applicationId);

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check if user has permission to view this application
    if (session.user.role === 'customer' && application.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if we already have recent rates (unless force refresh)
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    if (!forceRefresh && application.rateQuotes && application.rateQuotes.length > 0) {
      const lastRateUpdate = new Date(application.rateQuotes[0].timestamp);
      if (lastRateUpdate > oneHourAgo) {
        return NextResponse.json({
          success: true,
          rates: application.rateQuotes,
          analysis: application.rateAnalysis,
          cached: true,
          lastUpdated: lastRateUpdate.toISOString()
        });
      }
    }

    // Transform application data to rate engine format
    const loanData: LoanData = {
      borrower: {
        firstName: application.borrowerInfo.firstName,
        lastName: application.borrowerInfo.lastName,
        email: application.borrowerInfo.email,
        phone: application.borrowerInfo.phone,
        ssn: application.borrowerInfo.ssn,
        dateOfBirth: application.borrowerInfo.dateOfBirth.toISOString().split('T')[0],
        annualIncome: application.financialInfo.grossMonthlyIncome * 12,
        creditScore: application.borrowerInfo.creditScore || 700 // Default if not provided
      },
      property: {
        address: application.propertyInfo.propertyAddress,
        city: application.propertyInfo.propertyCity,
        state: application.propertyInfo.propertyState,
        zipCode: application.propertyInfo.propertyZipCode,
        propertyType: application.propertyInfo.propertyType,
        propertyValue: application.propertyInfo.propertyValue,
        occupancy: application.declarations.primaryResidence ? 'primary' : 'investment'
      },
      loan: {
        amount: application.propertyInfo.loanAmount,
        purpose: application.propertyInfo.loanPurpose,
        term: 30, // Default 30-year term
        downPayment: application.propertyInfo.downPaymentAmount,
        downPaymentPercentage: application.propertyInfo.downPaymentPercentage
      }
    };

    // Get rates from all sources
    const rateResults = await getAllRates(loanData);

    // Analyze the rates
    const allQuotes = rateResults.allRates
      .filter(response => response.success)
      .flatMap(response => response.quotes);
    
    const analysis = analyzeRates(allQuotes);

    // Update the application with new rates
    application.rateQuotes = rateResults.allRates;
    application.rateAnalysis = analysis;
    application.rateLastUpdated = new Date();
    
    // Add to status history
    const statusEntry = {
      status: 'rates_updated',
      changedBy: session.user.id,
      changedAt: new Date(),
      notes: `Rate quotes updated. Found ${allQuotes.length} quotes from ${rateResults.allRates.filter(r => r.success).length} sources.`
    };
    application.statusHistory = [...(application.statusHistory || []), statusEntry];

    await application.save();

    return NextResponse.json({
      success: true,
      rates: rateResults.allRates,
      analysis,
      summary: rateResults.summary,
      bestRate: rateResults.bestRate,
      cached: false,
      lastUpdated: new Date().toISOString(),
      applicationId: application._id
    });

  } catch (error) {
    console.error('Error getting rates:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get rates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve cached rates
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    const application = await LoanApplication.findById(applicationId);

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check if user has permission to view this application
    if (session.user.role === 'customer' && application.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!application.rateQuotes || application.rateQuotes.length === 0) {
      return NextResponse.json({
        success: true,
        rates: [],
        analysis: null,
        message: 'No rates available. Use POST to fetch rates.'
      });
    }

    return NextResponse.json({
      success: true,
      rates: application.rateQuotes,
      analysis: application.rateAnalysis,
      lastUpdated: application.rateLastUpdated?.toISOString(),
      cached: true
    });

  } catch (error) {
    console.error('Error retrieving rates:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve rates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
