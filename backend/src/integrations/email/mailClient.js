import nodemailer from 'nodemailer';
import env from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    throw new ApiError(500, 'SMTP configuration is missing');
  }

  transporter = nodemailer.createTransport({
    service: env.smtpHost === 'smtp.gmail.com' ? 'gmail' : undefined,
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    requireTLS: env.smtpPort === 587,
    tls: {
      rejectUnauthorized: true,
    },
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });

  return transporter;
}

export async function sendPasswordResetEmail({ to, resetUrl, name }) {
  const mailer = getTransporter();
  try {
    await mailer.verify();
    const info = await mailer.sendMail({
    from: `Smart Internship Analyzer <${env.smtpUser}>`,
    to,
    subject: 'Reset your Smart Internship Analyzer password',
    text: `Hi ${name || 'there'}, reset your password using this link: ${resetUrl} (expires in 15 minutes). If you did not request this, ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2 style="margin: 0 0 12px;">Reset your password</h2>
        <p>Hi ${name || 'there'},</p>
        <p>We received a request to reset your password. Use the button below to choose a new password. This link expires in 15 minutes.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="display:inline-block;background:#0f4c81;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;">Reset Password</a>
        </p>
        <p>If the button does not work, copy and paste this URL into your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });
    return info;
  } catch (error) {
    throw new ApiError(500, `Failed to send reset email: ${error?.message || 'SMTP error'}`);
  }
}
