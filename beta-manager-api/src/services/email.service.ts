import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: parseInt(env.SMTP_PORT, 10),
        secure: false, // true for 465, false for other ports
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    }
    return this.transporter;
  }

  async sendEmail({ to, subject, html }: SendEmailParams): Promise<SendEmailResult> {
    try {
      const transporter = this.getTransporter();

      const info = await transporter.sendMail({
        from: env.EMAIL_FROM,
        to,
        subject,
        html,
      });

      logger.info('Email sent successfully', { to, subject, messageId: info.messageId });
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Email send error', { to, subject, error: message });
      return {
        success: false,
        error: message,
      };
    }
  }

  isConfigured(): boolean {
    return !!(env.SMTP_USER && env.SMTP_PASS);
  }
}

export const emailService = new EmailService();
