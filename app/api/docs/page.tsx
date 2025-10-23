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
  ChevronUp,
  Menu,
  X,
  Zap,
  Shield
} from 'lucide-react';

export default function APIDocs() {
  const [expandedSection, setExpandedSection] = useState<string | null>('submit-application');
  const [copiedText, setCopiedText] = useState<string>('');
  const [showQuickNav, setShowQuickNav] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
    // Smooth scroll to section on mobile
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setShowQuickNav(false);
    setExpandedSection(sectionId);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpg" alt="LOANATICKS" className="h-10 w-10 rounded-lg bg-white p-1.5" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold">LOANATICKS API</h1>
                <p className="text-blue-100 text-xs sm:text-sm">Developer Docs</p>
              </div>
            </div>
            <button
              onClick={() => setShowQuickNav(!showQuickNav)}
              className="p-3 hover:bg-white/20 rounded-xl transition active:scale-95"
              aria-label="Toggle navigation"
            >
              {showQuickNav ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Navigation Overlay */}
      {showQuickNav && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setShowQuickNav(false)}
        >
          <div 
            className="absolute top-16 right-4 left-4 max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-4 max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Quick Navigation</h3>
            <div className="space-y-2">
              {endpoints.map((endpoint) => (
                <button
                  key={endpoint.id}
                  onClick={() => scrollToSection(endpoint.id)}
                  className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition active:scale-95 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      endpoint.method === 'POST' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {endpoint.method}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{endpoint.title}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Base URL Card */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <LinkIcon className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-sm">BASE URL</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white/20 backdrop-blur-sm px-4 py-3 rounded-xl text-white text-sm overflow-x-auto whitespace-nowrap font-mono">
              https://loanticks.vercel.app
            </code>
            <button
              onClick={() => copyToClipboard('https://loanticks.vercel.app', 'base-url')}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition active:scale-95 flex-shrink-0"
            >
              {copiedText === 'base-url' ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : (
                <Copy className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Info Cards - Mobile Optimized */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl shadow-md p-4 text-center">
            <div className="bg-green-100 p-3 rounded-xl mx-auto mb-2 w-fit">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-xs text-gray-600 mb-1">Version</div>
            <div className="font-bold text-gray-900 text-lg">1.0</div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-4 text-center">
            <div className="bg-blue-100 p-3 rounded-xl mx-auto mb-2 w-fit">
              <Code className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-xs text-gray-600 mb-1">Format</div>
            <div className="font-bold text-gray-900 text-lg">JSON</div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-4 text-center">
            <div className="bg-purple-100 p-3 rounded-xl mx-auto mb-2 w-fit">
              <Book className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-xs text-gray-600 mb-1">Endpoints</div>
            <div className="font-bold text-gray-900 text-lg">{endpoints.length}</div>
          </div>
        </div>

        {/* Authentication Info - Mobile Optimized */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="bg-yellow-200 p-2 rounded-xl flex-shrink-0">
              <Shield className="w-5 h-5 text-yellow-700" />
            </div>
            <div>
              <h3 className="font-bold text-yellow-900 mb-2 text-base">🔐 Authentication</h3>
              <p className="text-sm text-yellow-900 leading-relaxed">
                <strong className="block mb-1">Current:</strong> 
                <span className="text-yellow-800">Session-based (NextAuth)</span><br/>
                <strong className="block mt-2 mb-1">Coming Soon:</strong> 
                <span className="text-yellow-800">API Keys for partners</span>
              </p>
            </div>
          </div>
        </div>

        {/* Endpoints Header */}
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-lg text-base">
            {endpoints.length}
          </span>
          API Endpoints
        </h2>
        
        <div className="space-y-4">
          {endpoints.map((endpoint) => (
            <div 
              key={endpoint.id}
              id={endpoint.id}
              className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden"
            >
              {/* Endpoint Header - Larger Touch Target */}
              <button
                onClick={() => toggleSection(endpoint.id)}
                className="w-full p-5 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className={`px-3 py-2 rounded-xl text-sm font-bold flex-shrink-0 ${
                    endpoint.method === 'POST' ? 'bg-green-500 text-white' :
                    endpoint.method === 'GET' ? 'bg-blue-500 text-white' :
                    'bg-purple-500 text-white'
                  }`}>
                    {endpoint.method}
                  </span>
                  <div className="text-left min-w-0 flex-1">
                    <div className="font-bold text-gray-900 text-base mb-1">
                      {endpoint.title}
                    </div>
                    <code className="text-xs text-gray-500 block truncate">
                      {endpoint.path}
                    </code>
                  </div>
                </div>
                <div className={`p-2 rounded-xl ${expandedSection === endpoint.id ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  {expandedSection === endpoint.id ? (
                    <ChevronUp className="w-6 h-6 text-blue-600" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-600" />
                  )}
                </div>
              </button>

              {/* Endpoint Details - Mobile Optimized */}
              {expandedSection === endpoint.id && (
                <div className="border-t-2 border-gray-100 p-5 space-y-5 bg-gray-50">
                  <p className="text-sm text-gray-700 leading-relaxed">{endpoint.description}</p>
                  
                  {/* Full Path */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase mb-2 block flex items-center gap-2">
                      <LinkIcon className="w-3 h-3" />
                      FULL ENDPOINT URL
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white px-4 py-3 rounded-xl text-xs overflow-x-auto whitespace-nowrap border-2 border-gray-300 font-mono">
                        https://loanticks.vercel.app{endpoint.path}
                      </code>
                      <button
                        onClick={() => copyToClipboard(`https://loanticks.vercel.app${endpoint.path}`, `path-${endpoint.id}`)}
                        className="p-3 bg-blue-500 hover:bg-blue-600 active:scale-95 rounded-xl transition flex-shrink-0 shadow-md"
                      >
                        {copiedText === `path-${endpoint.id}` ? (
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : (
                          <Copy className="w-5 h-5 text-white" />
                        )}
                      </button>
                    </div>
                    {copiedText === `path-${endpoint.id}` && (
                      <p className="text-xs text-green-600 font-semibold mt-2">✓ Copied to clipboard!</p>
                    )}
                  </div>

                  {/* Request Example */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase mb-2 block flex items-center gap-2">
                      <Code className="w-3 h-3" />
                      REQUEST EXAMPLE
                    </label>
                    <div className="relative">
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-xs leading-relaxed font-mono shadow-lg">
                        {endpoint.requestExample}
                      </pre>
                      <button
                        onClick={() => copyToClipboard(endpoint.requestExample, `request-${endpoint.id}`)}
                        className="absolute top-3 right-3 p-2.5 bg-gray-800 hover:bg-gray-700 active:scale-95 rounded-lg transition shadow-lg"
                      >
                        {copiedText === `request-${endpoint.id}` ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <Copy className="w-5 h-5 text-gray-300" />
                        )}
                      </button>
                    </div>
                    {copiedText === `request-${endpoint.id}` && (
                      <p className="text-xs text-green-600 font-semibold mt-2">✓ Request copied!</p>
                    )}
                  </div>

                  {/* Response Example */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase mb-2 block flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      RESPONSE EXAMPLE
                    </label>
                    <div className="relative">
                      <pre className="bg-green-50 text-green-900 p-4 rounded-xl overflow-x-auto text-xs leading-relaxed border-2 border-green-200 font-mono shadow-md">
                        {endpoint.responseExample}
                      </pre>
                      <button
                        onClick={() => copyToClipboard(endpoint.responseExample, `response-${endpoint.id}`)}
                        className="absolute top-3 right-3 p-2.5 bg-green-500 hover:bg-green-600 active:scale-95 rounded-lg transition shadow-lg"
                      >
                        {copiedText === `response-${endpoint.id}` ? (
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : (
                          <Copy className="w-5 h-5 text-white" />
                        )}
                      </button>
                    </div>
                    {copiedText === `response-${endpoint.id}` && (
                      <p className="text-xs text-green-600 font-semibold mt-2">✓ Response copied!</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Rate Limiting - Mobile Optimized */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            📊 Rate Limiting
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
              <span className="text-sm font-medium text-gray-900">Loan Applications</span>
              <span className="font-bold text-blue-600 text-lg">10/min</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
              <span className="text-sm font-medium text-gray-900">Rate Requests</span>
              <span className="font-bold text-green-600 text-lg">20/min</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
              <span className="text-sm font-medium text-gray-900">General API</span>
              <span className="font-bold text-purple-600 text-lg">100/min</span>
            </div>
          </div>
        </div>

        {/* Status Codes - Mobile Optimized */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            📋 HTTP Status Codes
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">200</div>
              <div className="text-xs font-semibold text-green-700">Success</div>
            </div>
            <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200 text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">400</div>
              <div className="text-xs font-semibold text-red-700">Bad Request</div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200 text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-1">401</div>
              <div className="text-xs font-semibold text-yellow-700">Unauthorized</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-xl border-2 border-orange-200 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">404</div>
              <div className="text-xs font-semibold text-orange-700">Not Found</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center pb-4">
          <div className="bg-white rounded-2xl shadow-md border-2 border-gray-200 p-6">
            <p className="text-base font-semibold text-gray-900 mb-2">
              📞 Need Help?
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Contact your LOANATICKS representative for integration support
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Last Updated: October 23, 2025</p>
              <p className="font-semibold text-blue-600">API Version 1.0.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl p-4 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() => copyToClipboard('https://loanticks.vercel.app', 'bottom-base-url')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl active:scale-95 transition"
          >
            {copiedText === 'bottom-base-url' ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span className="text-sm">Copy Base URL</span>
              </>
            )}
          </button>
          <button
            onClick={() => setShowQuickNav(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:shadow-xl active:scale-95 transition"
          >
            <Menu className="w-5 h-5" />
            <span className="text-sm">Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
}

