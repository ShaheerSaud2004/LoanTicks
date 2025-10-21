import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import LoanApplication from '@/models/LoanApplication';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const formData = await request.formData();
    const applicationId = formData.get('applicationId') as string;
    const files = formData.getAll('files') as File[];

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    // Find the application
    const application = await LoanApplication.findById(applicationId);
    
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check if user owns this application
    if (application.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Process uploaded files
    const uploadedFiles = [];
    
    for (const file of files) {
      // In a real application, you would upload to cloud storage (AWS S3, etc.)
      // For now, we'll store file metadata
      const fileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        // In production, you would store the file URL/path here
        url: `/uploads/${applicationId}/${file.name}`,
      };
      
      uploadedFiles.push(fileData);
    }

    // Update application with document information
    application.documents = uploadedFiles;
    await application.save();

    return NextResponse.json({
      success: true,
      message: 'Documents uploaded successfully',
      documents: uploadedFiles,
    });
  } catch (error) {
    console.error('Error uploading documents:', error);
    return NextResponse.json(
      { error: 'Failed to upload documents' },
      { status: 500 }
    );
  }
}

