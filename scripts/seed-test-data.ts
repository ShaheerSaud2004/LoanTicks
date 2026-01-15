import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

import User from '../models/User';
import LoanApplication from '../models/LoanApplication';
import connectDB from '../lib/mongodb';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import mongoose from 'mongoose';

// Helper function to encrypt SSN if encryption is available
function encryptSSN(ssn: string): string {
  try {
    const { encryptSensitiveData } = require('../lib/encryption');
    return encryptSensitiveData(ssn);
  } catch (error) {
    // If encryption fails (e.g., ENCRYPTION_KEY not set), use plain text for test data
    console.warn('⚠️  Encryption not available, using plain text for test SSNs');
    return ssn;
  }
}

const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin@loanaticks.com',
    password: 'admin123',
    role: 'admin',
    phone: '+1-555-0101',
  },
  {
    name: 'Employee User',
    email: 'employee@loanaticks.com',
    password: 'employee123',
    role: 'employee',
    phone: '+1-555-0102',
  },
  {
    name: 'Customer User',
    email: 'customer@loanaticks.com',
    password: 'customer123',
    role: 'customer',
    phone: '+1-555-0103',
  },
];

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

async function createApplicationDocuments(applicationId: string, documents: Array<{ name: string; type: string }>) {
  try {
    // Create upload directory for this application
    const uploadDir = join(process.cwd(), 'private', 'uploads', applicationId);
    await mkdir(uploadDir, { recursive: true });

    const createdFiles = [];

    for (const doc of documents) {
      // Create a unique filename
      const timestamp = Date.now();
      const sanitizedName = doc.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFileName = `${timestamp}_${sanitizedName}`;
      const filePath = join(uploadDir, uniqueFileName);

      // Create PDF content based on document type
      let pdfContent: Buffer;
      if (doc.name.toLowerCase().includes('id') || doc.name.toLowerCase().includes('passport') || doc.name.toLowerCase().includes('license')) {
        pdfContent = createPDFContent(
          'Government Issued ID',
          `This is a test ${doc.name} document.\n\nDocument Type: ${doc.name}\nApplication ID: ${applicationId}\nCreated: ${new Date().toISOString()}\n\nThis is a placeholder document for testing purposes.`
        );
      } else if (doc.name.toLowerCase().includes('pay') || doc.name.toLowerCase().includes('stub')) {
        pdfContent = createPDFContent(
          'Pay Stub',
          `This is a test ${doc.name} document.\n\nEmployee: Test User\nPeriod: ${doc.name.includes('January') ? 'January 2025' : doc.name.includes('February') ? 'February 2025' : 'Recent Period'}\nApplication ID: ${applicationId}\nCreated: ${new Date().toISOString()}\n\nThis is a placeholder document for testing purposes.`
        );
      } else {
        pdfContent = createPDFContent(
          'Document',
          `This is a test ${doc.name} document.\n\nApplication ID: ${applicationId}\nCreated: ${new Date().toISOString()}\n\nThis is a placeholder document for testing purposes.`
        );
      }

      await writeFile(filePath, pdfContent);
      createdFiles.push({
        originalName: doc.name,
        storedName: uniqueFileName,
        filePath,
      });
      console.log(`  ✓ Created document: ${doc.name} -> ${uniqueFileName}`);
    }

    return createdFiles;
  } catch (error) {
    console.error(`Error creating documents for application ${applicationId}:`, error);
    return [];
  }
}

