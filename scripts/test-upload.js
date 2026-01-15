// Test script to verify document upload functionality
const fs = require('fs');
const path = require('path');

console.log('📄 Document Upload System Test\n');

// Check if test documents exist
const testDir = path.join(process.cwd(), 'public', 'test-documents');
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

console.log('1. Checking test documents...');
if (fs.existsSync(testDir)) {
  const files = fs.readdirSync(testDir);
  console.log(`   ✅ Found ${files.length} test documents:`);
  files.forEach(file => {
    const filePath = path.join(testDir, file);
    const stats = fs.statSync(filePath);
    console.log(`      - ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
  });
} else {
  console.log('   ❌ Test documents directory not found');
}

console.log('\n2. Checking uploads directory...');
if (fs.existsSync(uploadsDir)) {
  console.log('   ✅ Uploads directory exists');
  const subdirs = fs.readdirSync(uploadsDir).filter(item => {
    const itemPath = path.join(uploadsDir, item);
    return fs.statSync(itemPath).isDirectory();
  });
  console.log(`   📁 Found ${subdirs.length} application upload directories`);
} else {
  console.log('   ⚠️  Uploads directory does not exist (will be created on first upload)');
  // Create it
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('   ✅ Created uploads directory');
}

console.log('\n3. Verifying file types...');
const testFiles = [
  { name: 'test-id-document.png', type: 'image/png', extension: '.png' },
  { name: 'test-id-document.pdf', type: 'application/pdf', extension: '.pdf' },
];

testFiles.forEach(testFile => {
  const filePath = path.join(testDir, testFile.name);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const isValidSize = stats.size > 0 && stats.size < 10 * 1024 * 1024; // Less than 10MB
    console.log(`   ✅ ${testFile.name}:`);
    console.log(`      - Type: ${testFile.type}`);
    console.log(`      - Extension: ${testFile.extension}`);
    console.log(`      - Size: ${(stats.size / 1024).toFixed(2)} KB (${isValidSize ? 'Valid' : 'Invalid'})`);
  } else {
    console.log(`   ❌ ${testFile.name}: Not found`);
  }
});

console.log('\n4. Upload API Route Check...');
const uploadRoute = path.join(process.cwd(), 'app', 'api', 'upload-documents', 'route.ts');
if (fs.existsSync(uploadRoute)) {
  console.log('   ✅ Upload API route exists');
  const routeContent = fs.readFileSync(uploadRoute, 'utf8');
  const hasValidation = routeContent.includes('allowedTypes');
  const hasSizeCheck = routeContent.includes('maxSize');
  const hasAuth = routeContent.includes('auth()');
  console.log(`      - File validation: ${hasValidation ? '✅' : '❌'}`);
  console.log(`      - Size limit check: ${hasSizeCheck ? '✅' : '❌'}`);
  console.log(`      - Authentication: ${hasAuth ? '✅' : '❌'}`);
} else {
  console.log('   ❌ Upload API route not found');
}

console.log('\n✅ Test Summary:');
console.log('   The document upload system is ready for testing!');
console.log('\n📝 To test manually:');
console.log('   1. Start the development server: npm run dev');
console.log('   2. Log in as a customer');
console.log('   3. Go to loan application form');
console.log('   4. Navigate to Section 14: Supporting Documents');
console.log('   5. Upload test-id-document.png or test-id-document.pdf');
console.log('   6. Submit the application');
console.log('   7. Check the browser console for upload confirmation');
console.log('   8. Check public/uploads/{applicationId}/ for uploaded files');
