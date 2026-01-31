// Mock env before anything else
jest.mock('../../../src/config/env', () => ({
  env: {
    BASEROW_API_TOKEN: 'test-token',
    BASEROW_TESTERS_TABLE_ID: '100',
    BASEROW_FEEDBACK_TABLE_ID: '101',
    BASEROW_INCIDENTS_TABLE_ID: '102',
    BASEROW_COMMUNICATIONS_TABLE_ID: '103',
    BASEROW_TEMPLATES_TABLE_ID: '104',
    RESEND_API_KEY: 'test-resend-key',
    EMAIL_FROM: 'Test <test@example.com>',
    FRONTEND_URL: 'http://localhost:5173',
    PLAY_STORE_LINK: 'https://play.google.com/store/apps/test',
  },
}));

// Mock logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock baserow service
jest.mock('../../../src/services/baserow.service', () => ({
  baserow: {
    listRows: jest.fn(),
    createRow: jest.fn(),
  },
}));

// Mock email service
jest.mock('../../../src/services/email.service', () => ({
  emailService: {
    sendEmail: jest.fn(),
    isConfigured: jest.fn().mockReturnValue(true),
  },
}));

import { templateService } from '../../../src/services/template.service';
import { baserow } from '../../../src/services/baserow.service';
import { emailService } from '../../../src/services/email.service';

const mockBaserow = baserow as jest.Mocked<typeof baserow>;
const mockEmailService = emailService as jest.Mocked<typeof emailService>;

describe('TemplateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renderTemplate', () => {
    it('should replace single variable', () => {
      const template = 'Hello {{name}}!';
      const result = templateService.renderTemplate(template, { name: 'John' });
      expect(result).toBe('Hello John!');
    });

    it('should replace multiple variables', () => {
      const template = 'Hello {{name}}, you have {{days}} days left.';
      const result = templateService.renderTemplate(template, { name: 'John', days: '7' });
      expect(result).toBe('Hello John, you have 7 days left.');
    });

    it('should replace same variable multiple times', () => {
      const template = '{{name}} is {{name}}';
      const result = templateService.renderTemplate(template, { name: 'John' });
      expect(result).toBe('John is John');
    });

    it('should leave unreplaced variables intact', () => {
      const template = 'Hello {{name}}!';
      const result = templateService.renderTemplate(template, {});
      expect(result).toBe('Hello {{name}}!');
    });
  });

  describe('getTemplateVariables', () => {
    it('should calculate correct days', () => {
      const now = new Date();
      const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

      const variables = templateService.getTemplateVariables({
        id: 1,
        name: 'John',
        email: 'john@example.com',
        started_at: fiveDaysAgo.toISOString(),
      });

      expect(variables.name).toBe('John');
      expect(variables.email).toBe('john@example.com');
      expect(variables.days_in_test).toBe('5');
      expect(variables.days_remaining).toBe('9');
      expect(variables.feedback_link).toContain('tester=1');
    });

    it('should handle null started_at', () => {
      const variables = templateService.getTemplateVariables({
        id: 1,
        name: 'John',
        email: 'john@example.com',
        started_at: null,
      });

      expect(variables.days_in_test).toBe('0');
      expect(variables.days_remaining).toBe('14');
    });
  });

  describe('getTemplate', () => {
    it('should return template when found', async () => {
      const mockTemplate = {
        id: 1,
        name: 'welcome',
        subject: 'Welcome!',
        body: 'Hello {{name}}',
        is_active: true,
      };

      mockBaserow.listRows.mockResolvedValue({
        count: 1,
        next: null,
        previous: null,
        results: [mockTemplate],
      });

      const result = await templateService.getTemplate('welcome');

      expect(mockBaserow.listRows).toHaveBeenCalledWith('email_templates', {
        filters: { name: 'welcome' },
        size: 1,
      });
      expect(result).toEqual(mockTemplate);
    });

    it('should return null when template not found', async () => {
      mockBaserow.listRows.mockResolvedValue({
        count: 0,
        next: null,
        previous: null,
        results: [],
      });

      const result = await templateService.getTemplate('nonexistent');
      expect(result).toBeNull();
    });

    it('should return null when template is inactive', async () => {
      mockBaserow.listRows.mockResolvedValue({
        count: 1,
        next: null,
        previous: null,
        results: [{ id: 1, name: 'test', is_active: false }],
      });

      const result = await templateService.getTemplate('test');
      expect(result).toBeNull();
    });
  });

  describe('sendTemplateEmail', () => {
    const mockTester = {
      id: 1,
      order: '1',
      name: 'John Doe',
      email: 'john@example.com',
      source: { id: 1, value: 'email', color: 'blue' },
      stage: { id: 1, value: 'active', color: 'green' },
      started_at: new Date().toISOString(),
      created_on: new Date().toISOString(),
      updated_on: new Date().toISOString(),
    } as any;

    it('should send email with rendered template', async () => {
      const mockTemplate = {
        id: 1,
        name: 'welcome',
        subject: 'Welcome {{name}}!',
        body: '<p>Hello {{name}}, {{days_remaining}} days left!</p>',
        is_active: true,
      };

      mockBaserow.listRows.mockResolvedValue({
        count: 1,
        next: null,
        previous: null,
        results: [mockTemplate],
      });

      mockEmailService.sendEmail.mockResolvedValue({
        success: true,
        messageId: 'msg-123',
      });

      mockBaserow.createRow.mockResolvedValue({} as any);

      const result = await templateService.sendTemplateEmail(mockTester, 'welcome');

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('msg-123');
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith({
        to: 'john@example.com',
        subject: 'Welcome John Doe!',
        html: expect.stringContaining('Hello John Doe'),
      });
    });

    it('should return error for missing template', async () => {
      mockBaserow.listRows.mockResolvedValue({
        count: 0,
        next: null,
        previous: null,
        results: [],
      });

      const result = await templateService.sendTemplateEmail(mockTester, 'nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should log communication after sending', async () => {
      const mockTemplate = {
        id: 1,
        name: 'welcome',
        subject: 'Welcome!',
        body: '<p>Hello!</p>',
        is_active: true,
      };

      mockBaserow.listRows.mockResolvedValue({
        count: 1,
        next: null,
        previous: null,
        results: [mockTemplate],
      });

      mockEmailService.sendEmail.mockResolvedValue({
        success: true,
        messageId: 'msg-123',
      });

      mockBaserow.createRow.mockResolvedValue({} as any);

      await templateService.sendTemplateEmail(mockTester, 'welcome');

      expect(mockBaserow.createRow).toHaveBeenCalledWith('communications', expect.objectContaining({
        tester: [1],
        channel: 'email',
        direction: 'outbound',
        template_name: 'welcome',
        status: 'sent',
      }));
    });
  });

  describe('previewTemplate', () => {
    it('should return rendered preview with test data', async () => {
      const mockTemplate = {
        id: 1,
        name: 'welcome',
        subject: 'Welcome {{name}}!',
        body: '<p>Hello {{name}}!</p>',
        is_active: true,
      };

      mockBaserow.listRows.mockResolvedValue({
        count: 1,
        next: null,
        previous: null,
        results: [mockTemplate],
      });

      const result = await templateService.previewTemplate('welcome');

      expect(result).toEqual({
        subject: 'Welcome Test User!',
        body: '<p>Hello Test User!</p>',
      });
    });

    it('should return null for missing template', async () => {
      mockBaserow.listRows.mockResolvedValue({
        count: 0,
        next: null,
        previous: null,
        results: [],
      });

      const result = await templateService.previewTemplate('nonexistent');
      expect(result).toBeNull();
    });
  });
});
