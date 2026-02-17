import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getEmailTransporter, getFromEmail, isEmailConfigured } from '@/lib/email';

/**
 * Send approval email to borrower with ARIVE portal link.
 * Admins/employees use the Send button to email the customer: "You are approved - please sign up on this link and fill it out."
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user?.role !== 'employee' && session.user?.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized. Employee or Admin access required.' },
        { status: 401 }
      );
    }

    const { borrowerEmail, borrowerName, ariveUrl } = await request.json();

    if (!borrowerEmail || !borrowerName || !ariveUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: borrowerEmail, borrowerName, and ariveUrl are required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(borrowerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const emailSubject = 'You Are Approved – Please Sign Up and Complete Your Application';
    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Approval</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">You Are Approved</h1>
    <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">Please sign up on this link and fill it out</p>
  </div>

  <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Dear ${borrowerName},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Your loan application has been <strong>approved</strong>. Please sign up using the link below and complete the form with the email we have on file for you.
    </p>

    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <p style="margin: 0; font-size: 15px; color: #92400e;">
        <strong>Next step:</strong> Click the button below to sign up and fill out your application using this link.
      </p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${ariveUrl}" 
         style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        Sign Up & Complete Your Application →
      </a>
    </div>

    <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <strong>Application link (use the email we have on file):</strong>
    </p>
    <p style="font-size: 12px; color: #9ca3af; word-break: break-all; margin: 10px 0 0 0;">
      <a href="${ariveUrl}" style="color: #10b981; text-decoration: none;">${ariveUrl}</a>
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p style="margin: 0;">If you have any questions, please contact us.</p>
    <p style="margin: 10px 0 0 0;">Thank you for choosing LOANATICKS!</p>
  </div>
</body>
</html>
`;

    if (!isEmailConfigured()) {
      console.log('\n📧 EMAIL TO SEND (Email not configured):');
      console.log('To:', borrowerEmail);
      console.log('Subject:', emailSubject);
      return NextResponse.json({
        success: false,
        message: 'Email not configured. Set EMAIL_USER and EMAIL_APP_PASSWORD (Outlook) or GMAIL_USER and GMAIL_APP_PASSWORD.',
        email: { to: borrowerEmail, subject: emailSubject },
      }, { status: 500 });
    }

    const transporter = getEmailTransporter();
    if (!transporter) {
      return NextResponse.json(
        { error: 'Email transporter could not be created.' },
        { status: 500 }
      );
    }

    const info = await transporter.sendMail({
      from: `LOANATICKS <${getFromEmail()}>`,
      to: borrowerEmail,
      subject: emailSubject,
      html: emailBody,
    });

    console.log('✅ Approval email sent:', info.messageId);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('Error sending approval email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    );
  }
}
