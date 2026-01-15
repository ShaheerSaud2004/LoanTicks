import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Waitlist from '@/models/Waitlist';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await Waitlist.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'This email is already on the waitlist' },
        { status: 400 }
      );
    }

    // Create new waitlist entry
    const waitlistEntry = new Waitlist({
      email: email.toLowerCase().trim(),
    });

    await waitlistEntry.save();

    return NextResponse.json(
      { success: true, message: 'Successfully joined the waitlist!' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Waitlist signup error:', error);
    
    // Handle duplicate key error (MongoDB unique constraint)
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'This email is already on the waitlist' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to join waitlist. Please try again.' },
      { status: 500 }
    );
  }
}


