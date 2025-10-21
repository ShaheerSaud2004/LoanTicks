# 🏦 Direct Lender API Integration Guide

## Overview
This guide shows you how to integrate with direct lender APIs to get real-time mortgage rates for your LoanTicks system.

## 🚀 Quick Start

### 1. Test the Rate Engine
```bash
# Test the rate engine with sample data
curl http://localhost:3001/api/test-rates
```

### 2. Get Rates for an Application
```bash
# Get rates for a specific loan application
curl -X POST http://localhost:3001/api/get-rates \
  -H "Content-Type: application/json" \
  -d '{"applicationId": "your_application_id"}'
```

## 🔑 API Key Setup

### Step 1: Create .env File
Add these environment variables to your `.env.local` file:

```env
# Direct Lender API Keys
QUICKEN_API_KEY=your_quicken_api_key_here
BETTER_API_KEY=your_better_api_key_here
LOANDEPOT_API_KEY=your_loandepot_api_key_here
PENNYMAC_API_KEY=your_pennymac_api_key_here

# Optional: Rate caching settings
RATE_CACHE_DURATION=3600  # 1 hour in seconds
RATE_RETRY_ATTEMPTS=3
RATE_TIMEOUT=30000  # 30 seconds
```

### Step 2: Get API Access

#### Quicken Loans / Rocket Mortgage
- **Website**: https://developer.quickenloans.com
- **Contact**: developer@quickenloans.com
- **Requirements**: Business license, NMLS number
- **Rate**: Contact for pricing
- **Features**: Real-time rates, automated underwriting

#### Better Mortgage
- **Website**: https://developer.better.com
- **Contact**: api@better.com
- **Requirements**: Mortgage broker license
- **Rate**: Contact for pricing
- **Features**: Rate quotes, application processing

#### LoanDepot
- **Website**: https://developer.loandepot.com
- **Contact**: api@loandepot.com
- **Requirements**: NMLS license
- **Rate**: Contact for pricing
- **Features**: Rate pricing, product eligibility

#### PennyMac
- **Website**: https://developer.pennymac.com
- **Contact**: api@pennymac.com
- **Requirements**: Mortgage broker license
- **Rate**: Contact for pricing
- **Features**: Rate sheets, automated pricing

## 🛠️ Implementation Details

### Rate Engine Features
- ✅ **Multi-source comparison**: Get rates from multiple lenders
- ✅ **Custom fallback**: Built-in rate engine when APIs are unavailable
- ✅ **Caching**: Avoid excessive API calls with intelligent caching
- ✅ **Error handling**: Graceful fallbacks and retry logic
- ✅ **Rate analysis**: Compare rates and calculate savings

### API Endpoints

#### GET /api/test-rates
Test the rate engine with sample data
```json
{
  "success": true,
  "results": {
    "totalSources": 4,
    "successfulSources": 2,
    "totalQuotes": 6,
    "bestRate": {
      "lender": "Quicken Loans",
      "rate": 6.25,
      "monthlyPayment": 3695
    }
  }
}
```

#### POST /api/get-rates
Get rates for a specific loan application
```json
{
  "applicationId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "forceRefresh": false
}
```

#### GET /api/get-rates?applicationId=xxx
Retrieve cached rates for an application

### Rate Data Structure
```typescript
interface RateQuote {
  lender: string;           // "Quicken Loans"
  rate: number;            // 6.25
  apr: number;             // 6.45
  monthlyPayment: number;  // 3695
  points: number;          // 0
  fees: number;            // 2500
  lockPeriod: number;      // 60 days
  productType: string;     // "conventional"
  quoteId: string;         // "quote_12345"
  expiresAt: string;       // "2024-01-15T10:30:00Z"
  requirements: string[];  // ["Credit score 620+", "DTI < 45%"]
}
```

## 📊 Rate Analysis Features

### Automatic Rate Comparison
- **Best Rate**: Lowest interest rate
- **Best APR**: Lowest APR (includes fees)
- **Lowest Payment**: Lowest monthly payment
- **Savings Calculation**: Monthly, yearly, and total savings

### Example Analysis
```json
{
  "analysis": {
    "bestRate": {
      "lender": "Quicken Loans",
      "rate": 6.25,
      "monthlyPayment": 3695
    },
    "savings": {
      "monthly": 150,
      "yearly": 1800,
      "total": 54000
    }
  }
}
```

## 🔄 Integration with Loan Applications

### Automatic Rate Updates
When a customer submits a loan application, rates are automatically fetched:

```typescript
// In your loan application submission
const application = await saveApplication(applicationData);
const rates = await getAllRates(transformToRateFormat(applicationData));
await updateApplicationRates(application._id, rates);
```

### Rate Monitoring
Set up automated rate monitoring to notify customers of rate changes:

```typescript
// Monitor rates every hour
setInterval(async () => {
  const applications = await getActiveApplications();
  for (const app of applications) {
    const newRates = await getAllRates(app);
    if (ratesChanged(newRates, app.lastRates)) {
      await notifyCustomer(app.userId, newRates);
    }
  }
}, 3600000); // 1 hour
```

## 🚨 Error Handling & Fallbacks

### API Failures
If a lender API fails, the system:
1. Logs the error
2. Continues with other sources
3. Uses custom rate engine as fallback
4. Returns partial results

### Custom Rate Engine
Built-in rate calculation when APIs are unavailable:
- Base rates updated regularly
- Adjustments for loan amount, down payment, credit score
- Property type and occupancy adjustments
- Competitive rate estimates

## 📈 Performance Optimization

### Caching Strategy
- **Rate Cache**: 1 hour (configurable)
- **Application Cache**: 30 minutes
- **Error Cache**: 5 minutes (prevent retry storms)

### Rate Limiting
- **Per Lender**: Respect API rate limits
- **Global**: Maximum 100 requests/minute
- **Retry Logic**: Exponential backoff

## 🔐 Security & Compliance

### Data Protection
- Encrypt sensitive data before API calls
- Secure API key storage
- Audit logging for all rate requests
- GDPR compliance for customer data

### API Security
- Use HTTPS for all API calls
- Implement request signing where required
- Rate limiting and abuse prevention
- Regular security audits

## 📞 Support & Troubleshooting

### Common Issues

#### "API not configured" Error
- Check environment variables are set
- Verify API keys are valid
- Contact lender for API access

#### "Rate limit exceeded" Error
- Implement request queuing
- Use caching to reduce API calls
- Contact lender for higher limits

#### "Invalid loan data" Error
- Validate loan data format
- Check required fields
- Review lender-specific requirements

### Getting Help
- **Documentation**: Check lender API docs
- **Support**: Contact lender developer support
- **Community**: Join mortgage tech forums
- **Logs**: Check application logs for details

## 🎯 Next Steps

1. **Get API Access**: Contact lenders for API credentials
2. **Test Integration**: Use test endpoints to verify setup
3. **Deploy to Production**: Update environment variables
4. **Monitor Performance**: Set up logging and alerts
5. **Optimize**: Fine-tune caching and error handling

## 📚 Additional Resources

- [Quicken Loans API Documentation](https://developer.quickenloans.com)
- [Better Mortgage API Docs](https://developer.better.com)
- [LoanDepot Developer Portal](https://developer.loandepot.com)
- [PennyMac API Guide](https://developer.pennymac.com)
- [Mortgage Industry Standards](https://www.mismo.org)

---

**Ready to get started?** Run the test endpoint and begin integrating with direct lender APIs! 🚀
