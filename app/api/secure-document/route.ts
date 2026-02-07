import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import LoanApplication from '@/models/LoanApplication';
import { logDataAccess } from '@/lib/auditLogger';
import { apiRateLimiter } from '@/lib/rateLimiter';
import { downloadFileFromGridFS, getFileMetadata } from '@/lib/gridfs';

/**
 * Secure document serving endpoint
 * Replaces public file access with authenticated access
 */
export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await apiRateLimiter(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');
    const fileId = searchParams.get('fileId'); // GridFS file ID (preferred)
    const fileName = searchParams.get('fileName'); // Fallback for legacy support

    if (!applicationId || (!fileId && !fileName)) {
      return NextResponse.json(
        { error: 'Application ID and file ID (or file name) are required' },
        { status: 400 }
      );
    }

    // Find the application
    const application = await LoanApplication.findById(applicationId);

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check permissions
    const isOwner = application.userId === session.user.id;
    const isEmployee = session.user.role === 'employee' || session.user.role === 'admin';
    const isAdmin = session.user.role === 'admin';

    if (!isOwner && !isEmployee && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Find the document in the application
    let document: any = null;
    
    if (fileId) {
      // New method: Find by GridFS file ID
      document = application.documents?.find(
        (doc: any) => doc.gridFSFileId === fileId
      );
    } else if (fileName) {
      // Legacy method: Find by fileName (for backward compatibility)
      document = application.documents?.find(
        (doc: any) => {
          // Match by storedName if it exists
          if (doc.storedName && doc.storedName === fileName) {
            return true;
          }
          // Match by checking if URL contains the fileName
          if (doc.url && doc.url.includes(fileName)) {
            return true;
          }
          // Match by name (original filename)
          if (doc.name === fileName) {
            return true;
          }
          // Extract filename from URL and match
          if (doc.url) {
            try {
              const baseUrl = request.nextUrl.origin || process.env.NEXTAUTH_URL || 'https://loanticks.vercel.app';
              const urlParams = new URL(doc.url, baseUrl);
              const urlFileName = urlParams.searchParams.get('fileName');
              if (urlFileName === fileName) {
                return true;
              }
            } catch {
              if (doc.url.includes(fileName)) {
                return true;
              }
            }
          }
          return false;
        }
      );
    }

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Get the GridFS file ID (prefer new method, fallback to legacy)
    const gridFSFileId = document.gridFSFileId;
    
    if (!gridFSFileId) {
      // Legacy: Try to read from filesystem (for backward compatibility)
      // This will fail in production but allows existing documents to work locally
      const filePath = require('path').join(process.cwd(), 'private', 'uploads', applicationId, fileName || document.storedName || '');
      try {
        const { readFile } = require('fs/promises');
        const fileBuffer = await readFile(filePath);
        const fileExtension = (fileName || document.name || '').split('.').pop()?.toLowerCase();
        
        let contentType = 'application/octet-stream';
        if (fileExtension === 'pdf') contentType = 'application/pdf';
        else if (fileExtension === 'jpg' || fileExtension === 'jpeg') contentType = 'image/jpeg';
        else if (fileExtension === 'png') contentType = 'image/png';

        return new NextResponse(new Uint8Array(fileBuffer), {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `inline; filename="${document.name}"`,
            'Cache-Control': 'private, no-cache, no-store, must-revalidate',
            'X-Content-Type-Options': 'nosniff',
          },
        });
      } catch {
        return NextResponse.json(
          { 
            error: 'Document not found in storage. This document may need to be re-uploaded.',
            details: 'Legacy filesystem storage is not available. Please re-upload the document.',
          },
          { status: 404 }
        );
      }
    }

    // Log document access
    await logDataAccess({
      userId: session.user.id,
      userRole: session.user.role,
      resource: 'loan_application_document',
      resourceId: applicationId,
      action: 'view',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      details: {
        fileName: document.name,
        fileType: document.type,
      },
    });

    // Read file from MongoDB GridFS
    try {
      const fileBuffer = await downloadFileFromGridFS(gridFSFileId);
      const fileMetadata = await getFileMetadata(gridFSFileId);
      
      // Determine content type from metadata or file extension
      let contentType = fileMetadata.contentType || 'application/octet-stream';
      const fileExtension = (document.name || fileMetadata.filename || '').split('.').pop()?.toLowerCase();
      
      if (!contentType || contentType === 'application/octet-stream') {
        if (fileExtension === 'pdf') contentType = 'application/pdf';
        else if (fileExtension === 'jpg' || fileExtension === 'jpeg') contentType = 'image/jpeg';
        else if (fileExtension === 'png') contentType = 'image/png';
      }

      // Return file with appropriate headers
      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="${document.name}"`,
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    } catch (fileError) {
      console.error('Error reading file from GridFS:', fileError);
      
      return NextResponse.json(
        { 
          error: 'File not found or cannot be accessed from MongoDB',
          details: fileError instanceof Error ? fileError.message : 'Unknown error',
          fileName: document.name,
          gridFSFileId
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error serving document:', error);
    return NextResponse.json(
      { error: 'Failed to serve document' },
      { status: 500 }
    );
  }
}
