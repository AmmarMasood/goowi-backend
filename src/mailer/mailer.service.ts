import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // Use this for TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        // Ignore SSL certificate errors (not recommended for production)
        rejectUnauthorized: false,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    try {
      await this.transporter.sendMail({
        from: '"Goowi" <goowi.verify@example.com>',
        to: email,
        subject: 'Email Verification',
        html: `Click <a href="${url}">here</a> to verify your email. This link will expire in 1 hour.`,
      });
    } catch (err) {
      console.error('Email sending error:', err);
      throw new Error(err);
    }
  }
}
