import rateLimit from 'express-rate-limit';
import { RATE_LIMITS } from '../config/constants';

export const standardLimiter = rateLimit({
  windowMs: RATE_LIMITS.standard.windowMs,
  max: RATE_LIMITS.standard.max,
  message: {
    error: 'Too many requests',
    message: 'Please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictLimiter = rateLimit({
  windowMs: RATE_LIMITS.strict.windowMs,
  max: RATE_LIMITS.strict.max,
  message: {
    error: 'Too many requests',
    message: 'Please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
