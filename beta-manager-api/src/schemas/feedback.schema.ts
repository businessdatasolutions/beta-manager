import { z } from 'zod';
import { FEEDBACK_TYPES, FEEDBACK_SEVERITIES, FEEDBACK_STATUSES } from '../config/constants';

export const createFeedbackSchema = z.object({
  tester_id: z.number().int().positive(),
  type: z.enum(FEEDBACK_TYPES),
  severity: z.enum(FEEDBACK_SEVERITIES).optional(),
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  device_info: z.string().optional(),
  app_version: z.string().optional(),
  screenshot_url: z.string().url().optional(),
});

export const updateFeedbackSchema = z.object({
  type: z.enum(FEEDBACK_TYPES).optional(),
  severity: z.enum(FEEDBACK_SEVERITIES).optional(),
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  status: z.enum(FEEDBACK_STATUSES).optional(),
  admin_notes: z.string().optional(),
});

export const feedbackQuerySchema = z.object({
  tester_id: z.coerce.number().int().positive().optional(),
  type: z.enum(FEEDBACK_TYPES).optional(),
  status: z.enum(FEEDBACK_STATUSES).optional(),
  severity: z.enum(FEEDBACK_SEVERITIES).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  size: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const publicFeedbackSchema = z.object({
  tester_id: z.number().int().positive(),
  type: z.enum(FEEDBACK_TYPES),
  severity: z.enum(FEEDBACK_SEVERITIES).optional(),
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  device_info: z.string().optional(),
  app_version: z.string().optional(),
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
export type UpdateFeedbackInput = z.infer<typeof updateFeedbackSchema>;
export type FeedbackQueryInput = z.infer<typeof feedbackQuerySchema>;
export type PublicFeedbackInput = z.infer<typeof publicFeedbackSchema>;
