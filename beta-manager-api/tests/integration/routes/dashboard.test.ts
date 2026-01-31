import request from 'supertest';
import bcrypt from 'bcrypt';

// Mock the env module
const TEST_EMAIL = 'admin@test.com';
const TEST_PASSWORD = 'testpassword123';
let TEST_PASSWORD_HASH: string;

beforeAll(async () => {
  TEST_PASSWORD_HASH = await bcrypt.hash(TEST_PASSWORD, 10);
});

jest.mock('../../../src/config/env', () => ({
  env: {
    JWT_SECRET: 'test-secret-key-that-is-at-least-32-characters-long',
    JWT_EXPIRY: '1h',
    ADMIN_EMAIL: 'admin@test.com',
    get ADMIN_PASSWORD_HASH() {
      return TEST_PASSWORD_HASH;
    },
    FRONTEND_URL: 'http://localhost:5173',
    NODE_ENV: 'test',
    BASEROW_API_TOKEN: 'test-token',
    BASEROW_TESTERS_TABLE_ID: '100',
    BASEROW_FEEDBACK_TABLE_ID: '101',
    BASEROW_INCIDENTS_TABLE_ID: '102',
    BASEROW_COMMUNICATIONS_TABLE_ID: '103',
    BASEROW_TEMPLATES_TABLE_ID: '104',
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
jest.mock('../../../src/services/baserow.service', () => ({
  baserow: {
    listRows: mockListRows,
    getRow: jest.fn(),
    createRow: jest.fn(),
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

import app from '../../../src/app';
import { BaserowTester, BaserowFeedback, BaserowIncident, BaserowCommunication } from '../../../src/types/baserow';

describe('Dashboard API', () => {
  let authCookie: string;

  const mockTester: BaserowTester = {
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
  };

  const mockFeedback: BaserowFeedback = {
    id: 1,
    order: '1',
    tester: [{ id: 1, value: 'Test User' }],
    type: { id: 1, value: 'bug', color: 'red' },
    severity: { id: 1, value: 'major', color: 'orange' },
    title: 'Test Feedback',
    content: 'Test content',
    status: { id: 1, value: 'new', color: 'gray' },
    created_on: '2024-01-01T00:00:00Z',
    updated_on: '2024-01-01T00:00:00Z',
  };

  const mockIncident: BaserowIncident = {
    id: 1,
    order: '1',
    tester: [{ id: 1, value: 'Test User' }],
    type: { id: 1, value: 'crash', color: 'red' },
    severity: { id: 1, value: 'critical', color: 'red' },
    title: 'Test Incident',
    description: 'Test description',
    status: { id: 1, value: 'open', color: 'red' },
    source: { id: 1, value: 'manual', color: 'gray' },
    created_on: '2024-01-01T00:00:00Z',
    updated_on: '2024-01-01T00:00:00Z',
  };

  const mockCommunication: BaserowCommunication = {
    id: 1,
    order: '1',
    tester: [{ id: 1, value: 'Test User' }],
    channel: { id: 1, value: 'email', color: 'blue' },
    direction: { id: 1, value: 'outbound', color: 'green' },
    subject: 'Test Email',
    content: 'Test email content',
    sent_at: '2024-01-01T00:00:00Z',
    created_on: '2024-01-01T00:00:00Z',
  };

  beforeAll(async () => {
    // Login to get auth cookie
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
    authCookie = loginResponse.headers['set-cookie'][0];
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/dashboard/stats', () => {
    it('should require authentication', async () => {
      const response = await request(app).get('/api/dashboard/stats');
      expect(response.status).toBe(401);
    });

    it('should return stats object', async () => {
      mockListRows
        .mockResolvedValueOnce({
          count: 5,
          next: null,
          previous: null,
          results: [
            mockTester,
            { ...mockTester, id: 2, stage: { id: 2, value: 'completed', color: 'blue' } },
            { ...mockTester, id: 3, stage: { id: 3, value: 'prospect', color: 'gray' } },
            { ...mockTester, id: 4, stage: { id: 4, value: 'active', color: 'green' } },
            { ...mockTester, id: 5, stage: { id: 5, value: 'dropped_out', color: 'red' } },
          ],
        })
        .mockResolvedValueOnce({
          count: 2,
          next: null,
          previous: null,
          results: [],
        });

      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('total_testers', 5);
      expect(response.body).toHaveProperty('active_count', 2);
      expect(response.body).toHaveProperty('open_incidents', 2);
      expect(response.body).toHaveProperty('retention_rate');
      expect(response.body).toHaveProperty('started_count');
      expect(response.body).toHaveProperty('completed_count');
    });

    it('should calculate correct retention rate', async () => {
      mockListRows
        .mockResolvedValueOnce({
          count: 4,
          next: null,
          previous: null,
          results: [
            { ...mockTester, id: 1, stage: { id: 1, value: 'completed', color: 'blue' } },
            { ...mockTester, id: 2, stage: { id: 2, value: 'completed', color: 'blue' } },
            { ...mockTester, id: 3, stage: { id: 3, value: 'active', color: 'green' } },
            { ...mockTester, id: 4, stage: { id: 4, value: 'dropped_out', color: 'red' } },
          ],
        })
        .mockResolvedValueOnce({ count: 0, next: null, previous: null, results: [] });

      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      // Started: completed(2) + active(1) + dropped_out(1) = 4
      // Completed: 2
      // Retention: 2/4 = 50%
      expect(response.body.started_count).toBe(4);
      expect(response.body.completed_count).toBe(2);
      expect(response.body.retention_rate).toBe(50);
    });
  });

  describe('GET /api/dashboard/funnel', () => {
    it('should require authentication', async () => {
      const response = await request(app).get('/api/dashboard/funnel');
      expect(response.status).toBe(401);
    });

    it('should return stage counts', async () => {
      mockListRows.mockResolvedValueOnce({
        count: 3,
        next: null,
        previous: null,
        results: [
          { ...mockTester, id: 1, stage: { id: 1, value: 'prospect', color: 'gray' } },
          { ...mockTester, id: 2, stage: { id: 2, value: 'active', color: 'green' } },
          { ...mockTester, id: 3, stage: { id: 3, value: 'active', color: 'green' } },
        ],
      });

      const response = await request(app)
        .get('/api/dashboard/funnel')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('funnel');
      expect(response.body).toHaveProperty('total', 3);
      expect(response.body.funnel).toBeInstanceOf(Array);

      const prospectStage = response.body.funnel.find((s: { stage: string }) => s.stage === 'prospect');
      const activeStage = response.body.funnel.find((s: { stage: string }) => s.stage === 'active');
      expect(prospectStage.count).toBe(1);
      expect(activeStage.count).toBe(2);
    });

    it('should return all stages in order', async () => {
      mockListRows.mockResolvedValueOnce({
        count: 0,
        next: null,
        previous: null,
        results: [],
      });

      const response = await request(app)
        .get('/api/dashboard/funnel')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.body.funnel.length).toBe(11); // All stages from constants
      expect(response.body.funnel[0].stage).toBe('prospect');
    });
  });

  describe('GET /api/dashboard/activity', () => {
    it('should require authentication', async () => {
      const response = await request(app).get('/api/dashboard/activity');
      expect(response.status).toBe(401);
    });

    it('should return recent items', async () => {
      mockListRows
        .mockResolvedValueOnce({
          count: 1,
          next: null,
          previous: null,
          results: [mockCommunication],
        })
        .mockResolvedValueOnce({
          count: 1,
          next: null,
          previous: null,
          results: [mockFeedback],
        })
        .mockResolvedValueOnce({
          count: 1,
          next: null,
          previous: null,
          results: [mockIncident],
        });

      const response = await request(app)
        .get('/api/dashboard/activity')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('activity');
      expect(response.body.activity).toBeInstanceOf(Array);
      expect(response.body.activity.length).toBe(3);

      // Check activity items have required fields
      for (const item of response.body.activity) {
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('date');
        expect(item).toHaveProperty('title');
      }
    });

    it('should respect limit parameter', async () => {
      mockListRows
        .mockResolvedValueOnce({ count: 0, next: null, previous: null, results: [] })
        .mockResolvedValueOnce({ count: 0, next: null, previous: null, results: [] })
        .mockResolvedValueOnce({ count: 0, next: null, previous: null, results: [] });

      const response = await request(app)
        .get('/api/dashboard/activity?limit=5')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      // Verify baserow was called with the limit
      expect(mockListRows).toHaveBeenCalledWith('communications', expect.objectContaining({ size: 5 }));
    });
  });

  describe('GET /api/dashboard/alerts', () => {
    it('should require authentication', async () => {
      const response = await request(app).get('/api/dashboard/alerts');
      expect(response.status).toBe(401);
    });

    it('should return attention items', async () => {
      // Mock inactive tester (last_active > 3 days ago)
      const inactiveTester = {
        ...mockTester,
        last_active: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
      };

      mockListRows
        .mockResolvedValueOnce({
          count: 1,
          next: null,
          previous: null,
          results: [inactiveTester],
        })
        .mockResolvedValueOnce({
          count: 1,
          next: null,
          previous: null,
          results: [mockFeedback],
        })
        .mockResolvedValueOnce({
          count: 1,
          next: null,
          previous: null,
          results: [mockIncident],
        });

      const response = await request(app)
        .get('/api/dashboard/alerts')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('inactive_testers');
      expect(response.body).toHaveProperty('pending_feedback');
      expect(response.body).toHaveProperty('open_incidents');
      expect(response.body).toHaveProperty('counts');

      expect(response.body.counts.inactive_testers).toBe(1);
      expect(response.body.counts.pending_feedback).toBe(1);
      expect(response.body.counts.open_incidents).toBe(1);
    });

    it('should not flag active testers as inactive', async () => {
      // Tester with recent last_active
      const activeTester = {
        ...mockTester,
        last_active: new Date().toISOString(), // Now
      };

      mockListRows
        .mockResolvedValueOnce({
          count: 1,
          next: null,
          previous: null,
          results: [activeTester],
        })
        .mockResolvedValueOnce({ count: 0, next: null, previous: null, results: [] })
        .mockResolvedValueOnce({ count: 0, next: null, previous: null, results: [] });

      const response = await request(app)
        .get('/api/dashboard/alerts')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.body.inactive_testers.length).toBe(0);
      expect(response.body.counts.inactive_testers).toBe(0);
    });
  });
});
