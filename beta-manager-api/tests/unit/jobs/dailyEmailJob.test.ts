// Mock env before anything else
jest.mock('../../../src/config/env', () => ({
  env: {
    BASEROW_API_TOKEN: 'test-token',
    BASEROW_TESTERS_TABLE_ID: '100',
    BASEROW_FEEDBACK_TABLE_ID: '101',
    BASEROW_INCIDENTS_TABLE_ID: '102',
    BASEROW_COMMUNICATIONS_TABLE_ID: '103',
    BASEROW_TEMPLATES_TABLE_ID: '104',
    FRONTEND_URL: 'http://localhost:5173',
    PLAY_STORE_LINK: 'https://play.google.com',
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
const mockListRows = jest.fn();
const mockUpdateRow = jest.fn();

jest.mock('../../../src/services/baserow.service', () => ({
  baserow: {
    listRows: mockListRows,
    getRow: jest.fn(),
    createRow: jest.fn(),
    updateRow: mockUpdateRow,
    deleteRow: jest.fn(),
  },
  BaserowError: class BaserowError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
    }
  },
}));

// Mock template service
const mockSendTemplateEmail = jest.fn();

jest.mock('../../../src/services/template.service', () => ({
  templateService: {
    sendTemplateEmail: mockSendTemplateEmail,
  },
}));

import { processTester, runDailyEmailJob } from '../../../src/jobs/dailyEmailJob';
import { BaserowTester } from '../../../src/types/baserow';

describe('dailyEmailJob', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockTester = (overrides: Partial<BaserowTester> = {}): BaserowTester => ({
    id: 1,
    order: '1',
    name: 'Test User',
    email: 'test@example.com',
    source: { id: 1, value: 'email', color: 'blue' },
    stage: { id: 1, value: 'active', color: 'green' },
    started_at: new Date().toISOString(),
    last_active: new Date().toISOString(),
    created_on: '2024-01-01T00:00:00Z',
    updated_on: '2024-01-01T00:00:00Z',
    ...overrides,
  });

  // Helper to create a tester with started_at N days ago
  const createTesterAtDay = (day: number): BaserowTester => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - day);
    return createMockTester({ started_at: startDate.toISOString() });
  };

  describe('processTester', () => {
    it('should send day 3 email for testers at day 3', async () => {
      const tester = createTesterAtDay(3);
      mockSendTemplateEmail.mockResolvedValue({ success: true, messageId: 'msg-123' });

      const result = await processTester(tester);

      expect(result.action).toBe('email_sent');
      expect(result.day).toBe(3);
      expect(result.template).toBe('day_3_checkin');
      expect(mockSendTemplateEmail).toHaveBeenCalledWith(tester, 'day_3_checkin');
    });

    it('should send day 7 email for testers at day 7', async () => {
      const tester = createTesterAtDay(7);
      mockSendTemplateEmail.mockResolvedValue({ success: true, messageId: 'msg-123' });

      const result = await processTester(tester);

      expect(result.action).toBe('email_sent');
      expect(result.day).toBe(7);
      expect(result.template).toBe('day_7_midpoint');
      expect(mockSendTemplateEmail).toHaveBeenCalledWith(tester, 'day_7_midpoint');
    });

    it('should send day 12 email for testers at day 12', async () => {
      const tester = createTesterAtDay(12);
      mockSendTemplateEmail.mockResolvedValue({ success: true, messageId: 'msg-123' });

      const result = await processTester(tester);

      expect(result.action).toBe('email_sent');
      expect(result.day).toBe(12);
      expect(result.template).toBe('day_12_wrapup');
    });

    it('should send day 14 email and mark tester as completed', async () => {
      const tester = createTesterAtDay(14);
      mockSendTemplateEmail.mockResolvedValue({ success: true, messageId: 'msg-123' });
      mockUpdateRow.mockResolvedValue({ ...tester, stage: { id: 2, value: 'completed', color: 'blue' } });

      const result = await processTester(tester);

      expect(result.action).toBe('marked_complete');
      expect(result.day).toBe(14);
      expect(result.template).toBe('day_14_completion');
      expect(mockSendTemplateEmail).toHaveBeenCalledWith(tester, 'day_14_completion');
      expect(mockUpdateRow).toHaveBeenCalledWith('testers', tester.id, expect.objectContaining({
        stage: 'completed',
        completed_at: expect.any(String),
      }));
    });

    it('should skip testers without started_at', async () => {
      const tester = createMockTester({ started_at: undefined });

      const result = await processTester(tester);

      expect(result.action).toBe('skipped');
      expect(result.error).toBe('No started_at date');
      expect(mockSendTemplateEmail).not.toHaveBeenCalled();
    });

    it('should skip testers not in active stages', async () => {
      const tester = createTesterAtDay(3);
      tester.stage = { id: 2, value: 'prospect', color: 'gray' };

      const result = await processTester(tester);

      expect(result.action).toBe('skipped');
      expect(mockSendTemplateEmail).not.toHaveBeenCalled();
    });

    it('should skip testers on days without scheduled emails', async () => {
      const tester = createTesterAtDay(5); // No email on day 5

      const result = await processTester(tester);

      expect(result.action).toBe('skipped');
      expect(result.day).toBe(5);
      expect(mockSendTemplateEmail).not.toHaveBeenCalled();
    });

    it('should handle email send failures gracefully', async () => {
      const tester = createTesterAtDay(3);
      mockSendTemplateEmail.mockResolvedValue({ success: false, error: 'Template not found' });

      const result = await processTester(tester);

      expect(result.action).toBe('error');
      expect(result.error).toBe('Template not found');
    });

    it('should handle exceptions gracefully', async () => {
      const tester = createTesterAtDay(3);
      mockSendTemplateEmail.mockRejectedValue(new Error('Network error'));

      const result = await processTester(tester);

      expect(result.action).toBe('error');
      expect(result.error).toBe('Network error');
    });
  });

  describe('runDailyEmailJob', () => {
    it('should process all active testers', async () => {
      const testers = [
        createTesterAtDay(3),
        createTesterAtDay(5), // Will be skipped
        createTesterAtDay(7),
      ];

      mockListRows.mockResolvedValue({
        count: 3,
        next: null,
        previous: null,
        results: testers,
      });
      mockSendTemplateEmail.mockResolvedValue({ success: true, messageId: 'msg-123' });

      const stats = await runDailyEmailJob();

      expect(stats.processed).toBe(3);
      expect(stats.emailsSent).toBe(2); // Day 3 and day 7
      expect(stats.errors).toBe(0);
    });

    it('should count completed testers separately', async () => {
      const testers = [createTesterAtDay(14)];

      mockListRows.mockResolvedValue({
        count: 1,
        next: null,
        previous: null,
        results: testers,
      });
      mockSendTemplateEmail.mockResolvedValue({ success: true, messageId: 'msg-123' });
      mockUpdateRow.mockResolvedValue({});

      const stats = await runDailyEmailJob();

      expect(stats.emailsSent).toBe(1);
      expect(stats.completed).toBe(1);
    });

    it('should count errors', async () => {
      const testers = [createTesterAtDay(3)];

      mockListRows.mockResolvedValue({
        count: 1,
        next: null,
        previous: null,
        results: testers,
      });
      mockSendTemplateEmail.mockResolvedValue({ success: false, error: 'Failed' });

      const stats = await runDailyEmailJob();

      expect(stats.errors).toBe(1);
      expect(stats.emailsSent).toBe(0);
    });
  });
});
