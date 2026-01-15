// Create a simple test PDF-like document for testing uploads
const fs = require('fs');
const path = require('path');

// Create a simple text file that can be used for testing
const testContent = `
TEST DOCUMENT FOR LOAN APPLICATION
==================================

This is a test document created for testing the document upload functionality.

Document Type: Government-Issued ID (Test)
Date: ${new Date().toISOString()}
Purpose: Testing document upload system

This document simulates a government-issued ID for testing purposes.
In a real scenario, this would be a PDF or image file of an actual ID.

Test Information:
- Name: Test User
- ID Number: TEST-12345
- Issue Date: 2020-01-01
- Expiry Date: 2030-01-01

This is a placeholder document for testing the upload functionality.
`;

const testDir = path.join(process.cwd(), 'public', 'test-documents');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// Create test text file
const textFile = path.join(testDir, 'test-id-document.txt');
fs.writeFileSync(textFile, testContent);
console.log('✅ Created test text document:', textFile);

// Create a simple HTML file that can be converted to PDF
const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Test ID Document</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .header { background: #f0f0f0; padding: 10px; margin-bottom: 20px; }
    .info { margin: 10px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>TEST GOVERNMENT ID DOCUMENT</h1>
  </div>
  <div class="info">
    <p><strong>Name:</strong> Test User</p>
    <p><strong>ID Number:</strong> TEST-12345</p>
    <p><strong>Issue Date:</strong> January 1, 2020</p>
    <p><strong>Expiry Date:</strong> January 1, 2030</p>
    <p><strong>Purpose:</strong> Testing document upload system</p>
  </div>
  <p><em>This is a test document for testing the loan application upload functionality.</em></p>
</body>
</html>`;

const htmlFile = path.join(testDir, 'test-id-document.html');
fs.writeFileSync(htmlFile, htmlContent);
console.log('✅ Created test HTML document:', htmlFile);

console.log('\n📝 Test documents created in:', testDir);
console.log('You can use these files to test the document upload functionality.');
