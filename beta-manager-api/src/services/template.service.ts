import { baserow } from './baserow.service';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { BaserowEmailTemplate, BaserowTester } from '../types/baserow';
import { calculateDaysInTest, calculateDaysRemaining } from '../utils/dates';

interface TemplateVariables {
  name: string;
  email: string;
  days_in_test: string;
  days_remaining: string;
  feedback_link: string;
  play_store_link: string;
  [key: string]: string;
}

interface RenderEmailResult {
  subject: string;
  body: string;
}

class TemplateService {
  /**
   * Render a template by replacing {{variable}} placeholders
   */
  renderTemplate(template: string, variables: Record<string, string>): string {
    let rendered = template;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, value ?? '');
    });

    return rendered;
  }

  /**
   * Get standard template variables for a tester
   */
  getTemplateVariables(tester: {
    id: number;
    name: string;
    email: string;
    started_at?: string | null;
  }): TemplateVariables {
    return {
      name: tester.name,
      email: tester.email,
      days_in_test: calculateDaysInTest(tester.started_at).toString(),
      days_remaining: calculateDaysRemaining(tester.started_at).toString(),
      feedback_link: `${env.FRONTEND_URL}/feedback-form?tester=${tester.id}`,
      play_store_link: env.PLAY_STORE_LINK || '',
    };
  }

  /**
   * Fetch a template by name from Baserow
   */
  async getTemplate(templateName: string): Promise<BaserowEmailTemplate | null> {
    try {
      const result = await baserow.listRows<BaserowEmailTemplate>('email_templates', {
        filters: { name: templateName },
        size: 1,
      });

      if (result.results.length === 0) {
        return null;
      }

      const template = result.results[0];

      // Check if template is active
      if (!template.is_active) {
        logger.warn('Template exists but is not active', { templateName });
        return null;
      }

      return template;
    } catch (error) {
      logger.error('Failed to fetch template', { templateName, error });
      return null;
    }
  }

  /**
   * Render a template email for a tester (without sending)
   */
  async renderTemplateEmail(
    tester: BaserowTester,
    templateName: string,
    extraVariables?: Record<string, string>
  ): Promise<RenderEmailResult | null> {
    // Fetch template
    const template = await this.getTemplate(templateName);

    if (!template) {
      return null;
    }

    // Build variables
    const variables: TemplateVariables = {
      ...this.getTemplateVariables({
        id: tester.id,
        name: tester.name,
        email: tester.email,
        started_at: tester.started_at,
      }),
      ...extraVariables,
    };

    // Render subject and body
    const subject = this.renderTemplate(template.subject, variables);
    const body = this.renderTemplate(template.body, variables);

    return { subject, body };
  }

  /**
   * Render a custom email for a tester (without sending)
   */
  renderCustomEmail(
    tester: BaserowTester,
    subject: string,
    body: string
  ): RenderEmailResult {
    // Build variables for any placeholders in custom content
    const variables = this.getTemplateVariables({
      id: tester.id,
      name: tester.name,
      email: tester.email,
      started_at: tester.started_at,
    });

    // Render subject and body in case they contain variables
    const renderedSubject = this.renderTemplate(subject, variables);
    const renderedBody = this.renderTemplate(body, variables);

    return { subject: renderedSubject, body: renderedBody };
  }

  /**
   * Preview a template with test data
   */
  async previewTemplate(
    templateName: string,
    testData?: Record<string, string>
  ): Promise<{ subject: string; body: string } | null> {
    const template = await this.getTemplate(templateName);

    if (!template) {
      return null;
    }

    const defaultVariables: TemplateVariables = {
      name: 'Test User',
      email: 'test@example.com',
      days_in_test: '7',
      days_remaining: '7',
      feedback_link: `${env.FRONTEND_URL}/feedback-form?tester=1`,
      play_store_link: env.PLAY_STORE_LINK || 'https://play.google.com',
      ...testData,
    };

    return {
      subject: this.renderTemplate(template.subject, defaultVariables),
      body: this.renderTemplate(template.body, defaultVariables),
    };
  }
}

export const templateService = new TemplateService();
