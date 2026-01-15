import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import LoanApplication from '@/models/LoanApplication';
import { applicationRateLimiter } from '@/lib/rateLimiter';
import { encryptSensitiveData, maskSSN, decryptSensitiveData, maskAccountNumber } from '@/lib/encryption';
import { sanitizeObject, sanitizeSSN, validateSSN } from '@/lib/inputSanitizer';
import { logDataAccess, logSensitiveDataAccess } from '@/lib/auditLogger';

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await applicationRateLimiter(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const session = await auth();

    if (!session || session.user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    
    // Sanitize all input data
    const sanitizedData = sanitizeObject(data);
    
    // Validate and sanitize SSN
    if (sanitizedData.borrowerInfo?.ssn) {
      if (!validateSSN(sanitizedData.borrowerInfo.ssn)) {
        return NextResponse.json(
          { error: 'Invalid SSN format. Please use format XXX-XX-XXXX' },
          { status: 400 }
        );
      }
      sanitizedData.borrowerInfo.ssn = sanitizeSSN(sanitizedData.borrowerInfo.ssn);
      // Encrypt SSN before storing
      sanitizedData.borrowerInfo.ssn = encryptSensitiveData(sanitizedData.borrowerInfo.ssn);
    }
    
    // Encrypt other sensitive fields
    if (sanitizedData.assets?.bankAccounts) {
      sanitizedData.assets.bankAccounts = sanitizedData.assets.bankAccounts.map((account: any) => {
        if (account.accountNumber) {
          account.accountNumber = encryptSensitiveData(account.accountNumber);
        }
        return account;
      });
    }
    
    if (sanitizedData.liabilities?.items) {
      sanitizedData.liabilities.items = sanitizedData.liabilities.items.map((item: any) => {
        if (item.accountNumber) {
          item.accountNumber = encryptSensitiveData(item.accountNumber);
        }
        return item;
      });
    }

    const loanApplication = new LoanApplication({
      ...sanitizedData,
      userId: session.user.id,
    });

    await loanApplication.save();
    
    // Log data creation
    await logDataAccess({
      userId: session.user.id,
      userRole: session.user.role,
      resource: 'loan_application',
      resourceId: loanApplication._id.toString(),
      action: 'create',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      applicationId: loanApplication._id,
      message: 'Loan application saved successfully',
    });
  } catch (error) {
    // Log error details for debugging
    console.error('Error saving loan application:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to save loan application';
    if (error instanceof Error) {
      // Check for validation errors
      if (error.message.includes('validation') || error.message.includes('required')) {
        errorMessage = `Validation error: ${error.message}`;
      } else if (error.message.includes('Cast')) {
        errorMessage = 'Invalid data format. Please check all required fields are filled correctly.';
      } else {
        errorMessage = error.message;
      }
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error details:', error);
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('id');

    if (applicationId) {
      // Get specific application
      const application = await LoanApplication.findById(applicationId).lean();
      
      if (!application) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }

      // Convert ObjectId to string for comparison
      const appUserId = application.userId?.toString() || application.userId;
      
      // Check permission
      if (
        session.user.role === 'customer' &&
        appUserId !== session.user.id
      ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Log data access
      await logDataAccess({
        userId: session.user.id,
        userRole: session.user.role,
        resource: 'loan_application',
        resourceId: application._id.toString(),
        action: 'view',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      });
      
      // Log sensitive data access
      await logSensitiveDataAccess({
        userId: session.user.id,
        userRole: session.user.role,
        resource: 'loan_application',
        resourceId: application._id.toString(),
        dataType: 'financial',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      });

      // Prepare response with masked sensitive data
      const responseData: any = {
        ...application,
        _id: application._id.toString(),
        userId: appUserId,
        createdAt: application.createdAt?.toISOString(),
        updatedAt: application.updatedAt?.toISOString(),
        submittedAt: application.submittedAt?.toISOString(),
        reviewedAt: application.reviewedAt?.toISOString(),
        assignedAt: application.assignedAt?.toISOString()
      };
      
      // Mask SSN in response (only show last 4 digits)
      if (responseData.borrowerInfo?.ssn) {
        try {
          // Try to decrypt first (if encrypted)
          try {
            const decrypted = decryptSensitiveData(responseData.borrowerInfo.ssn);
            responseData.borrowerInfo.ssn = maskSSN(decrypted);
          } catch {
            // If decryption fails, might be plain text (legacy data)
            responseData.borrowerInfo.ssn = maskSSN(responseData.borrowerInfo.ssn);
          }
        } catch {
          // If encryption module fails, just mask the value
          responseData.borrowerInfo.ssn = maskSSN(responseData.borrowerInfo.ssn);
        }
      }
      
      // Mask account numbers
      if (responseData.assets?.bankAccounts) {
        responseData.assets.bankAccounts = responseData.assets.bankAccounts.map((account: any) => {
          if (account.accountNumber) {
            try {
              const decrypted = decryptSensitiveData(account.accountNumber);
              account.accountNumber = maskAccountNumber(decrypted);
            } catch {
              // If decryption fails, might be plain text (legacy data)
              account.accountNumber = maskAccountNumber(account.accountNumber);
            }
          }
          return account;
        });
      }

      return NextResponse.json({ 
        application: responseData
      });
    } else {
      // Get all applications for user
      const query =
        session.user.role === 'customer'
          ? { userId: session.user.id }
          : {}; // Admin/Employee can see all

      const applications = await LoanApplication.find(query)
        .sort({ createdAt: -1 })
        .lean(); // Use lean() to get plain objects

      // Serialize applications properly for client components
      const serializedApplications = applications.map((app: any) => {
        // Serialize dates and ObjectIds
        const serialized: any = {
          ...app,
          _id: app._id.toString(),
          userId: app.userId?.toString() || app.userId,
          createdAt: app.createdAt?.toISOString(),
          updatedAt: app.updatedAt?.toISOString(),
          submittedAt: app.submittedAt?.toISOString(),
          reviewedAt: app.reviewedAt?.toISOString(),
          assignedAt: app.assignedAt?.toISOString(),
        };
        
        // Serialize borrowerInfo dates
        if (serialized.borrowerInfo?.dateOfBirth) {
          serialized.borrowerInfo.dateOfBirth = serialized.borrowerInfo.dateOfBirth.toISOString();
        }
        
        // Serialize statusHistory dates
        if (serialized.statusHistory && Array.isArray(serialized.statusHistory)) {
          serialized.statusHistory = serialized.statusHistory.map((entry: any) => ({
            ...entry,
            changedAt: entry.changedAt?.toISOString(),
            changedBy: entry.changedBy?.toString() || entry.changedBy,
          }));
        }
        
        // Serialize employment dates
        if (serialized.employment?.startDate) {
          serialized.employment.startDate = serialized.employment.startDate.toISOString();
        }
        if (serialized.employment?.endDate) {
          serialized.employment.endDate = serialized.employment.endDate.toISOString();
        }
        
        // Decrypt and mask sensitive data for display
        if (serialized.borrowerInfo?.ssn) {
          try {
            const decrypted = decryptSensitiveData(serialized.borrowerInfo.ssn);
            serialized.borrowerInfo.ssn = maskSSN(decrypted);
          } catch (error) {
            // If decryption fails, it might be plain text (test data)
            serialized.borrowerInfo.ssn = maskSSN(serialized.borrowerInfo.ssn);
          }
        }
        
        // Mask account numbers
        if (serialized.assets?.bankAccounts) {
          serialized.assets.bankAccounts = serialized.assets.bankAccounts.map((account: any) => {
            if (account.accountNumber) {
              try {
                const decrypted = decryptSensitiveData(account.accountNumber);
                account.accountNumber = maskAccountNumber(decrypted);
              } catch {
                account.accountNumber = maskAccountNumber(account.accountNumber);
              }
            }
            return account;
          });
        }
        
        return serialized;
      });

      return NextResponse.json({ applications: serializedApplications });
    }
  } catch (error) {
    // Log error details for debugging
    console.error('Error fetching loan applications:', error);
    if (process.env.NODE_ENV === 'development') {
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    }
    return NextResponse.json(
      { 
        error: 'Failed to fetch loan applications',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { applicationId, notes, updatedBy, ...updates } = body;

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    const application = await LoanApplication.findById(applicationId);

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check permission
    if (
      session.user.role === 'customer' &&
      application.userId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Sanitize all input data
    const sanitizedUpdates = sanitizeObject(updates);

    // Track employee actions
    if (session.user.role === 'employee' || session.user.role === 'admin') {
      // If employee/admin is working on application, assign it to them if not already assigned
      if (!application.assignedTo && session.user.role === 'employee') {
        application.assignedTo = session.user.id;
        application.assignedAt = new Date();
      }
      
      // Track status changes
      if (sanitizedUpdates.status && sanitizedUpdates.status !== application.status) {
        const statusHistoryEntry = {
          status: sanitizedUpdates.status,
          changedBy: session.user.id,
          changedAt: new Date(),
          notes: notes || `Status changed to ${sanitizedUpdates.status} by ${session.user.role}`
        };
        application.statusHistory = [...(application.statusHistory || []), statusHistoryEntry];
      }
      
      // Track decision changes
      if (sanitizedUpdates.decision && sanitizedUpdates.decision !== application.decision) {
        application.reviewedBy = session.user.id;
        application.reviewedAt = new Date();
        
        const statusHistoryEntry = {
          status: sanitizedUpdates.decision,
          changedBy: session.user.id,
          changedAt: new Date(),
          notes: notes || `Decision: ${sanitizedUpdates.decision}${sanitizedUpdates.decisionNotes ? ` - ${sanitizedUpdates.decisionNotes}` : ''}`
        };
        application.statusHistory = [...(application.statusHistory || []), statusHistoryEntry];
      }
    }

    // Helper function to safely get object from Mongoose subdocument
    const getObject = (obj: any) => {
      if (!obj) return {};
      if (typeof obj.toObject === 'function') {
        return obj.toObject();
      }
      if (typeof obj === 'object') {
        return obj;
      }
      return {};
    };

    // Handle nested object updates properly
    // Update borrowerInfo
    if (sanitizedUpdates.borrowerInfo) {
      // Encrypt SSN if it's being updated
      if (sanitizedUpdates.borrowerInfo.ssn) {
        // Only encrypt if it's not already encrypted (doesn't contain colons)
        if (!sanitizedUpdates.borrowerInfo.ssn.includes(':')) {
          if (validateSSN(sanitizedUpdates.borrowerInfo.ssn)) {
            sanitizedUpdates.borrowerInfo.ssn = encryptSensitiveData(sanitizeSSN(sanitizedUpdates.borrowerInfo.ssn));
          }
        }
      }
      // Merge with existing borrowerInfo
      application.borrowerInfo = {
        ...getObject(application.borrowerInfo),
        ...sanitizedUpdates.borrowerInfo
      };
      delete sanitizedUpdates.borrowerInfo;
    }

    // Update currentAddress
    if (sanitizedUpdates.currentAddress) {
      application.currentAddress = {
        ...getObject(application.currentAddress),
        ...sanitizedUpdates.currentAddress
      };
      delete sanitizedUpdates.currentAddress;
    }

    // Update employment
    if (sanitizedUpdates.employment) {
      application.employment = {
        ...getObject(application.employment),
        ...sanitizedUpdates.employment
      };
      delete sanitizedUpdates.employment;
    }

    // Update financialInfo
    if (sanitizedUpdates.financialInfo) {
      application.financialInfo = {
        ...getObject(application.financialInfo),
        ...sanitizedUpdates.financialInfo
      };
      delete sanitizedUpdates.financialInfo;
    }

    // Update propertyInfo
    if (sanitizedUpdates.propertyInfo) {
      application.propertyInfo = {
        ...getObject(application.propertyInfo),
        ...sanitizedUpdates.propertyInfo
      };
      delete sanitizedUpdates.propertyInfo;
    }

    // Update declarations
    if (sanitizedUpdates.declarations) {
      application.declarations = {
        ...getObject(application.declarations),
        ...sanitizedUpdates.declarations
      };
      delete sanitizedUpdates.declarations;
    }

    // Update assets (encrypt account numbers if updated)
    if (sanitizedUpdates.assets) {
      if (sanitizedUpdates.assets.bankAccounts) {
        sanitizedUpdates.assets.bankAccounts = sanitizedUpdates.assets.bankAccounts.map((account: any) => {
          if (account.accountNumber && !account.accountNumber.includes(':')) {
            account.accountNumber = encryptSensitiveData(account.accountNumber);
          }
          return account;
        });
      }
      application.assets = {
        ...getObject(application.assets),
        ...sanitizedUpdates.assets
      };
      delete sanitizedUpdates.assets;
    }

    // Update liabilities
    if (sanitizedUpdates.liabilities) {
      application.liabilities = {
        ...getObject(application.liabilities),
        ...sanitizedUpdates.liabilities
      };
      delete sanitizedUpdates.liabilities;
    }

    // Update top-level fields
    Object.keys(sanitizedUpdates).forEach(key => {
      if (key !== 'applicationId' && key !== 'notes' && key !== 'updatedBy') {
        (application as any)[key] = sanitizedUpdates[key];
      }
    });

    // Save the application
    await application.save();

    // Log data update
    await logDataAccess({
      userId: session.user.id,
      userRole: session.user.role,
      resource: 'loan_application',
      resourceId: application._id.toString(),
      action: 'update',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      details: {
        updatedFields: Object.keys(updates),
        notes: notes || 'Application updated',
      },
    });

    // Return updated application (serialized)
    const updatedApp = await LoanApplication.findById(applicationId).lean();
    const responseData: any = {
      ...updatedApp,
      _id: updatedApp?._id.toString(),
      userId: updatedApp?.userId?.toString(),
      createdAt: updatedApp?.createdAt?.toISOString(),
      updatedAt: updatedApp?.updatedAt?.toISOString(),
      submittedAt: updatedApp?.submittedAt?.toISOString(),
    };

    return NextResponse.json({
      success: true,
      application: responseData,
      message: 'Loan application updated successfully',
    });
  } catch (error) {
    // Log error details for debugging
    console.error('Error updating loan application:', error);
    if (process.env.NODE_ENV === 'development') {
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    }
    return NextResponse.json(
      { 
        error: 'Failed to update loan application',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

