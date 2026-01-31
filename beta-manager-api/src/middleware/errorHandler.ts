import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

interface ErrorResponse {
  error: string;
  message?: string;
  details?: Record<string, string[]>;
  stack?: string;
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });

  const response: ErrorResponse = {
    error: 'Internal Server Error',
  };

  let statusCode = 500;

  if (err instanceof ZodError) {
    statusCode = 400;
    response.error = 'Validation Error';
    response.details = err.flatten().fieldErrors as Record<string, string[]>;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    response.error = err.message;
  } else if (err.name === 'SyntaxError') {
    statusCode = 400;
    response.error = 'Invalid JSON';
  }

  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
    response.message = err.message;
  }

  res.status(statusCode).json(response);
}
