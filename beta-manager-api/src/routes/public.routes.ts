import { Router, Request, Response, NextFunction } from 'express';
import { validateBody } from '../middleware/validate';
import { strictLimiter } from '../middleware/rateLimiter';
import { publicFeedbackSchema, PublicFeedbackInput } from '../schemas/feedback.schema';
import { baserow, BaserowError } from '../services/baserow.service';
import { NotFoundError } from '../middleware/errorHandler';
import { BaserowTester, BaserowFeedback } from '../types/baserow';
import { logger } from '../utils/logger';

const router = Router();

// Apply strict rate limiting to all public routes
router.use(strictLimiter);

// Track server start time for uptime calculation
const startTime = Date.now();

/**
 * POST /public/feedback
 * Accept feedback from testers without authentication
 */
router.post(
  '/feedback',
  validateBody(publicFeedbackSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tester_id, type, severity, title, content, device_info, app_version } =
        req.body as PublicFeedbackInput;

      // Verify tester exists
      try {
        await baserow.getRow<BaserowTester>('testers', tester_id);
      } catch (error) {
        if (error instanceof BaserowError && error.statusCode === 404) {
          return next(new NotFoundError('Tester not found'));
        }
        throw error;
      }

      // Create feedback - only include defined values
      const feedbackData: Record<string, unknown> = {
        tester: [tester_id],
        type,
        title,
        content,
        status: 'new',
      };
      if (severity) feedbackData.severity = severity;
      if (device_info) feedbackData.device_info = device_info;
      if (app_version) feedbackData.app_version = app_version;

      const feedback = await baserow.createRow<BaserowFeedback>('feedback', feedbackData);

      logger.info('Public feedback submitted', {
        feedbackId: feedback.id,
        testerId: tester_id,
        type,
      });

      res.status(201).json({
        success: true,
        message: 'Thank you for your feedback!',
        feedback_id: feedback.id,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /public/health
 * Health check endpoint - returns server status, uptime, and timestamp
 */
router.get('/health', (_req: Request, res: Response) => {
  const uptimeMs = Date.now() - startTime;
  const uptimeSeconds = Math.floor(uptimeMs / 1000);

  res.json({
    status: 'ok',
    uptime: uptimeSeconds,
    uptime_human: formatUptime(uptimeSeconds),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

/**
 * Format uptime in human-readable format
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(' ');
}

export default router;
