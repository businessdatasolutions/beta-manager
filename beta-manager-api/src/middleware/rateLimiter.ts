import rateLimit from 'express-rate-limit';
import { RATE_LIMITS } from '../config/constants';

// Skip rate limiting in test environment
const isTestEnv = process.env.NODE_ENV === 'test';

export const standardLimiter = rateLimit({
  windowMs: RATE_LIMITS.standard.windowMs,
  max: isTestEnv ? 0 : RATE_LIMITS.standard.max, // 0 = disabled
  message: {
    error: 'Too many requests',
    message: 'Please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestEnv,
});

export const strictLimiter = rateLimit({
  windowMs: RATE_LIMITS.strict.windowMs,
  max: isTestEnv ? 0 : RATE_LIMITS.strict.max, // 0 = disabled
  message: {
    error: 'Too many requests',
    message: 'Please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestEnv,
});
