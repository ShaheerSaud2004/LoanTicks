import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    // Test MongoDB connection
    await connectDB();
    
    // Test a simple query
    const userCount = await User.countDocuments();
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful!',
      userCount: userCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'MongoDB connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
