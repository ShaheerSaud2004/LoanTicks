// Test login functionality
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const User = require('../models/User.ts').default;
const bcrypt = require('bcryptjs');

async function testLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    const testUsers = [
      { email: 'admin@loanaticks.com', password: 'admin123' },
      { email: 'employee@loanaticks.com', password: 'employee123' },
      { email: 'customer@loanaticks.com', password: 'customer123' },
    ];

    console.log('Testing login credentials:\n');
    
    for (const test of testUsers) {
      const user = await User.findOne({ email: test.email.toLowerCase() });
      
      if (!user) {
        console.log(`❌ ${test.email}: USER NOT FOUND`);
        continue;
      }

      const isValid = await bcrypt.compare(test.password, user.password);
      
      if (isValid) {
        console.log(`✅ ${test.email}: VALID (Role: ${user.role})`);
      } else {
        console.log(`❌ ${test.email}: INVALID PASSWORD`);
      }
    }

    await mongoose.disconnect();
    console.log('\n✓ Test complete');
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
}

testLogin();
