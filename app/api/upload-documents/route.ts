import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import LoanApplication from '@/models/LoanApplication';
import { logDataAccess } from '@/lib/auditLogger';
import { apiRateLimiter } from '@/lib/rateLimiter';
import { uploadFileToGridFS } from '@/lib/gridfs';

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await apiRateLimiter(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

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

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
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

    // Process uploaded files and store in MongoDB GridFS
    const uploadedFiles = [];
    
    for (const file of files) {
      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds 10MB size limit` },
          { status: 400 }
        );
      }

      // Validate file type - check both MIME type and file extension
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        return NextResponse.json(
          { error: `File ${file.name} has invalid type. Only PDF, JPG, and PNG are allowed.` },
          { status: 400 }
        );
      }

      // Convert File to Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename to avoid conflicts
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFileName = `${timestamp}_${sanitizedName}`;

      // Upload to MongoDB GridFS
      const gridFSFileId = await uploadFileToGridFS(buffer, uniqueFileName, {
        applicationId,
        originalName: file.name,
        uploadedBy: session.user.id,
        uploadedAt: new Date().toISOString(),
      });

      const fileData = {
        name: file.name,
        originalName: file.name,
        storedName: uniqueFileName,
        gridFSFileId, // Store GridFS file ID for retrieval
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        url: `/api/secure-document?applicationId=${applicationId}&fileId=${gridFSFileId}`,
      };
      
      uploadedFiles.push(fileData);
    }

    // Merge with existing documents (don't overwrite)
    const existingDocs = application.documents || [];
    const allDocuments = [...existingDocs, ...uploadedFiles];
    
    // Update application with document information
    application.documents = allDocuments;
    await application.save();
    
    // Log document upload
    await logDataAccess({
      userId: session.user.id,
      userRole: session.user.role,
      resource: 'loan_application_documents',
      resourceId: applicationId,
      action: 'create',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      details: {
        fileCount: uploadedFiles.length,
        fileNames: uploadedFiles.map(f => f.name),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${uploadedFiles.length} document(s) to MongoDB`,
      documents: uploadedFiles.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
        uploadedAt: f.uploadedAt,
        url: f.url,
      })),
      totalDocuments: allDocuments.length,
    });
  } catch (error) {
    console.error('Error uploading documents:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload documents',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

