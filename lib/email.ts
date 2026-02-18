import nodemailer from 'nodemailer';

/**
 * Email sending: Resend (API), Gmail, or Outlook.
 * Microsoft has disabled basic auth for many Outlook/365 tenants — use Resend or Gmail instead.
 */

export function getFromEmail(): string {
  if (process.env.RESEND_API_KEY && process.env.RESEND_FROM) {
    return process.env.RESEND_FROM;
  }
  if (process.env.RESEND_API_KEY) {
    return 'onboarding@resend.dev'; // Resend default for testing when no domain verified
  }
  return (
    process.env.EMAIL_FROM ||
    process.env.EMAIL_USER ||
    process.env.GMAIL_USER ||
    'noreply@loanaticks.com'
  );
}

export function isEmailConfigured(): boolean {
  return (
    !!process.env.RESEND_API_KEY ||
    !!(process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) ||
    !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)
  );
}

/** Send email via Resend API (recommended — no Outlook/Gmail auth issues). */
async function sendViaResend(options: {
  from: string;
  to: string;
  subject: string;
  html: string;
}): Promise<{ messageId: string }> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) throw new Error('RESEND_API_KEY is not set');

  const from = options.from.includes('<') ? options.from : `LOANATICKS <${options.from}>`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [options.to],
      subject: options.subject,
      html: options.html,
    }),
  });

  const data = (await res.json()) as { id?: string; message?: string };
  if (!res.ok) {
    throw new Error(data.message || `Resend API error ${res.status}`);
  }
  return { messageId: data.id || 'resend' };
}

/**
 * Send an email. Uses Resend if RESEND_API_KEY is set; otherwise Nodemailer (Gmail or Outlook).
 * Prefer Resend — Microsoft 365 often has "basic authentication is disabled" for SMTP.
 */
export async function sendEmail(options: {
  from: string;
  to: string;
  subject: string;
  html: string;
}): Promise<{ messageId: string }> {
  if (process.env.RESEND_API_KEY?.trim()) {
    return sendViaResend(options);
  }

  const transporter = getEmailTransporter();
  if (!transporter) {
    throw new Error(
      'Email not configured. Set RESEND_API_KEY (recommended), or GMAIL_USER + GMAIL_APP_PASSWORD, or EMAIL_USER + EMAIL_APP_PASSWORD.'
    );
  }

  const info = await transporter.sendMail({
    from: options.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  return { messageId: info.messageId || '' };
}

/**
 * Get Nodemailer transporter (Gmail or Outlook). Only used when RESEND_API_KEY is not set.
 * Note: Outlook/Office 365 often returns "535 5.7.139 Authentication unsuccessful, basic authentication is disabled" — use Resend or Gmail instead.
 */
export function getEmailTransporter(): nodemailer.Transporter | null {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const outlookUser = process.env.EMAIL_USER;
  const outlookPass = process.env.EMAIL_APP_PASSWORD;

  // Prefer Gmail over Outlook (Outlook basic auth is often disabled by Microsoft)
  if (gmailUser && gmailPass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass.replace(/\s/g, ''),
      },
    });
  }

  if (outlookUser && outlookPass) {
    return nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: outlookUser,
        pass: outlookPass.replace(/\s/g, ''),
      },
    });
  }

  return null;
}
