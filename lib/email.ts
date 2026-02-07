import nodemailer from 'nodemailer';

/**
 * Get email transporter for sending notifications.
 * Supports Outlook (EMAIL_USER + EMAIL_APP_PASSWORD) or Gmail (GMAIL_USER + GMAIL_APP_PASSWORD).
 * Outlook is preferred when EMAIL_USER is set (e.g. RUQAYYAYASIN@outlook.com).
 */
export function getEmailTransporter(): nodemailer.Transporter | null {
  const outlookUser = process.env.EMAIL_USER;
  const outlookPass = process.env.EMAIL_APP_PASSWORD;
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  // Prefer Outlook when configured (for notifications, approval emails, etc.)
  if (outlookUser && outlookPass) {
    return nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: outlookUser,
        pass: outlookPass.replace(/\s/g, ''), // remove spaces from app password
      },
    });
  }

  if (gmailUser && gmailPass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass.replace(/\s/g, ''),
      },
    });
  }

  return null;
}

export function getFromEmail(): string {
  return process.env.EMAIL_USER || process.env.GMAIL_USER || 'noreply@loanaticks.com';
}

export function isEmailConfigured(): boolean {
  return !!(process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) ||
    !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}
