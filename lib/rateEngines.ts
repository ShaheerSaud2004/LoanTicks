// Rate Engine Integration for LoanTicks
// Direct lender API integrations for real-time rate quotes

export interface LoanData {
  borrower: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    ssn: string;
    dateOfBirth: string;
    annualIncome: number;
    creditScore: number;
  };
  property: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    propertyType: string;
    propertyValue: number;
    occupancy: string; // primary, secondary, investment
  };
  loan: {
    amount: number;
    purpose: string; // purchase, refinance, cash_out_refinance
    term: number; // 15, 20, 30 years
    downPayment: number;
    downPaymentPercentage: number;
  };
}

export interface RateQuote {
  lender: string;
  rate: number;
  apr: number;
  monthlyPayment: number;
  points: number;
  fees: number;
  lockPeriod: number; // days
  productType: string;
  quoteId: string;
  expiresAt: string;
  requirements: string[];
}

export interface RateResponse {
  success: boolean;
  quotes: RateQuote[];
  error?: string;
  source: string;
  timestamp: string;
}

// Configuration for different lenders
const LENDER_CONFIGS = {
  quicken: {
    name: 'Quicken Loans / Rocket Mortgage',
    baseUrl: 'https://api.rocketmortgage.com/v1',
    apiKey: process.env.QUICKEN_API_KEY,
    enabled: !!process.env.QUICKEN_API_KEY
  },
  better: {
    name: 'Better Mortgage',
    baseUrl: 'https://api.better.com/v1',
    apiKey: process.env.BETTER_API_KEY,
    enabled: !!process.env.BETTER_API_KEY
  },
  loandepot: {
    name: 'LoanDepot',
    baseUrl: 'https://api.loandepot.com/v1',
    apiKey: process.env.LOANDEPOT_API_KEY,
    enabled: !!process.env.LOANDEPOT_API_KEY
  },
  pennymac: {
    name: 'PennyMac',
    baseUrl: 'https://api.pennymac.com/v1',
    apiKey: process.env.PENNYMAC_API_KEY,
    enabled: !!process.env.PENNYMAC_API_KEY
  }
};

// Transform your loan application data to lender-specific format
function transformToLenderFormat(loanData: LoanData, lender: string) {
  const base = {
    borrower: {
      first_name: loanData.borrower.firstName,
      last_name: loanData.borrower.lastName,
      email: loanData.borrower.email,
      phone: loanData.borrower.phone,
      ssn: loanData.borrower.ssn.replace(/-/g, ''),
      date_of_birth: loanData.borrower.dateOfBirth,
      annual_income: loanData.borrower.annualIncome,
      credit_score: loanData.borrower.creditScore
    },
    property: {
      address: loanData.property.address,
      city: loanData.property.city,
      state: loanData.property.state,
      zip_code: loanData.property.zipCode,
      property_type: loanData.property.propertyType,
      property_value: loanData.property.propertyValue,
      occupancy_type: loanData.property.occupancy
    },
    loan: {
      loan_amount: loanData.loan.amount,
      loan_purpose: loanData.loan.purpose,
      loan_term: loanData.loan.term,
      down_payment: loanData.loan.downPayment,
      down_payment_percentage: loanData.loan.downPaymentPercentage
    }
  };

  // Lender-specific transformations
  switch (lender) {
    case 'quicken':
      return {
        ...base,
        product_type: 'conventional',
        rate_lock_days: 60
      };
    case 'better':
      return {
        ...base,
        loan_program: 'conventional',
        rate_lock_period: 60
      };
    case 'loandepot':
      return {
        ...base,
        loan_product: 'conventional',
        lock_period: 60
      };
    default:
      return base;
  }
}

