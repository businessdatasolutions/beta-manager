import { Request, Response, NextFunction } from 'express';
import { ZodError, z } from 'zod';
import { errorHandler, AppError, NotFoundError, UnauthorizedError } from '../../../src/middleware/errorHandler';

// Mock logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('errorHandler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockRequest = {};
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
    mockNext = jest.fn();
  });

  it('should return 400 for Zod validation errors', () => {
    const schema = z.object({
      email: z.string().email(),
      name: z.string().min(1),
    });

    let zodError: ZodError;
    try {
      schema.parse({ email: 'invalid', name: '' });
    } catch (e) {
      zodError = e as ZodError;
    }

    errorHandler(
      zodError!,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Validation Error',
        details: expect.any(Object),
      })
    );
  });

  it('should return custom status for AppError', () => {
    const error = new NotFoundError('Resource not found');

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Resource not found',
      })
    );
  });

  it('should return 401 for UnauthorizedError', () => {
    const error = new UnauthorizedError();

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Unauthorized',
      })
    );
  });

  it('should return 500 for unknown errors', () => {
    const error = new Error('Something went wrong');

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Internal Server Error',
      })
    );
  });

  it('should return 400 for SyntaxError (invalid JSON)', () => {
    const error = new SyntaxError('Unexpected token');

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Invalid JSON',
      })
    );
  });
});
