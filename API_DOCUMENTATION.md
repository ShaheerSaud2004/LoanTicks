# LOANATICKS API Documentation

## 🔗 Base URL
```
https://loanticks.vercel.app
```

## 📚 API Documentation Endpoint
```
GET https://loanticks.vercel.app/api/documentation
```
Returns complete API documentation in JSON format.

---

## 🔐 Authentication

**Current:** Session-based authentication (NextAuth)  
**Coming Soon:** API Key authentication for third-party integrations

### Headers
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {your-api-key}"
}
```

---

## 📋 API Endpoints

### 1. Submit Loan Application

**Endpoint:** `POST /api/loan-application`

**Description:** Submit a new loan application

**Request Body:**
```json
{
  "status": "submitted",
  "borrowerInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "(555) 123-4567",
    "dateOfBirth": "1985-06-15",
    "ssn": "123-45-6789",
    "maritalStatus": "married",
    "dependents": 2,
    "creditScore": 740
  },
  "currentAddress": {
    "street": "123 Main St",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90001",
    "residencyType": "rent",
    "monthlyPayment": 2500,
    "yearsAtAddress": 3
  },
  "employment": {
    "employmentStatus": "employed",
    "employerName": "Tech Corp",
    "position": "Software Engineer",
    "yearsEmployed": 5,
    "monthlyIncome": 10000,
    "employerPhone": "(555) 987-6543"
  },
  "financialInfo": {
    "grossMonthlyIncome": 10000,
    "otherIncome": 500,
    "totalAssets": 100000,
    "totalLiabilities": 1000,
    "checkingAccountBalance": 25000,
    "savingsAccountBalance": 75000
  },
  "propertyInfo": {
    "propertyAddress": "456 Oak Ave",
    "propertyCity": "Los Angeles",
    "propertyState": "CA",
    "propertyZipCode": "90210",
    "propertyType": "single_family",
    "propertyValue": 500000,
    "loanAmount": 400000,
    "loanPurpose": "purchase",
    "downPaymentAmount": 100000,
    "downPaymentPercentage": 20
  },
  "assets": {
    "bankAccounts": []
  },
  "liabilities": {
    "creditCards": [],
    "loans": []
  },
  "declarations": {
    "outstandingJudgments": false,
    "declaredBankruptcy": false,
    "propertyForeclosed": false,
    "lawsuitParty": false,
    "loanOnProperty": false,
    "coMakerOnNote": false,
    "usCitizen": true,
    "permanentResident": false,
    "primaryResidence": true,
    "intendToOccupy": true
  },
  "submittedAt": "2025-10-23T12:00:00.000Z"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "applicationId": "507f1f77bcf86cd799439011",
  "message": "Loan application saved successfully"
}
```

---

### 2. Retrieve Loan Application

**Endpoint:** `GET /api/loan-application?id={applicationId}`

**Description:** Get details of a specific loan application

**Parameters:**
- `id` (required): Application ID

**Response (200 OK):**
```json
{
  "application": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "status": "submitted",
    "borrowerInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "creditScore": 740
    },
    "propertyInfo": {
      "propertyValue": 500000,
      "loanAmount": 400000
    },
    "createdAt": "2025-10-23T12:00:00.000Z",
    "submittedAt": "2025-10-23T12:00:00.000Z"
  }
}
```

---

### 3. Get Loan Rates

**Endpoint:** `POST /api/get-rates`

**Description:** Request loan rates for an application

**Request Body:**
```json
{
  "applicationId": "507f1f77bcf86cd799439011",
  "forceRefresh": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "rates": [
    {
      "lender": "Sample Bank",
      "interestRate": 6.5,
      "apr": 6.75,
      "monthlyPayment": 2528.27,
      "loanTerm": 360,
      "closingCosts": 8500,
      "points": 0,
      "loanType": "Conventional 30-Year Fixed"
    },
    {
      "lender": "Credit Union",
      "interestRate": 6.25,
      "apr": 6.5,
      "monthlyPayment": 2462.87,
      "loanTerm": 360,
      "closingCosts": 7500,
      "points": 1,
      "loanType": "Conventional 30-Year Fixed"
    }
  ],
  "analysis": {
    "creditScore": 740,
    "dti": 28.5,
    "ltv": 80,
    "recommendation": "Excellent credit profile"
  },
  "applicationId": "507f1f77bcf86cd799439011"
}
```

---

### 4. Upload Documents

**Endpoint:** `POST /api/upload-documents`

**Description:** Upload supporting documents for a loan application

**Content-Type:** `multipart/form-data`

**Form Data:**
- `applicationId` (string, required): The loan application ID
- `documentType` (string, required): Type of document (e.g., "pay_stub", "tax_return", "bank_statement")
- `file` (file, required): The document file

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "documentId": "507f1f77bcf86cd799439011"
}
```

