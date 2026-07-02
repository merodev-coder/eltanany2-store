// backend/src/utils/sendEmail.ts
import nodemailer from 'nodemailer';
import AppError from './AppError.js';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// ── Nodemailer transporter ─────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
});

/**
 * Send an email using the configured SMTP transporter.
 * Wraps Nodemailer with error handling.
 */
export default async function sendEmail({ to, subject, text, html }: EmailOptions): Promise<void> {
  // Validate required env vars
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[sendEmail] Email credentials not configured. Skipping email send.');
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'El-Tanany <no-reply@el-tanany.com>',
      to,
      subject,
      text,
      html,
    });
  } catch (err: any) {
    console.error('[sendEmail] Failed to send email:', err.message);
    // Don't throw — email failures should not block the user flow
  }
}
