#!/usr/bin/env node

/**
 * Database Cleanup Script
 * 
 * This script cleans up all test/demo data from the database.
 * Run with: node scripts/cleanup-db.js
 * 
 * Or use the API endpoint: POST /api/cleanup-database
 */

const fetch = require('node-fetch');

async function cleanupDatabase() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api/cleanup-database`;

  try {
    console.log('🧹 Starting database cleanup...');
    console.log(`📡 Calling: ${url}\n`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Database cleaned successfully!\n');
      console.log('Deleted:');
      console.log(`  - Users: ${data.deleted.users}`);
      console.log(`  - Applications: ${data.deleted.applications}`);
      console.log('\n✨ Database is now clean and ready for your test data!');
    } else {
      console.error('❌ Error cleaning database:', data.error);
      if (data.details) {
        console.error('Details:', data.details);
      }
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Failed to connect to server:', error.message);
    console.error('\n💡 Make sure the dev server is running: npm run dev');
    process.exit(1);
  }
}

cleanupDatabase();