---

### 5. Get All Applications (Employee/Admin Only)

**Endpoint:** `GET /api/employee/applications`

**Description:** Retrieve all loan applications (requires employee or admin authentication)

**Response (200 OK):**
```json
{
  "applications": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com"
      },
      "status": "submitted",
      "loanAmount": 400000,
      "propertyValue": 500000,
      "assignedTo": null,
      "submittedAt": "2025-10-23T12:00:00.000Z",
      "createdAt": "2025-10-23T12:00:00.000Z"
    }
  ]
}
```

---

## 📊 Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## 🚦 Rate Limiting

Rate limits are enforced per IP address:

- **Loan Applications:** 10 requests per minute
- **Rate Requests:** 20 requests per minute
- **General API:** 100 requests per minute

---

## 🔧 Error Responses

All error responses follow this format:

```json
{
  "error": "Error message description",
  "details": "Additional error details (optional)"
}
```

**Example:**
```json
{
  "error": "Unauthorized",
  "details": "Valid authentication required"
}
```

---

## 🧪 Testing

### Test Endpoint
```
GET https://loanticks.vercel.app/api/documentation
```

### Demo Accounts (for testing)
```
Customer: sarah.customer@loanticks.com / demo123
Employee: john.employee@loanticks.com / demo123
Admin: admin.demo@loanticks.com / demo123
```

---

## 📞 Support & Integration

### For API Access:
Contact your LOANATICKS representative for:
- API key generation
- Custom endpoint requirements
- Webhook configuration
- Integration support

### Documentation:
- **JSON API Docs:** https://loanticks.vercel.app/api/documentation
- **Demo Environment:** https://loanticks.vercel.app/demo

---

## 🔄 Webhook Support (Coming Soon)

For real-time updates on application status changes, we'll support webhook notifications:

```json
{
  "event": "application.status_changed",
  "applicationId": "507f1f77bcf86cd799439011",
  "oldStatus": "submitted",
  "newStatus": "approved",
  "timestamp": "2025-10-23T12:00:00.000Z"
}
```

---

## 📋 Application Status Values

| Status | Description |
|--------|-------------|
| `draft` | Application started but not submitted |
| `submitted` | Application submitted, pending review |
| `under_review` | Being reviewed by an employee |
| `approved` | Application approved |
| `rejected` | Application rejected |

---

## 🎯 Quick Start Example (cURL)

### Submit an Application:
```bash
curl -X POST https://loanticks.vercel.app/api/loan-application \
  -H "Content-Type: application/json" \
  -d '{
    "status": "submitted",
    "borrowerInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "(555) 123-4567",
      "creditScore": 740
    },
    "propertyInfo": {
      "propertyValue": 500000,
      "loanAmount": 400000,
      "loanPurpose": "purchase"
    }
  }'
```

### Get Rates:
```bash
curl -X POST https://loanticks.vercel.app/api/get-rates \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "507f1f77bcf86cd799439011",
    "forceRefresh": false
  }'
```

---

**Last Updated:** October 23, 2025  
**API Version:** 1.0.0  
**Support:** Contact your LOANATICKS representative

