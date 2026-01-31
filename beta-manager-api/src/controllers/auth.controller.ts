import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { env } from '../config/env';
import { signToken } from '../utils/jwt';
import { UnauthorizedError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    // Check if email matches admin
    if (email !== env.ADMIN_EMAIL) {
      logger.warn('Login attempt with invalid email', { email });
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, env.ADMIN_PASSWORD_HASH);
    if (!isValid) {
      logger.warn('Login attempt with invalid password', { email });
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate JWT
    const token = signToken({ email, role: 'admin' });

    // Set httpOnly cookie
    res.cookie('token', token, COOKIE_OPTIONS);

    logger.info('User logged in', { email });
    res.json({ success: true, email });
  } catch (error) {
    next(error);
  }
}

export function logout(_req: Request, res: Response) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.json({ success: true });
}

export function me(req: Request, res: Response) {
  res.json({
    email: req.user?.email,
    role: req.user?.role,
  });
}
