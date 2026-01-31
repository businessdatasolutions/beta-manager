import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate, validateBody } from '../../../src/middleware/validate';

describe('validate middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  const testSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1),
  });

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {},
    };
    mockResponse = {};
    mockNext = jest.fn();
  });

  it('should pass valid request body', () => {
    mockRequest.body = {
      email: 'test@example.com',
      name: 'Test User',
    };

    const middleware = validateBody(testSchema);
    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(mockRequest.body).toEqual({
      email: 'test@example.com',
      name: 'Test User',
    });
  });

  it('should reject invalid request body with 400', () => {
    mockRequest.body = {
      email: 'invalid-email',
      name: '',
    };

    const middleware = validateBody(testSchema);
    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(z.ZodError));
  });

  it('should validate query parameters', () => {
    const querySchema = z.object({
      page: z.coerce.number().int().positive(),
      limit: z.coerce.number().int().positive().optional(),
    });

    mockRequest.query = {
      page: '1',
      limit: '10',
    };

    const middleware = validate(querySchema, 'query');
    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(mockRequest.query).toEqual({
      page: 1,
      limit: 10,
    });
  });

  it('should validate URL parameters', () => {
    const paramsSchema = z.object({
      id: z.coerce.number().int().positive(),
    });

    mockRequest.params = {
      id: '123',
    };

    const middleware = validate(paramsSchema, 'params');
    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(mockRequest.params).toEqual({
      id: 123,
    });
  });

  it('should reject missing required fields', () => {
    mockRequest.body = {
      email: 'test@example.com',
    };

    const middleware = validateBody(testSchema);
    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(z.ZodError));
  });
});
