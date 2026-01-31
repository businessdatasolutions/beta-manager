// Mock env before anything else
jest.mock('../../../src/config/env', () => ({
  env: {
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
jest.mock('../../../src/services/baserow.service', () => ({
  baserow: {
    listRows: jest.fn(),
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

import { Request, Response, NextFunction } from 'express';
import {
  listTesters,
  getTester,
  createTester,
  updateTester,
  deleteTester,
  updateStage,
} from '../../../src/controllers/testers.controller';
import { baserow, BaserowError } from '../../../src/services/baserow.service';
import { BaserowTester } from '../../../src/types/baserow';

const mockBaserow = baserow as jest.Mocked<typeof baserow>;

describe('Testers Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  const mockTester: BaserowTester = {
    id: 1,
    order: '1',
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    source: { id: 1, value: 'email', color: 'blue' },
    stage: { id: 1, value: 'prospect', color: 'gray' },
    invited_at: undefined,
    started_at: undefined,
    last_active: undefined,
    completed_at: undefined,
    notes: 'Test notes',
    created_on: '2024-01-01T00:00:00Z',
    updated_on: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      query: {},
      params: {},
      body: {},
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('listTesters', () => {
    it('should return list of testers', async () => {
      const mockResult = {
        count: 1,
        next: null,
        previous: null,
        results: [mockTester],
      };
      mockBaserow.listRows.mockResolvedValue(mockResult);

      mockReq.query = { page: '1', size: '20' } as any;

      await listTesters(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockBaserow.listRows).toHaveBeenCalledWith('testers', expect.objectContaining({
        page: '1',
        size: '20',
        orderBy: '-created_on',
      }));
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        count: 1,
        results: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
          }),
        ]),
      }));
    });

    it('should filter by stage', async () => {
      mockBaserow.listRows.mockResolvedValue({
        count: 0,
        next: null,
        previous: null,
        results: [],
      });

      mockReq.query = { stage: 'active', page: '1', size: '20' } as any;

      await listTesters(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockBaserow.listRows).toHaveBeenCalledWith('testers', expect.objectContaining({
        filters: { stage: 'active' },
      }));
    });

    it('should apply client-side search filter', async () => {
      const mockResult = {
        count: 2,
        next: null,
        previous: null,
        results: [
          mockTester,
          { ...mockTester, id: 2, name: 'Another User', email: 'another@example.com' },
        ],
      };
      mockBaserow.listRows.mockResolvedValue(mockResult);

      mockReq.query = { search: 'another', page: '1', size: '20' } as any;

      await listTesters(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        count: 1,
        results: expect.arrayContaining([
          expect.objectContaining({ name: 'Another User' }),
        ]),
      }));
    });
  });

  describe('getTester', () => {
    it('should return tester with stats', async () => {
      mockBaserow.getRow.mockResolvedValue(mockTester);
      mockBaserow.listRows
        .mockResolvedValueOnce({ count: 3, next: null, previous: null, results: [] })
        .mockResolvedValueOnce({ count: 1, next: null, previous: null, results: [] });

      mockReq.params = { id: '1' };

      await getTester(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        name: 'Test User',
        feedback_count: 3,
        incident_count: 1,
      }));
    });

    it('should return 404 for non-existent tester', async () => {
      mockBaserow.getRow.mockRejectedValue(new BaserowError('Not found', 404));

      mockReq.params = { id: '999' };

      await getTester(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Tester not found',
        statusCode: 404,
      }));
    });

    it('should return 400 for invalid ID', async () => {
      mockReq.params = { id: 'invalid' };

      await getTester(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid tester ID',
        statusCode: 400,
      }));
    });
  });

  describe('createTester', () => {
    it('should create tester with default stage', async () => {
      const newTester = { ...mockTester, id: 5 };
      mockBaserow.createRow.mockResolvedValue(newTester);

      mockReq.body = {
        name: 'New Tester',
        email: 'new@example.com',
        source: 'email',
      };

      await createTester(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockBaserow.createRow).toHaveBeenCalledWith('testers', expect.objectContaining({
        name: 'New Tester',
        email: 'new@example.com',
        source: 'email',
        stage: 'prospect',
      }));
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateTester', () => {
    it('should update tester fields', async () => {
      const updatedTester = { ...mockTester, name: 'Updated Name' };
      mockBaserow.updateRow.mockResolvedValue(updatedTester);

      mockReq.params = { id: '1' };
      mockReq.body = { name: 'Updated Name' };

      await updateTester(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockBaserow.updateRow).toHaveBeenCalledWith('testers', 1, { name: 'Updated Name' });
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should reject empty update', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = {};

      await updateTester(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'No fields to update',
        statusCode: 400,
      }));
    });
  });

  describe('deleteTester', () => {
    it('should delete tester', async () => {
      mockBaserow.deleteRow.mockResolvedValue(undefined);

      mockReq.params = { id: '1' };

      await deleteTester(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockBaserow.deleteRow).toHaveBeenCalledWith('testers', 1);
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
    });
  });

  describe('updateStage', () => {
    it('should update stage with timestamp', async () => {
      const updatedTester = { ...mockTester, stage: { id: 2, value: 'invited', color: 'blue' } };
      mockBaserow.updateRow.mockResolvedValue(updatedTester);

      mockReq.params = { id: '1' };
      mockReq.body = { stage: 'invited' };

      await updateStage(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockBaserow.updateRow).toHaveBeenCalledWith('testers', 1, expect.objectContaining({
        stage: 'invited',
        invited_at: expect.any(String),
      }));
    });

    it('should set started_at when becoming active', async () => {
      mockBaserow.getRow.mockResolvedValue(mockTester);
      const updatedTester = { ...mockTester, stage: { id: 3, value: 'active', color: 'green' } };
      mockBaserow.updateRow.mockResolvedValue(updatedTester);

      mockReq.params = { id: '1' };
      mockReq.body = { stage: 'active' };

      await updateStage(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockBaserow.updateRow).toHaveBeenCalledWith('testers', 1, expect.objectContaining({
        stage: 'active',
        started_at: expect.any(String),
        last_active: expect.any(String),
      }));
    });
  });
});
