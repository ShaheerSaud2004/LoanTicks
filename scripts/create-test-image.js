// Create a simple test PNG image for testing uploads
const fs = require('fs');
const path = require('path');

// Create a minimal valid PNG file (1x1 pixel transparent PNG)
// PNG file signature: 89 50 4E 47 0D 0A 1A 0A
const pngHeader = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
  0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
  0x49, 0x48, 0x44, 0x52, // IHDR
  0x00, 0x00, 0x00, 0x01, // width: 1
  0x00, 0x00, 0x00, 0x01, // height: 1
  0x08, 0x06, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
  0x1F, 0x15, 0xC4, 0x89, // CRC
  0x00, 0x00, 0x00, 0x0A, // IDAT chunk length
  0x49, 0x44, 0x41, 0x54, // IDAT
  0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, // compressed data
  0x0D, 0x0A, 0x2D, 0xB4, // CRC
  0x00, 0x00, 0x00, 0x00, // IEND chunk length
  0x49, 0x45, 0x4E, 0x44, // IEND
  0xAE, 0x42, 0x60, 0x82  // CRC
]);

const testDir = path.join(process.cwd(), 'public', 'test-documents');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// Create test PNG file
const pngFile = path.join(testDir, 'test-id-document.png');
fs.writeFileSync(pngFile, pngHeader);
console.log('✅ Created test PNG image:', pngFile);
console.log('   File size:', fs.statSync(pngFile).size, 'bytes');

// Create a simple test PDF content (minimal PDF structure)
const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test ID Document) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000317 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
410
%%EOF`;

const pdfFile = path.join(testDir, 'test-id-document.pdf');
fs.writeFileSync(pdfFile, pdfContent);
console.log('✅ Created test PDF document:', pdfFile);
console.log('   File size:', fs.statSync(pdfFile).size, 'bytes');

console.log('\n📝 Test documents created in:', testDir);
console.log('\nYou can now use these files to test the document upload:');
console.log('  - test-id-document.png (PNG image)');
console.log('  - test-id-document.pdf (PDF document)');
console.log('\nThese files are valid and can be uploaded through the form.');
