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
const mockCreateRow = jest.fn();

jest.mock('../../../src/services/baserow.service', () => ({
  baserow: {
    listRows: mockListRows,
    getRow: jest.fn(),
    createRow: mockCreateRow,
    updateRow: jest.fn(),
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

import {
  processTesterInactivity,
  hasExistingDropoutIncident,
  createDropoutIncident,
  runInactivityCheck,
} from '../../../src/jobs/inactivityCheck';
import { BaserowTester } from '../../../src/types/baserow';

describe('inactivityCheck', () => {
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

  // Helper to create a tester inactive for N days
  const createInactiveTester = (daysInactive: number): BaserowTester => {
    const lastActive = new Date();
    lastActive.setDate(lastActive.getDate() - daysInactive);
    return createMockTester({ last_active: lastActive.toISOString() });
  };

  describe('hasExistingDropoutIncident', () => {
    it('should return true if incident exists', async () => {
      mockListRows.mockResolvedValue({
        count: 1,
        results: [{ id: 1, type: { value: 'dropout' } }],
      });

      const result = await hasExistingDropoutIncident(1);

      expect(result).toBe(true);
      expect(mockListRows).toHaveBeenCalledWith('incidents', expect.objectContaining({
        filters: { tester: '1', type: 'dropout' },
      }));
    });

    it('should return false if no incident exists', async () => {
      mockListRows.mockResolvedValue({
        count: 0,
        results: [],
      });

      const result = await hasExistingDropoutIncident(1);

      expect(result).toBe(false);
    });
  });

  describe('createDropoutIncident', () => {
    it('should create incident with correct fields', async () => {
      const tester = createInactiveTester(4);
      mockCreateRow.mockResolvedValue({ id: 1 });

      const result = await createDropoutIncident(tester);

      expect(result).toEqual({ id: 1 });
      expect(mockCreateRow).toHaveBeenCalledWith('incidents', expect.objectContaining({
        tester: [tester.id],
        type: 'dropout',
        severity: 'major',
        status: 'open',
        source: 'automated',
      }));
    });
  });

  describe('processTesterInactivity', () => {
    it('should create incident for inactive testers', async () => {
      const tester = createInactiveTester(4);

      // No existing incident
      mockListRows.mockResolvedValueOnce({ count: 0, results: [] });
      // Create incident
      mockCreateRow.mockResolvedValue({ id: 1 });
      // Re-engagement email (optional)
      mockSendTemplateEmail.mockResolvedValue({ success: true });

      const result = await processTesterInactivity(tester);

      expect(result.action).toBe('incident_created');
      expect(mockCreateRow).toHaveBeenCalled();
    });

    it('should skip if incident already exists', async () => {
      const tester = createInactiveTester(4);

      // Existing incident found
      mockListRows.mockResolvedValue({ count: 1, results: [{ id: 1 }] });

      const result = await processTesterInactivity(tester);

      expect(result.action).toBe('already_exists');
      expect(mockCreateRow).not.toHaveBeenCalled();
    });

    it('should not flag active testers as inactive', async () => {
      const tester = createMockTester({
        last_active: new Date().toISOString(), // Just now
      });

      const result = await processTesterInactivity(tester);

      expect(result.action).toBe('not_inactive');
      expect(mockListRows).not.toHaveBeenCalled();
      expect(mockCreateRow).not.toHaveBeenCalled();
    });

    it('should skip testers in non-active stages', async () => {
      const tester = createInactiveTester(4);
      tester.stage = { id: 1, value: 'prospect', color: 'gray' };

      const result = await processTesterInactivity(tester);

      expect(result.action).toBe('not_inactive');
    });

    it('should calculate inactivity correctly at threshold', async () => {
      // Exactly 3 days inactive (threshold)
      const tester = createInactiveTester(3);

      mockListRows.mockResolvedValueOnce({ count: 0, results: [] });
      mockCreateRow.mockResolvedValue({ id: 1 });
      mockSendTemplateEmail.mockResolvedValue({ success: false });

      const result = await processTesterInactivity(tester);

      expect(result.action).toBe('incident_created');
    });

    it('should not flag testers at 2 days inactive', async () => {
      const tester = createInactiveTester(2);

      const result = await processTesterInactivity(tester);

      expect(result.action).toBe('not_inactive');
    });

    it('should report if re-engagement email was sent', async () => {
      const tester = createInactiveTester(4);

      mockListRows.mockResolvedValueOnce({ count: 0, results: [] });
      mockCreateRow.mockResolvedValue({ id: 1 });
      mockSendTemplateEmail.mockResolvedValue({ success: true });

      const result = await processTesterInactivity(tester);

      expect(result.action).toBe('incident_created');
      expect(result.emailSent).toBe(true);
    });
  });

  describe('runInactivityCheck', () => {
    it('should process active testers and create incidents', async () => {
      const testers = [
        createInactiveTester(4),
        createMockTester({ last_active: new Date().toISOString() }), // Active
        createInactiveTester(5),
      ];

      // First call: get all testers
      mockListRows.mockResolvedValueOnce({
        count: 3,
        results: testers,
      });

      // Second and third calls: check for existing incidents
      mockListRows.mockResolvedValueOnce({ count: 0, results: [] });
      mockListRows.mockResolvedValueOnce({ count: 0, results: [] });

      mockCreateRow.mockResolvedValue({ id: 1 });
      mockSendTemplateEmail.mockResolvedValue({ success: false });

      const stats = await runInactivityCheck();

      expect(stats.processed).toBe(3);
      expect(stats.incidentsCreated).toBe(2);
    });

    it('should count already existing incidents', async () => {
      const testers = [createInactiveTester(4)];

      mockListRows.mockResolvedValueOnce({
        count: 1,
        results: testers,
      });

      // Incident already exists
      mockListRows.mockResolvedValueOnce({ count: 1, results: [{ id: 1 }] });

      const stats = await runInactivityCheck();

      expect(stats.alreadyExists).toBe(1);
      expect(stats.incidentsCreated).toBe(0);
    });

    it('should count re-engagement emails sent', async () => {
      const testers = [createInactiveTester(4)];

      mockListRows.mockResolvedValueOnce({
        count: 1,
        results: testers,
      });
      mockListRows.mockResolvedValueOnce({ count: 0, results: [] });
      mockCreateRow.mockResolvedValue({ id: 1 });
      mockSendTemplateEmail.mockResolvedValue({ success: true });

      const stats = await runInactivityCheck();

      expect(stats.emailsSent).toBe(1);
    });
  });
});
