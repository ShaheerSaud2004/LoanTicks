import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

import connectDB from '../lib/mongodb';
import LoanApplication from '../models/LoanApplication';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import mongoose from 'mongoose';

// Create a minimal valid PDF content
function createPDFContent(title: string, content: string): Buffer {
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
/Length ${content.length + 50}
>>
stream
BT
/F1 16 Tf
100 750 Td
(${title}) Tj
0 -30 Td
/F1 12 Tf
(${content}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000306 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
398
%%EOF`;

  return Buffer.from(pdfContent, 'utf-8');
}

async function addTestDocument() {
  try {
    await connectDB();
    console.log('Connected to MongoDB\n');

    // Find the first application
    const application = await LoanApplication.findOne().sort({ createdAt: -1 });
    
    if (!application) {
      console.log('❌ No applications found. Please run seed:test first.');
      process.exit(1);
    }

    const appId = application._id.toString();
    console.log(`📄 Found application: ${appId}`);
    console.log(`   Borrower: ${application.borrowerInfo?.firstName} ${application.borrowerInfo?.lastName}`);
    console.log(`   Current documents: ${application.documents?.length || 0}\n`);

    // Create upload directory
    const uploadDir = join(process.cwd(), 'private', 'uploads', appId);
    await mkdir(uploadDir, { recursive: true });

    // Create a test document
    const timestamp = Date.now();
    const testDocName = 'Test_Document_View_Verification.pdf';
    const uniqueFileName = `${timestamp}_${testDocName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = join(uploadDir, uniqueFileName);

    // Create PDF content
    const pdfContent = createPDFContent(
      'Test Document - View Verification',
      `This is a test document created to verify that documents can be viewed when submitted.\n\nApplication ID: ${appId}\nBorrower: ${application.borrowerInfo?.firstName} ${application.borrowerInfo?.lastName}\nCreated: ${new Date().toISOString()}\n\nThis document was automatically generated to test the document viewing functionality.\n\nYou should be able to view this document in the application details page.`
    );

    await writeFile(filePath, pdfContent);
    console.log(`✓ Created test document: ${testDocName}`);
    console.log(`  Stored as: ${uniqueFileName}`);
    console.log(`  Location: ${filePath}\n`);

    // Add document to application using native MongoDB driver
    const documentMetadata = {
      name: testDocName,
      size: pdfContent.length,
      type: 'application/pdf',
      uploadedAt: new Date(),
      url: `/api/secure-document?applicationId=${appId}&fileName=${uniqueFileName}`,
    };

    try {
      const ObjectId = mongoose.Types.ObjectId;
      await LoanApplication.collection.updateOne(
        { _id: new mongoose.Types.ObjectId(appId) },
        { $push: { documents: documentMetadata } } as any
      );
      console.log(`✓ Added document to application in database\n`);
    } catch (err) {
      console.error(`❌ Error adding document to database:`, err);
      process.exit(1);
    }

    // Verify the document was added - reload from database
    const updatedApp = await LoanApplication.findById(appId).lean();
    console.log(`✅ Success! Application now has ${updatedApp?.documents?.length || 0} document(s)`);
    console.log(`\n📋 Document Details:`);
    if (updatedApp?.documents && updatedApp.documents.length > 0) {
      const lastDoc = updatedApp.documents[updatedApp.documents.length - 1] as any;
      console.log(`   Name: ${lastDoc.name}`);
      console.log(`   Size: ${lastDoc.size} bytes`);
      console.log(`   Type: ${lastDoc.type}`);
      console.log(`   URL: ${lastDoc.url}`);
    } else {
      console.log(`   ⚠️  Document metadata not found in database, but file was created at: ${filePath}`);
      console.log(`   You may need to refresh the application page to see it.`);
    }

    console.log(`\n🔍 To view this document:`);
    console.log(`   1. Login as employee or admin`);
    console.log(`   2. Go to the application details page`);
    console.log(`   3. Click on the "Documents" tab`);
    console.log(`   4. Click on "${testDocName}"`);

    process.exit(0);
  } catch (error) {
    console.error('Error adding test document:', error);
    process.exit(1);
  }
}

addTestDocument();