// Quicken Loans / Rocket Mortgage API Integration
async function getQuickenRates(loanData: LoanData): Promise<RateResponse> {
  const config = LENDER_CONFIGS.quicken;
  if (!config.enabled) {
    return {
      success: false,
      quotes: [],
      error: 'Quicken API not configured',
      source: 'quicken',
      timestamp: new Date().toISOString()
    };
  }

  try {
    const requestData = transformToLenderFormat(loanData, 'quicken');
    
    const response = await fetch(`${config.baseUrl}/rate-quotes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`Quicken API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    const quotes: RateQuote[] = data.quotes.map((quote: any) => ({
      lender: 'Quicken Loans',
      rate: quote.interest_rate,
      apr: quote.apr,
      monthlyPayment: quote.monthly_payment,
      points: quote.points || 0,
      fees: quote.total_fees,
      lockPeriod: quote.lock_period_days,
      productType: quote.product_type,
      quoteId: quote.quote_id,
      expiresAt: quote.expires_at,
      requirements: quote.requirements || []
    }));

    return {
      success: true,
      quotes,
      source: 'quicken',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Quicken API error:', error);
    return {
      success: false,
      quotes: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      source: 'quicken',
      timestamp: new Date().toISOString()
    };
  }
}

// Better Mortgage API Integration
async function getBetterRates(loanData: LoanData): Promise<RateResponse> {
  const config = LENDER_CONFIGS.better;
  if (!config.enabled) {
    return {
      success: false,
      quotes: [],
      error: 'Better API not configured',
      source: 'better',
      timestamp: new Date().toISOString()
    };
  }

  try {
    const requestData = transformToLenderFormat(loanData, 'better');
    
    const response = await fetch(`${config.baseUrl}/rate-quotes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`Better API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    const quotes: RateQuote[] = data.rate_quotes.map((quote: any) => ({
      lender: 'Better Mortgage',
      rate: quote.rate,
      apr: quote.apr,
      monthlyPayment: quote.monthly_payment,
      points: quote.points,
      fees: quote.fees,
      lockPeriod: quote.lock_period,
      productType: quote.product_type,
      quoteId: quote.id,
      expiresAt: quote.expires_at,
      requirements: quote.requirements
    }));

    return {
      success: true,
      quotes,
      source: 'better',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Better API error:', error);
    return {
      success: false,
      quotes: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      source: 'better',
      timestamp: new Date().toISOString()
    };
  }
}

// LoanDepot API Integration
async function getLoanDepotRates(loanData: LoanData): Promise<RateResponse> {
  const config = LENDER_CONFIGS.loandepot;
  if (!config.enabled) {
    return {
      success: false,
      quotes: [],
      error: 'LoanDepot API not configured',
      source: 'loandepot',
      timestamp: new Date().toISOString()
    };
  }

  try {
    const requestData = transformToLenderFormat(loanData, 'loandepot');
    
    const response = await fetch(`${config.baseUrl}/pricing/rates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`LoanDepot API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    const quotes: RateQuote[] = data.rates.map((rate: any) => ({
      lender: 'LoanDepot',
      rate: rate.interest_rate,
      apr: rate.apr,
      monthlyPayment: rate.payment,
      points: rate.points,
      fees: rate.total_fees,
      lockPeriod: rate.lock_days,
      productType: rate.product,
      quoteId: rate.quote_id,
      expiresAt: rate.expires_at,
      requirements: rate.requirements
    }));

    return {
      success: true,
      quotes,
      source: 'loandepot',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('LoanDepot API error:', error);
    return {
      success: false,
      quotes: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      source: 'loandepot',
      timestamp: new Date().toISOString()
    };
  }
}

// Custom Rate Engine (Fallback)
async function getCustomRates(loanData: LoanData): Promise<RateResponse> {
  try {
    // Your custom rate calculation logic
    const baseRate = calculateBaseRate(loanData);
    const adjustments = calculateRateAdjustments(loanData);
    const finalRate = baseRate + adjustments;
    
    const monthlyPayment = calculateMonthlyPayment(
      loanData.loan.amount,
      finalRate,
      loanData.loan.term
    );

    const quotes: RateQuote[] = [{
      lender: 'LoanTicks Custom',
      rate: finalRate,
      apr: finalRate + 0.25, // Approximate APR
      monthlyPayment,
      points: 0,
      fees: 2500, // Estimated fees
      lockPeriod: 60,
      productType: 'conventional',
      quoteId: `custom_${Date.now()}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      requirements: ['Credit score 620+', 'DTI ratio < 45%', 'Down payment 5%+']
    }];

    return {
      success: true,
      quotes,
      source: 'custom',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Custom rate engine error:', error);
    return {
      success: false,
      quotes: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      source: 'custom',
      timestamp: new Date().toISOString()
    };
  }
}

// Helper functions for custom rate calculation
function calculateBaseRate(loanData: LoanData): number {
  const { loan, property } = loanData;
  
  // Base rates (these would be updated regularly)
  let baseRate = 6.5; // Current market rate
  
  // Adjustments based on loan amount
  if (loan.amount > 750000) baseRate += 0.25; // Jumbo loan
  if (loan.amount < 200000) baseRate -= 0.125; // Small loan discount
  
  // Adjustments based on down payment
  if (loan.downPaymentPercentage >= 20) baseRate -= 0.25; // No PMI discount
  if (loan.downPaymentPercentage < 5) baseRate += 0.5; // Low down payment
  
  // Adjustments based on property type
  if (property.propertyType === 'condo') baseRate += 0.125;
  if (property.propertyType === 'investment') baseRate += 0.5;
  
  return baseRate;
}

function calculateRateAdjustments(loanData: LoanData): number {
  const { borrower } = loanData;
  let adjustments = 0;
  
  // Credit score adjustments
  if (borrower.creditScore >= 740) adjustments -= 0.25;
  else if (borrower.creditScore >= 680) adjustments -= 0.125;
  else if (borrower.creditScore < 620) adjustments += 0.75;
  
  // Income adjustments
  if (borrower.annualIncome > 100000) adjustments -= 0.125;
  
  return adjustments;
}

function calculateMonthlyPayment(principal: number, rate: number, termYears: number): number {
  const monthlyRate = rate / 100 / 12;
  const numPayments = termYears * 12;
  
  if (monthlyRate === 0) {
    return principal / numPayments;
  }
  
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
         (Math.pow(1 + monthlyRate, numPayments) - 1);
}

// Main function to get rates from all sources
export async function getAllRates(loanData: LoanData): Promise<{
  allRates: RateResponse[];
  bestRate: RateQuote | null;
  summary: {
    totalQuotes: number;
    averageRate: number;
    lowestRate: number;
    highestRate: number;
  };
}> {
  const ratePromises = [
    getQuickenRates(loanData),
    getBetterRates(loanData),
    getLoanDepotRates(loanData),
    getCustomRates(loanData) // Always include custom as fallback
  ];

  const allRates = await Promise.all(ratePromises);
  
  // Combine all quotes
  const allQuotes = allRates
    .filter(response => response.success)
    .flatMap(response => response.quotes);
  
  // Find best rate
  const bestRate = allQuotes.length > 0 
    ? allQuotes.reduce((best, current) => 
        current.rate < best.rate ? current : best
      )
    : null;
  
  // Calculate summary
  const rates = allQuotes.map(quote => quote.rate);
  const summary = {
    totalQuotes: allQuotes.length,
    averageRate: rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0,
    lowestRate: rates.length > 0 ? Math.min(...rates) : 0,
    highestRate: rates.length > 0 ? Math.max(...rates) : 0
  };

  return {
    allRates,
    bestRate,
    summary
  };
}

// Rate comparison and analysis
export function analyzeRates(quotes: RateQuote[]) {
  const analysis = {
    bestRate: quotes.reduce((best, current) => 
      current.rate < best.rate ? current : best
    ),
    bestAPR: quotes.reduce((best, current) => 
      current.apr < best.apr ? current : best
    ),
    lowestPayment: quotes.reduce((best, current) => 
      current.monthlyPayment < best.monthlyPayment ? current : best
    ),
    savings: {
      monthly: 0,
      yearly: 0,
      total: 0
    }
  };

  if (quotes.length > 1) {
    const highestPayment = quotes.reduce((highest, current) => 
      current.monthlyPayment > highest.monthlyPayment ? current : highest
    );
    
    analysis.savings.monthly = highestPayment.monthlyPayment - analysis.lowestPayment.monthlyPayment;
    analysis.savings.yearly = analysis.savings.monthly * 12;
    analysis.savings.total = analysis.savings.yearly * 30; // 30-year loan
  }

  return analysis;
}
