import { Resend } from 'resend';
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
  private resend: Resend | null = null;

  private getClient(): Resend {
    if (!this.resend) {
      if (!env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not configured');
      }
      this.resend = new Resend(env.RESEND_API_KEY);
    }
    return this.resend;
  }

  async sendEmail({ to, subject, html }: SendEmailParams): Promise<SendEmailResult> {
    try {
      if (!env.RESEND_API_KEY) {
        logger.warn('Email service not configured - skipping send', { to, subject });
        return {
          success: false,
          error: 'Email service not configured',
        };
      }

      const client = this.getClient();

      const { data, error } = await client.emails.send({
        from: env.EMAIL_FROM,
        to,
        subject,
        html,
      });

      if (error) {
        logger.error('Failed to send email', { to, subject, error: error.message });
        return {
          success: false,
          error: error.message,
        };
      }

      logger.info('Email sent successfully', { to, subject, messageId: data?.id });
      return {
        success: true,
        messageId: data?.id,
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
    return !!env.RESEND_API_KEY;
  }
}

export const emailService = new EmailService();
