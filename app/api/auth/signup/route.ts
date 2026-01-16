import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sanitizeObject } from '@/lib/inputSanitizer';
import { applicationRateLimiter } from '@/lib/rateLimiter';

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await applicationRateLimiter(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    await connectDB();

    const body = await request.json();
    const { name, email, password, phone } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Sanitize input
    const sanitizedData = sanitizeObject({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone?.trim(),
    });

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(sanitizedData.email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: sanitizedData.email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Validate password complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    if (!passwordRegex.test(sanitizedData.password)) {
      return NextResponse.json(
        { 
          error: 'Password must be at least 12 characters and contain uppercase, lowercase, number, and special character (@$!%*?&)' 
        },
        { status: 400 }
      );
    }

    // Create new user (pending approval)
    const newUser = new User({
      name: sanitizedData.name,
      email: sanitizedData.email,
      password: sanitizedData.password, // Will be hashed by pre-save hook
      phone: sanitizedData.phone,
      role: 'customer',
      provider: 'credentials',
      isApproved: false, // Requires admin approval
    });

    await newUser.save();

    return NextResponse.json(
      { 
        success: true,
        message: 'Account created successfully! Your account is pending admin approval. You will be notified once approved.',
        userId: newUser._id.toString()
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Sign-up error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: messages.join(', ') },
        { status: 400 }
      );
    }

    // Handle duplicate email
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
