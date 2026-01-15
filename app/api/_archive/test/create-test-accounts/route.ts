import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    await connectDB();

    // Test accounts to create
    const testAccounts = [
      // Admin Account
      {
        name: 'Admin User',
        email: 'admin@loanticks.com',
        password: 'admin123',
        role: 'admin'
      },
      // Customer Accounts
      {
        name: 'John Customer',
        email: 'customer1@test.com',
        password: 'customer123',
        role: 'customer'
      },
      {
        name: 'Jane Smith',
        email: 'customer2@test.com',
        password: 'customer123',
        role: 'customer'
      },
      // Employee Accounts
      {
        name: 'Mike Employee',
        email: 'employee1@loanticks.com',
        password: 'employee123',
        role: 'employee'
      },
      {
        name: 'Sarah Johnson',
        email: 'employee2@loanticks.com',
        password: 'employee123',
        role: 'employee'
      },
      {
        name: 'David Supervisor',
        email: 'supervisor@loanticks.com',
        password: 'supervisor123',
        role: 'employee'
      }
    ];

    const createdAccounts = [];
    const existingAccounts = [];

    for (const accountData of testAccounts) {
      let user = await User.findOne({ email: accountData.email });
      if (user) {
        existingAccounts.push({
          email: accountData.email,
          role: accountData.role,
          password: accountData.password,
          status: 'Already exists'
        });
      } else {
        const hashedPassword = await bcrypt.hash(accountData.password, 12);
        user = new User({
          name: accountData.name,
          email: accountData.email,
          password: hashedPassword,
          role: accountData.role
        });
        await user.save();
        
        createdAccounts.push({
          email: accountData.email,
          role: accountData.role,
          password: accountData.password,
          status: 'Created'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Test accounts processed successfully',
      data: {
        created: createdAccounts,
        existing: existingAccounts,
        total: testAccounts.length
      },
      testCredentials: {
        admin: {
          email: 'admin@loanticks.com',
          password: 'admin123',
          role: 'admin'
        },
        customers: [
          {
            email: 'customer1@test.com',
            password: 'customer123',
            role: 'customer'
          },
          {
            email: 'customer2@test.com',
            password: 'customer123',
            role: 'customer'
          }
        ],
        employees: [
          {
            email: 'employee1@loanticks.com',
            password: 'employee123',
            role: 'employee'
          },
          {
            email: 'employee2@loanticks.com',
            password: 'employee123',
            role: 'senior_employee'
          },
          {
            email: 'supervisor@loanticks.com',
            password: 'supervisor123',
            role: 'supervisor'
          }
        ]
      },
      instructions: {
        login: 'Use the credentials above to test different user roles',
        testing: [
          '1. Login as customer to submit loan applications',
          '2. Login as employee to review and process applications',
          '3. Login as admin to manage employees and view all data',
          '4. Test the complete workflow from application to approval'
        ]
      }
    });

  } catch (error) {
    console.error('Error creating test accounts:', error);
    return NextResponse.json({ 
      error: 'Failed to create test accounts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
