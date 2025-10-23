'use client';

import { useState } from 'react';
import { 
  Code, 
  Book, 
  Link as LinkIcon, 
  CheckCircle, 
  AlertCircle,
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function APIDocs() {
  const [expandedSection, setExpandedSection] = useState<string | null>('submit-application');
  const [copiedText, setCopiedText] = useState<string>('');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const endpoints = [
    {
      id: 'submit-application',
      title: 'Submit Loan Application',
      method: 'POST',
      path: '/api/loan-application',
      description: 'Submit a new loan application to the system',
      requestExample: `{
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
}`,
      responseExample: `{
  "success": true,
  "applicationId": "507f1f77bcf86cd799439011",
  "message": "Loan application saved successfully"
}`
    },
    {
      id: 'get-application',
      title: 'Get Loan Application',
      method: 'GET',
      path: '/api/loan-application?id={applicationId}',
      description: 'Retrieve details of a specific loan application',
      requestExample: 'Query Parameter: id=507f1f77bcf86cd799439011',
      responseExample: `{
  "application": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "submitted",
    "borrowerInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "creditScore": 740
    },
    "propertyInfo": {
      "loanAmount": 400000
    }
  }
}`
    },
    {
      id: 'get-rates',
      title: 'Get Loan Rates',
      method: 'POST',
      path: '/api/get-rates',
      description: 'Request loan rates for an application',
      requestExample: `{
  "applicationId": "507f1f77bcf86cd799439011",
  "forceRefresh": false
}`,
      responseExample: `{
  "success": true,
  "rates": [
    {
      "lender": "Sample Bank",
      "interestRate": 6.5,
      "apr": 6.75,
      "monthlyPayment": 2528.27,
      "loanTerm": 360
    }
  ],
  "analysis": {
    "creditScore": 740,
    "dti": 28.5,
    "ltv": 80
  }
}`
    },
    {
      id: 'upload-docs',
      title: 'Upload Documents',
      method: 'POST',
      path: '/api/upload-documents',
      description: 'Upload supporting documents for a loan application',
      requestExample: `Content-Type: multipart/form-data

Form Data:
- applicationId: "507f1f77bcf86cd799439011"
- documentType: "pay_stub"
- file: [binary file]`,
      responseExample: `{
  "success": true,
  "message": "Document uploaded successfully",
  "documentId": "507f1f77bcf86cd799439011"
}`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
          <div className="flex items-center gap-3 mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg" alt="LOANATICKS" className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl bg-white p-2" />
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold">LOANATICKS API</h1>
              <p className="text-blue-100 text-sm sm:text-base mt-1">Developer Documentation</p>
            </div>
          </div>
          
          {/* Base URL */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-6">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                <span className="text-sm font-semibold">Base URL:</span>
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <code className="text-xs sm:text-sm bg-black/20 px-3 py-2 rounded-lg flex-1 overflow-x-auto whitespace-nowrap">
                  https://loanticks.vercel.app
                </code>
                <button
                  onClick={() => copyToClipboard('https://loanticks.vercel.app', 'base-url')}
                  className="p-2 hover:bg-white/20 rounded-lg transition flex-shrink-0"
                >
                  {copiedText === 'base-url' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 border-2 border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Version</div>
                <div className="font-bold text-gray-900">1.0.0</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border-2 border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Code className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Format</div>
                <div className="font-bold text-gray-900">JSON</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border-2 border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Book className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Endpoints</div>
                <div className="font-bold text-gray-900">{endpoints.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Authentication Info */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 sm:p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-yellow-900 mb-2">Authentication</h3>
              <p className="text-sm text-yellow-800">
                <strong>Current:</strong> Session-based authentication (NextAuth)<br/>
                <strong>Coming Soon:</strong> API Key authentication for third-party integrations
              </p>
            </div>
          </div>
        </div>

        {/* Endpoints */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">API Endpoints</h2>
        
        <div className="space-y-4">
          {endpoints.map((endpoint) => (
            <div 
              key={endpoint.id}
              className="bg-white rounded-xl shadow-sm border-2 border-gray-100 overflow-hidden"
            >
              {/* Endpoint Header */}
              <button
                onClick={() => toggleSection(endpoint.id)}
                className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-bold flex-shrink-0 ${
                    endpoint.method === 'POST' ? 'bg-green-100 text-green-700' :
                    endpoint.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {endpoint.method}
                  </span>
                  <div className="text-left min-w-0 flex-1">
                    <div className="font-bold text-gray-900 text-sm sm:text-base truncate">
                      {endpoint.title}
                    </div>
                    <code className="text-xs text-gray-600 block truncate">
                      {endpoint.path}
                    </code>
                  </div>
                </div>
                {expandedSection === endpoint.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>

              {/* Endpoint Details */}
              {expandedSection === endpoint.id && (
                <div className="border-t-2 border-gray-100 p-4 sm:p-6 space-y-4">
                  <p className="text-sm text-gray-700">{endpoint.description}</p>
                  
                  {/* Full Path */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">
                      Full Endpoint URL
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-gray-50 px-3 py-2 rounded-lg text-xs sm:text-sm overflow-x-auto whitespace-nowrap border border-gray-200">
                        https://loanticks.vercel.app{endpoint.path}
                      </code>
                      <button
                        onClick={() => copyToClipboard(`https://loanticks.vercel.app${endpoint.path}`, `path-${endpoint.id}`)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
                      >
                        {copiedText === `path-${endpoint.id}` ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Request Example */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">
                      Request Example
                    </label>
                    <div className="relative">
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs sm:text-sm">
                        {endpoint.requestExample}
                      </pre>
                      <button
                        onClick={() => copyToClipboard(endpoint.requestExample, `request-${endpoint.id}`)}
                        className="absolute top-2 right-2 p-2 hover:bg-gray-800 rounded-lg transition"
                      >
                        {copiedText === `request-${endpoint.id}` ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Response Example */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">
                      Response Example
                    </label>
                    <div className="relative">
                      <pre className="bg-green-50 text-green-900 p-4 rounded-lg overflow-x-auto text-xs sm:text-sm border border-green-200">
                        {endpoint.responseExample}
                      </pre>
                      <button
                        onClick={() => copyToClipboard(endpoint.responseExample, `response-${endpoint.id}`)}
                        className="absolute top-2 right-2 p-2 hover:bg-green-100 rounded-lg transition"
                      >
                        {copiedText === `response-${endpoint.id}` ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-green-700" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Rate Limiting */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border-2 border-gray-100 p-4 sm:p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Rate Limiting</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Loan Applications</span>
              <span className="font-semibold text-gray-900">10 req/min</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Rate Requests</span>
              <span className="font-semibold text-gray-900">20 req/min</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">General API</span>
              <span className="font-semibold text-gray-900">100 req/min</span>
            </div>
          </div>
        </div>

        {/* Status Codes */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border-2 border-gray-100 p-4 sm:p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📋 HTTP Status Codes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-16 h-8 bg-green-100 text-green-700 rounded flex items-center justify-center text-xs font-bold">
                200
              </div>
              <span className="text-sm text-gray-700">Success</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-8 bg-red-100 text-red-700 rounded flex items-center justify-center text-xs font-bold">
                400
              </div>
              <span className="text-sm text-gray-700">Bad Request</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-8 bg-yellow-100 text-yellow-700 rounded flex items-center justify-center text-xs font-bold">
                401
              </div>
              <span className="text-sm text-gray-700">Unauthorized</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-8 bg-orange-100 text-orange-700 rounded flex items-center justify-center text-xs font-bold">
                404
              </div>
              <span className="text-sm text-gray-700">Not Found</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center pb-8">
          <p className="text-sm text-gray-600">
            Need help? Contact your LOANATICKS representative
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Last Updated: October 23, 2025 • API Version 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}