async function seedTestData() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Create demo users
    console.log('\n📝 Creating demo users...');
    const createdUsers: any[] = [];
    
    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`⚠ User already exists: ${userData.email}`);
        createdUsers.push(existingUser);
      } else {
        const user = new User(userData);
        await user.save();
        console.log(`✓ Created ${userData.role}: ${userData.email}`);
        createdUsers.push(user);
      }
    }

    // Get customer user ID
    const customerUser = createdUsers.find(u => u.role === 'customer');
    const employeeUser = createdUsers.find(u => u.role === 'employee');
    
    if (!customerUser) {
      console.error('Customer user not found!');
      process.exit(1);
    }

    // Test documents will be created per application
    console.log('\n📄 Documents will be created for each application...');

    // Clear existing loan applications for customer
    console.log('\n🗑️  Clearing existing loan applications...');
    await LoanApplication.deleteMany({ userId: customerUser._id.toString() });
    console.log('✓ Cleared existing applications');

    // Create test loan applications
    console.log('\n📋 Creating test loan applications...');

    const testApplications = [
      {
        userId: customerUser._id.toString(),
        status: 'submitted',
        borrowerInfo: {
          firstName: 'John',
          middleName: 'Michael',
          lastName: 'Smith',
          email: 'customer@loanaticks.com',
          phone: '(555) 123-4567',
          cellPhone: '(555) 123-4567',
          dateOfBirth: new Date('1985-06-15'),
          ssn: encryptSSN('123-45-6789'),
          maritalStatus: 'married',
          dependents: 2,
          dependentAges: '8, 12',
          citizenshipType: 'us_citizen',
          creditScore: 750,
        },
        currentAddress: {
          street: '123 Main Street',
          unit: 'Apt 4B',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          residencyType: 'rent',
          monthlyPayment: 2500,
          yearsAtAddress: 3,
        },
        employment: {
          employmentStatus: 'employed',
          employerName: 'Tech Solutions Inc.',
          position: 'Software Engineer',
          phone: '(555) 987-6543',
          street: '456 Business Blvd',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90002',
          yearsInLineOfWork: 8,
          baseIncome: 8000,
          overtime: 500,
          bonus: 1000,
          monthlyIncome: 9500,
        },
        financialInfo: {
          grossMonthlyIncome: 9500,
          otherIncome: 0,
          checkingAccountBalance: 15000,
          savingsAccountBalance: 45000,
          totalAssets: 60000,
          totalLiabilities: 750,
        },
        propertyInfo: {
          loanAmount: 450000,
          loanPurpose: 'purchase',
          propertyAddress: '789 Dream Home Lane',
          propertyCity: 'Los Angeles',
          propertyState: 'CA',
          propertyZipCode: '90001',
          propertyType: 'single_family',
          propertyValue: 550000,
          purchasePrice: 550000,
          appraisedValue: 550000,
          occupancyType: 'primary_residence',
          downPaymentAmount: 100000,
          downPaymentPercentage: 18.18,
        },
        assets: {
          bankAccounts: [
            {
              accountType: 'Checking',
              financialInstitution: 'Chase Bank',
              cashOrMarketValue: 15000,
            },
            {
              accountType: 'Savings',
              financialInstitution: 'Chase Bank',
              cashOrMarketValue: 45000,
            },
          ],
        },
        liabilities: {
          items: [
            {
              liabilityType: 'Credit Card',
              creditorName: 'Chase',
              monthlyPayment: 300,
              unpaidBalance: 5000,
            },
            {
              liabilityType: 'Auto Loan',
              creditorName: 'Toyota Financial',
              monthlyPayment: 450,
              unpaidBalance: 12000,
            },
          ],
        },
        declarations: {
          willOccupyAsProperty: true,
          ownershipInterestInLast3Years: false,
          borrowingDownPayment: false,
          applyingForNewCredit: false,
          propertySubjectToLien: false,
          cosignerOrGuarantor: false,
          outstandingJudgments: false,
          federalDebtDelinquent: false,
          lawsuitParty: false,
          conveyedTitleInLieu: false,
          completedPreForeclosureSale: false,
          propertyForeclosed: false,
          declaredBankruptcy: false,
          bankruptcyWithin7Years: false,
          loanOnProperty: false,
          coMakerOnNote: false,
          usCitizen: true,
          permanentResident: false,
          primaryResidence: true,
          intendToOccupy: true,
        },
        documents: [
          {
            name: 'Government ID - Driver License.pdf',
            size: 245678,
            type: 'application/pdf',
            uploadedAt: new Date(),
            url: '', // Will be set after application is created
          },
          {
            name: 'Pay Stub - January 2025.pdf',
            size: 189234,
            type: 'application/pdf',
            uploadedAt: new Date(),
            url: '', // Will be set after application is created
          },
          {
            name: 'Pay Stub - February 2025.pdf',
            size: 192456,
            type: 'application/pdf',
            uploadedAt: new Date(),
            url: '', // Will be set after application is created
          },
        ],
        statusHistory: [
          {
            status: 'submitted',
            changedBy: customerUser._id.toString(),
            changedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            notes: 'Application submitted by customer',
          },
          {
            status: 'under_review',
            changedBy: employeeUser?._id.toString() || customerUser._id.toString(),
            changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            notes: 'Application assigned for review',
          },
        ],
        submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        assignedTo: employeeUser?._id.toString(),
        assignedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        decision: 'pending',
      },
      {
        userId: customerUser._id.toString(),
        status: 'approved',
        borrowerInfo: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'customer@loanaticks.com',
          phone: '(555) 234-5678',
          cellPhone: '(555) 234-5678',
          dateOfBirth: new Date('1990-03-22'),
          ssn: encryptSSN('234-56-7890'),
          maritalStatus: 'unmarried',
          dependents: 0,
          citizenshipType: 'us_citizen',
          creditScore: 780,
        },
        currentAddress: {
          street: '456 Oak Avenue',
          city: 'San Diego',
          state: 'CA',
          zipCode: '92101',
          residencyType: 'own',
          monthlyPayment: 3200,
          yearsAtAddress: 5,
        },
        employment: {
          employmentStatus: 'employed',
          employerName: 'Financial Services Group',
          position: 'Senior Accountant',
          phone: '(555) 876-5432',
          city: 'San Diego',
          state: 'CA',
          zipCode: '92101',
          yearsInLineOfWork: 6,
          baseIncome: 7200,
          bonus: 1500,
          monthlyIncome: 8700,
        },
        financialInfo: {
          grossMonthlyIncome: 8700,
          otherIncome: 0,
          checkingAccountBalance: 25000,
          savingsAccountBalance: 75000,
          totalAssets: 100000,
          totalLiabilities: 250,
        },
        propertyInfo: {
          loanAmount: 235000,
          loanPurpose: 'purchase',
          propertyAddress: '123 Beachfront Drive',
          propertyCity: 'San Diego',
          propertyState: 'CA',
          propertyZipCode: '92101',
          propertyType: 'single_family',
          propertyValue: 295000,
          purchasePrice: 295000,
          appraisedValue: 295000,
          occupancyType: 'primary_residence',
          downPaymentAmount: 60000,
          downPaymentPercentage: 20.34,
        },
        assets: {
          bankAccounts: [
            {
              accountType: 'Checking',
              financialInstitution: 'Wells Fargo',
              cashOrMarketValue: 25000,
            },
            {
              accountType: 'Savings',
              financialInstitution: 'Wells Fargo',
              cashOrMarketValue: 75000,
            },
          ],
        },
        liabilities: {
          items: [
            {
              liabilityType: 'Student Loan',
              creditorName: 'Federal Student Aid',
              monthlyPayment: 250,
              unpaidBalance: 15000,
            },
          ],
        },
        declarations: {
          willOccupyAsProperty: true,
          ownershipInterestInLast3Years: false,
          borrowingDownPayment: false,
          applyingForNewCredit: false,
          propertySubjectToLien: false,
          cosignerOrGuarantor: false,
          outstandingJudgments: false,
          federalDebtDelinquent: false,
          lawsuitParty: false,
          conveyedTitleInLieu: false,
          completedPreForeclosureSale: false,
          propertyForeclosed: false,
          declaredBankruptcy: false,
          bankruptcyWithin7Years: false,
          loanOnProperty: false,
          coMakerOnNote: false,
          usCitizen: true,
          permanentResident: false,
          primaryResidence: true,
          intendToOccupy: true,
        },
        documents: [
          {
            name: 'ID - Passport.pdf',
            size: 198765,
            type: 'application/pdf',
            uploadedAt: new Date(),
            url: '', // Will be set after application is created
          },
          {
            name: 'Pay Stubs - Q1 2025.pdf',
            size: 345678,
            type: 'application/pdf',
            uploadedAt: new Date(),
            url: '', // Will be set after application is created
          },
        ],
        statusHistory: [
          {
            status: 'submitted',
            changedBy: customerUser._id.toString(),
            changedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
            notes: 'Application submitted',
          },
          {
            status: 'under_review',
            changedBy: employeeUser?._id.toString() || customerUser._id.toString(),
            changedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
            notes: 'Under review by loan officer',
          },
          {
            status: 'approved',
            changedBy: employeeUser?._id.toString() || customerUser._id.toString(),
            changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            notes: 'Application approved! Congratulations!',
          },
        ],
        submittedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        reviewedBy: employeeUser?._id.toString(),
        reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        decision: 'approved',
        decisionNotes: 'Excellent credit score and stable employment. Approved for 15-year fixed mortgage.',
      },
      {
        userId: customerUser._id.toString(),
        status: 'under_review',
        borrowerInfo: {
          firstName: 'Michael',
          middleName: 'David',
          lastName: 'Williams',
          email: 'customer@loanaticks.com',
          phone: '(555) 345-6789',
          cellPhone: '(555) 345-6789',
          dateOfBirth: new Date('1988-11-08'),
          ssn: encryptSSN('345-67-8901'),
          maritalStatus: 'married',
          dependents: 1,
          dependentAges: '5',
          citizenshipType: 'us_citizen',
          creditScore: 720,
        },
        currentAddress: {
          street: '789 Pine Road',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          residencyType: 'rent',
          monthlyPayment: 3800,
          yearsAtAddress: 2,
        },
        employment: {
          employmentStatus: 'employed',
          employerName: 'Innovation Labs',
          position: 'Product Manager',
          phone: '(555) 765-4321',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          yearsInLineOfWork: 4,
          baseIncome: 9500,
          commission: 2000,
          monthlyIncome: 11500,
        },
        financialInfo: {
          grossMonthlyIncome: 11500,
          otherIncome: 0,
          checkingAccountBalance: 30000,
          savingsAccountBalance: 85000,
          totalAssets: 115000,
          totalLiabilities: 880,
        },
        propertyInfo: {
          loanAmount: 325000,
          loanPurpose: 'purchase',
          propertyAddress: '456 Hillside View',
          propertyCity: 'San Francisco',
          propertyState: 'CA',
          propertyZipCode: '94102',
          propertyType: 'condo',
          propertyValue: 410000,
          purchasePrice: 410000,
          appraisedValue: 410000,
          occupancyType: 'primary_residence',
          downPaymentAmount: 85000,
          downPaymentPercentage: 20.73,
        },
        assets: {
          bankAccounts: [
            {
              accountType: 'Checking',
              financialInstitution: 'Bank of America',
              cashOrMarketValue: 30000,
            },
            {
              accountType: 'Savings',
              financialInstitution: 'Bank of America',
              cashOrMarketValue: 85000,
            },
          ],
        },
        liabilities: {
          items: [
            {
              liabilityType: 'Credit Card',
              creditorName: 'American Express',
              monthlyPayment: 500,
              unpaidBalance: 8000,
            },
            {
              liabilityType: 'Auto Loan',
              creditorName: 'Honda Financial',
              monthlyPayment: 380,
              unpaidBalance: 15000,
            },
          ],
        },
        declarations: {
          willOccupyAsProperty: true,
          ownershipInterestInLast3Years: false,
          borrowingDownPayment: false,
          applyingForNewCredit: false,
          propertySubjectToLien: false,
          cosignerOrGuarantor: false,
          outstandingJudgments: false,
          federalDebtDelinquent: false,
          lawsuitParty: false,
          conveyedTitleInLieu: false,
          completedPreForeclosureSale: false,
          propertyForeclosed: false,
          declaredBankruptcy: false,
          bankruptcyWithin7Years: false,
          loanOnProperty: false,
          coMakerOnNote: false,
          usCitizen: true,
          permanentResident: false,
          primaryResidence: true,
          intendToOccupy: true,
        },
        documents: [
          {
            name: 'Driver License.pdf',
            size: 223456,
            type: 'application/pdf',
            uploadedAt: new Date(),
            url: '', // Will be set after application is created
          },
          {
            name: 'Recent Pay Stubs.pdf',
            size: 412345,
            type: 'application/pdf',
            uploadedAt: new Date(),
            url: '', // Will be set after application is created
          },
        ],
        statusHistory: [
          {
            status: 'submitted',
            changedBy: customerUser._id.toString(),
            changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            notes: 'Application submitted',
          },
          {
            status: 'under_review',
            changedBy: employeeUser?._id.toString() || customerUser._id.toString(),
            changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            notes: 'Currently reviewing application documents',
          },
        ],
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        assignedTo: employeeUser?._id.toString(),
        assignedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        decision: 'pending',
      },
    ];

    for (let i = 0; i < testApplications.length; i++) {
      const appData = testApplications[i];
      
      // Create application without documents first
      const { documents, ...appDataWithoutDocs } = appData;
      const application = new LoanApplication(appDataWithoutDocs);
      await application.save();
      
      const appId = application._id.toString();
      
      // Create actual document files for this application
      if (documents && documents.length > 0) {
        console.log(`\n  📄 Creating documents for application ${i + 1}...`);
        const createdFiles = await createApplicationDocuments(
          appId,
          documents.map((d: any) => ({ name: d.name, type: d.type }))
        );
        
          // Update application with document metadata using native MongoDB driver
          if (createdFiles.length > 0) {
            // Build document metadata array
            const documentMetadata = documents.map((doc: any, index: number) => {
              const file = createdFiles[index];
              // Use exact schema structure: name, size, type, uploadedAt, url
              return {
                name: String(doc.name),
                size: Number(doc.size),
                type: String(doc.type),
                uploadedAt: doc.uploadedAt || new Date(),
                url: String(`/api/secure-document?applicationId=${appId}&fileName=${file.storedName}`),
              };
            });
            
            // Use native MongoDB driver to bypass Mongoose casting issues
            try {
              const ObjectId = mongoose.Types.ObjectId;
              await LoanApplication.collection.updateOne(
                { _id: new ObjectId(appId) },
                { $push: { documents: { $each: documentMetadata } } } as any
              );
              console.log(`  ✓ Added ${createdFiles.length} document(s) to application`);
            } catch (err) {
              console.log(`  ⚠ Could not add documents: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
          }
      }
      
      console.log(`✓ Created application ${i + 1}: ${appData.borrowerInfo.firstName} ${appData.borrowerInfo.lastName} - ${appData.status}`);
    }

    console.log('\n✅ Test data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${createdUsers.length} users created`);
    console.log(`   - ${testApplications.length} loan applications created`);
    console.log(`   - Test documents available in public/test-documents/`);
    console.log('\n🔑 Login Credentials:');
    console.log('========================');
    demoUsers.forEach((user) => {
      console.log(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding test data:', error);
    process.exit(1);
  }
}

seedTestData();
