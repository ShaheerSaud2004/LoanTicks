import { NextResponse } from 'next/server';

export async function GET() {
  const apiDocumentation = {
    service: "LOANATICKS API",
    version: "1.0.0",
    baseUrl: "https://loanticks.vercel.app",
    description: "RESTful API for loan application management and rate requests",
    
    endpoints: [
      {
        name: "Submit Loan Application",
        path: "/api/loan-application",
        method: "POST",
        description: "Submit a new loan application",
        authentication: "Session-based (NextAuth) or API Key (coming soon)",
        requestBody: {
          status: "submitted",
          borrowerInfo: {
            firstName: "string (required)",
            lastName: "string (required)",
            email: "string (required)",
            phone: "string",
            dateOfBirth: "date",
            ssn: "string",
            maritalStatus: "string",
            dependents: "number",
            creditScore: "number"
          },
          currentAddress: {
            street: "string",
            city: "string",
            state: "string",
            zipCode: "string",
            residencyType: "string",
            monthlyPayment: "number",
            yearsAtAddress: "number"
          },
          employment: {
            employmentStatus: "string",
            employerName: "string",
            position: "string",
            yearsEmployed: "number",
            monthlyIncome: "number",
            employerPhone: "string"
          },
          financialInfo: {
            grossMonthlyIncome: "number",
            otherIncome: "number",
            totalAssets: "number",
            totalLiabilities: "number"
          },
          propertyInfo: {
            propertyAddress: "string",
            propertyCity: "string",
            propertyState: "string",
            propertyZipCode: "string",
            propertyType: "string",
            propertyValue: "number",
            loanAmount: "number",
            loanPurpose: "string"
          }
        },
        responseExample: {
          success: true,
          applicationId: "507f1f77bcf86cd799439011",
          message: "Loan application saved successfully"
        }
      },
      {
        name: "Get Loan Application",
        path: "/api/loan-application?id={applicationId}",
        method: "GET",
        description: "Retrieve a specific loan application by ID",
        authentication: "Session-based (NextAuth) or API Key (coming soon)",
        parameters: {
          id: "Application ID (required)"
        },
        responseExample: {
          application: {
            _id: "507f1f77bcf86cd799439011",
            userId: "507f191e810c19729de860ea",
            status: "submitted",
            borrowerInfo: "{ ... }",
            propertyInfo: "{ ... }",
            createdAt: "2025-10-23T12:00:00.000Z"
          }
        }
      },
      {
        name: "Get Loan Rates",
        path: "/api/get-rates",
        method: "POST",
        description: "Request loan rates for an application",
        authentication: "Session-based (NextAuth) or API Key (coming soon)",
        requestBody: {
          applicationId: "string (required)",
          forceRefresh: "boolean (optional, default: false)"
        },
        responseExample: {
          success: true,
          rates: [
            {
              lender: "Sample Bank",
              interestRate: 6.5,
              apr: 6.75,
              monthlyPayment: 2528.27,
              loanTerm: 360,
              closingCosts: 8500
            }
          ],
          analysis: {
            creditScore: 740,
            dti: 28.5,
            ltv: 80
          }
        }
      },
      {
        name: "Upload Documents",
        path: "/api/upload-documents",
        method: "POST",
        description: "Upload supporting documents for a loan application",
        authentication: "Session-based (NextAuth) or API Key (coming soon)",
        contentType: "multipart/form-data",
        requestBody: {
          applicationId: "string (required)",
          documentType: "string (required)",
          file: "file (required)"
        },
        responseExample: {
          success: true,
          message: "Document uploaded successfully",
          documentId: "507f1f77bcf86cd799439011"
        }
      },
      {
        name: "Get All Applications (Employee/Admin)",
        path: "/api/employee/applications",
        method: "GET",
        description: "Retrieve all loan applications (requires employee or admin role)",
        authentication: "Session-based (NextAuth) - Employee/Admin only",
        responseExample: {
          applications: [
            {
              _id: "507f1f77bcf86cd799439011",
              userId: "507f191e810c19729de860ea",
              status: "submitted",
              loanAmount: 400000,
              propertyValue: 500000,
              submittedAt: "2025-10-23T12:00:00.000Z"
            }
          ]
        }
      }
    ],
    
    statusCodes: {
      200: "Success",
      201: "Created",
      400: "Bad Request - Invalid input",
      401: "Unauthorized - Authentication required",
      404: "Not Found",
      500: "Internal Server Error"
    },
    
    authentication: {
      current: "Session-based authentication using NextAuth",
      planned: "API Key authentication for third-party integrations",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer {api_key} (coming soon)"
      }
    },
    
    rateLimiting: {
      enabled: true,
      limits: {
        applications: "10 requests per minute per IP",
        rates: "20 requests per minute per IP",
        general: "100 requests per minute per IP"
      }
    },
    
    support: {
      documentation: "https://loanticks.vercel.app/api/documentation",
      mobileFriendlyDocs: "https://loanticks.vercel.app/api/docs",
      contact: "For API access and integration support, contact your LOANATICKS representative"
    },
    
    links: {
      jsonDocs: "https://loanticks.vercel.app/api/documentation",
      webDocs: "https://loanticks.vercel.app/api/docs",
      demo: "https://loanticks.vercel.app/demo"
    }
  };

  return NextResponse.json(apiDocumentation, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

