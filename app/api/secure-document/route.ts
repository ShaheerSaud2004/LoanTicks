import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import LoanApplication from '@/models/LoanApplication';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { logDataAccess } from '@/lib/auditLogger';
import { apiRateLimiter } from '@/lib/rateLimiter';

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
    const fileName = searchParams.get('fileName');

    if (!applicationId || !fileName) {
      return NextResponse.json(
        { error: 'Application ID and file name are required' },
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
    // The fileName parameter should match the storedName (timestamp_originalname format)
    // or we can match by checking if the URL contains the fileName
    const document = application.documents?.find(
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
            // Use the request URL as base if doc.url is relative
            const baseUrl = request.nextUrl.origin || process.env.NEXTAUTH_URL || 'https://loanticks.vercel.app';
            const urlParams = new URL(doc.url, baseUrl);
            const urlFileName = urlParams.searchParams.get('fileName');
            if (urlFileName === fileName) {
              return true;
            }
          } catch (e) {
            // If URL parsing fails, try direct string match
            if (doc.url.includes(fileName)) {
              return true;
            }
          }
        }
        return false;
      }
    );

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
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

    // Read file from PRIVATE storage location (not accessible via web URL)
    // NOTE: In production (Vercel/serverless), filesystem is ephemeral.
    // For production, use cloud storage (Vercel Blob, S3, Cloudinary, etc.)
    const filePath = join(process.cwd(), 'private', 'uploads', applicationId, fileName);

    try {
      const fileBuffer = await readFile(filePath);
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      
      // Determine content type
      let contentType = 'application/octet-stream';
      if (fileExtension === 'pdf') contentType = 'application/pdf';
      else if (fileExtension === 'jpg' || fileExtension === 'jpeg') contentType = 'image/jpeg';
      else if (fileExtension === 'png') contentType = 'image/png';

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
      console.error('Error reading file:', fileError);
      
      // Check if this is a production environment issue
      const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
      
      if (isProduction) {
        return NextResponse.json(
          { 
            error: 'Document storage not configured for production. Please configure cloud storage (Vercel Blob, S3, or Cloudinary).',
            details: 'The filesystem is ephemeral in serverless environments. Documents must be stored in cloud storage.',
            fileName: document.name,
            applicationId
          },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'File not found or cannot be accessed',
          details: fileError instanceof Error ? fileError.message : 'Unknown error',
          fileName: document.name,
          filePath
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
