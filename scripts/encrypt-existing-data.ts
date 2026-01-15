/**
 * Migration script to encrypt existing sensitive data
 * Run this once to encrypt existing SSNs and account numbers in the database
 * 
 * Usage: tsx scripts/encrypt-existing-data.ts
 */

import connectDB from '../lib/mongodb';
import LoanApplication from '../models/LoanApplication';
import { encryptSensitiveData } from '../lib/encryption';

async function encryptExistingData() {
  try {
    console.log('🔒 Starting data encryption migration...');
    
    // Check if encryption key is set
    if (!process.env.ENCRYPTION_KEY) {
      console.error('❌ ERROR: ENCRYPTION_KEY environment variable is not set!');
      console.error('   Please add ENCRYPTION_KEY to your .env.local file');
      process.exit(1);
    }
    
    await connectDB();
    console.log('✓ Connected to database');
    
    // Find all loan applications
    const applications = await LoanApplication.find({});
    console.log(`✓ Found ${applications.length} loan applications`);
    
    let encryptedCount = 0;
    let errorCount = 0;
    
    for (const app of applications) {
      try {
        let needsUpdate = false;
        
        // Encrypt SSN if it exists and is not already encrypted
        if (app.borrowerInfo?.ssn) {
          const ssn = app.borrowerInfo.ssn;
          // Check if already encrypted (encrypted format: iv:tag:encrypted)
          if (!ssn.includes(':')) {
            // Not encrypted, encrypt it
            app.borrowerInfo.ssn = encryptSensitiveData(ssn);
            needsUpdate = true;
            console.log(`  ✓ Encrypted SSN for application ${app._id}`);
          }
        }
        
        // Encrypt bank account numbers
        if (app.assets?.bankAccounts) {
          for (const account of app.assets.bankAccounts) {
            if (account.accountNumber && !account.accountNumber.includes(':')) {
              account.accountNumber = encryptSensitiveData(account.accountNumber);
              needsUpdate = true;
            }
          }
        }
        
        // Encrypt liability account numbers
        if (app.liabilities?.items) {
          for (const item of app.liabilities.items) {
            if (item.accountNumber && !item.accountNumber.includes(':')) {
              item.accountNumber = encryptSensitiveData(item.accountNumber);
              needsUpdate = true;
            }
          }
        }
        
        if (needsUpdate) {
          await app.save();
          encryptedCount++;
        }
      } catch (error) {
        console.error(`  ❌ Error encrypting application ${app._id}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n✅ Encryption migration complete!');
    console.log(`   • Encrypted: ${encryptedCount} applications`);
    console.log(`   • Errors: ${errorCount} applications`);
    console.log(`   • Total: ${applications.length} applications`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
encryptExistingData();
