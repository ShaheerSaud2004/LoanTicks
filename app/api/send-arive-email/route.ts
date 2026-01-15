import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import nodemailer from 'nodemailer';

/**
 * Send preliminary approval email to borrower with ARIVE portal link
 * 
 * This endpoint sends an email to the borrower notifying them of preliminary approval
 * and providing a link to complete their application in the ARIVE portal.
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || (session.user?.role !== 'employee' && session.user?.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized. Employee or Admin access required.' },
        { status: 401 }
      );
    }

    const { applicationId, borrowerEmail, borrowerName, ariveUrl } = await request.json();

    // Validate required fields
    if (!borrowerEmail || !borrowerName || !ariveUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: borrowerEmail, borrowerName, and ariveUrl are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(borrowerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Email template
    const emailSubject = '🎉 Preliminary Approval - Complete Your Loan Application';
    
    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preliminary Approval</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🎉 Congratulations!</h1>
    <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">You've Been Preliminarily Approved</p>
  </div>

  <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Dear ${borrowerName},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      We're excited to inform you that your loan application has received <strong>preliminary approval</strong>! 
      This is a significant step forward in your mortgage journey.
    </p>

    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <p style="margin: 0; font-size: 15px; color: #92400e;">
        <strong>Next Steps:</strong> To proceed with your loan application, please create an account and complete your application through our secure borrower portal.
      </p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${ariveUrl}" 
         style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        Complete Your Application →
      </a>
    </div>

    <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <strong>What to expect:</strong>
    </p>
    <ul style="font-size: 14px; color: #6b7280; margin: 10px 0; padding-left: 20px;">
      <li style="margin-bottom: 8px;">Create your secure account</li>
      <li style="margin-bottom: 8px;">Complete your 1003 loan application</li>
      <li style="margin-bottom: 8px;">Upload required documents</li>
      <li style="margin-bottom: 8px;">Track your application status</li>
    </ul>
  </div>

  <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
    <p style="font-size: 14px; color: #6b7280; margin: 0 0 10px 0;">
      <strong>Application Link:</strong>
    </p>
    <p style="font-size: 12px; color: #9ca3af; word-break: break-all; margin: 0;">
      <a href="${ariveUrl}" style="color: #10b981; text-decoration: none;">${ariveUrl}</a>
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p style="margin: 0;">If you have any questions, please don't hesitate to contact us.</p>
    <p style="margin: 10px 0 0 0;">Thank you for choosing LoanTicks!</p>
  </div>
</body>
</html>
`;

    // Check if Gmail credentials are configured
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailAppPassword) {
      // Fallback: log to console if Gmail not configured
      console.log('\n📧 EMAIL TO SEND (Gmail not configured):');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`To: ${borrowerEmail}`);
      console.log(`Subject: ${emailSubject}`);
      console.log(`Body: ${emailBody}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      return NextResponse.json({
        success: false,
        message: 'Gmail not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.',
        email: {
          to: borrowerEmail,
          subject: emailSubject,
        },
      }, { status: 500 });
    }

    // Create Gmail transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    // Send email via Gmail
    try {
      const info = await transporter.sendMail({
        from: `LoanTicks <${gmailUser}>`,
        to: borrowerEmail,
        subject: emailSubject,
        html: emailBody,
      });

      console.log('✅ Email sent successfully:', info.messageId);

      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
        messageId: info.messageId,
      });
    } catch (emailError) {
      console.error('❌ Error sending email via Gmail:', emailError);
      return NextResponse.json(
        { 
          error: 'Failed to send email via Gmail',
          details: emailError instanceof Error ? emailError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    );
  }
}
