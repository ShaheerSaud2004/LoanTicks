import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

import User from '../models/User';
import connectDB from '../lib/mongodb';

// Passwords must meet User model: 12+ chars, upper, lower, number, special (@$!%*?&)
const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin@loanaticks.com',
    password: 'Admin123!@#$',
    role: 'admin',
    phone: '+1-555-0101',
  },
  {
    name: 'Employee User',
    email: 'employee@loanaticks.com',
    password: 'Employee123!@#',
    role: 'employee',
    phone: '+1-555-0102',
  },
  {
    name: 'Customer User',
    email: 'customer@loanaticks.com',
    password: 'fo',
    role: 'customer',
    phone: '+1-555-0103',
  },
];

async function seedDatabase() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create demo users
    for (const userData of demoUsers) {
      const user = new User({
        ...userData,
        isApproved: true, // Auto-approve demo accounts
        provider: 'credentials',
      });
      await user.save();
      console.log(`✓ Created ${userData.role}: ${userData.email}`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\nDemo Login Credentials:');
    console.log('========================');
    demoUsers.forEach((user) => {
      console.log(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

