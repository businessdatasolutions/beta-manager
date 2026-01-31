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

// Mock axios with proper interceptors
const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPatch = jest.fn();
const mockDelete = jest.fn();

jest.mock('axios', () => {
  return {
    create: jest.fn(() => ({
      get: mockGet,
      post: mockPost,
      patch: mockPatch,
      delete: mockDelete,
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    })),
    isAxiosError: jest.fn(() => false),
  };
});

import { baserow, BaserowError } from '../../../src/services/baserow.service';
import axios from 'axios';

describe('BaserowService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listRows', () => {
    it('should build correct query params', async () => {
      const mockResponse = {
        data: {
          count: 2,
          next: null,
          previous: null,
          results: [
            { id: 1, name: 'Test 1' },
            { id: 2, name: 'Test 2' },
          ],
        },
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await baserow.listRows('testers', {
        page: 1,
        size: 20,
        orderBy: 'name',
        filters: { stage: 'active' },
      });

      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('/database/rows/table/100/')
      );
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('page=1')
      );
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('size=20')
      );
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('order_by=name')
      );
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('filter__stage__equal=active')
      );
      expect(result.results).toHaveLength(2);
    });

    it('should handle empty results', async () => {
      const mockResponse = {
        data: {
          count: 0,
          next: null,
          previous: null,
          results: [],
        },
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await baserow.listRows('testers');

      expect(result.count).toBe(0);
      expect(result.results).toEqual([]);
    });
  });

  describe('getRow', () => {
    it('should return single row', async () => {
      const mockRow = { id: 1, name: 'Test Tester', email: 'test@example.com' };
      mockGet.mockResolvedValue({ data: mockRow });

      const result = await baserow.getRow('testers', 1);

      expect(mockGet).toHaveBeenCalledWith('/database/rows/table/100/1/');
      expect(result).toEqual(mockRow);
    });

    it('should throw on 404', async () => {
      const error = {
        response: { status: 404, data: { error: 'Not found' } },
        message: 'Request failed',
        isAxiosError: true,
      };

      mockGet.mockRejectedValue(error);
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);

      await expect(baserow.getRow('testers', 999)).rejects.toThrow(BaserowError);
      await expect(baserow.getRow('testers', 999)).rejects.toThrow(
        'Resource not found'
      );
    });
  });

  describe('createRow', () => {
    it('should post data correctly', async () => {
      const inputData = { name: 'New Tester', email: 'new@example.com' };
      const mockResponse = { id: 5, ...inputData };

      mockPost.mockResolvedValue({ data: mockResponse });

      const result = await baserow.createRow('testers', inputData);

      expect(mockPost).toHaveBeenCalledWith(
        '/database/rows/table/100/',
        inputData
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateRow', () => {
    it('should patch data correctly', async () => {
      const updateData = { name: 'Updated Name' };
      const mockResponse = { id: 1, name: 'Updated Name', email: 'test@example.com' };

      mockPatch.mockResolvedValue({ data: mockResponse });

      const result = await baserow.updateRow<{ id: number; name: string; email: string }>(
        'testers',
        1,
        updateData
      );

      expect(mockPatch).toHaveBeenCalledWith(
        '/database/rows/table/100/1/',
        updateData
      );
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('deleteRow', () => {
    it('should call correct endpoint', async () => {
      mockDelete.mockResolvedValue({});

      await baserow.deleteRow('testers', 1);

      expect(mockDelete).toHaveBeenCalledWith('/database/rows/table/100/1/');
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      mockGet.mockRejectedValue(networkError);

      await expect(baserow.listRows('testers')).rejects.toThrow(BaserowError);
    });

    it('should handle 401 authentication errors', async () => {
      const authError = {
        response: { status: 401, data: { detail: 'Invalid token' } },
        message: 'Unauthorized',
        isAxiosError: true,
      };

      mockGet.mockRejectedValue(authError);
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);

      await expect(baserow.listRows('testers')).rejects.toThrow(
        'Baserow authentication failed'
      );
    });
  });
});
