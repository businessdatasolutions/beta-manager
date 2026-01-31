import { z } from 'zod';
import { TESTER_STAGES, TESTER_SOURCES } from '../config/constants';

export const createTesterSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  source: z.enum(TESTER_SOURCES),
  notes: z.string().optional(),
});

export const updateTesterSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  source: z.enum(TESTER_SOURCES).optional(),
  stage: z.enum(TESTER_STAGES).optional(),
  notes: z.string().optional(),
  last_active: z.string().datetime().optional(),
});

export const updateStageSchema = z.object({
  stage: z.enum(TESTER_STAGES),
});

export const sendEmailSchema = z.object({
  template_name: z.string().optional(),
  custom_subject: z.string().max(200).optional(),
  custom_body: z.string().optional(),
}).refine(
  (data) => data.template_name || (data.custom_subject && data.custom_body),
  { message: 'Either template_name or both custom_subject and custom_body are required' }
);

export const testerQuerySchema = z.object({
  stage: z.enum(TESTER_STAGES).optional(),
  source: z.enum(TESTER_SOURCES).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  size: z.coerce.number().int().positive().max(100).optional().default(20),
  orderBy: z.string().optional(),
});

export type CreateTesterInput = z.infer<typeof createTesterSchema>;
export type UpdateTesterInput = z.infer<typeof updateTesterSchema>;
export type UpdateStageInput = z.infer<typeof updateStageSchema>;
export type TesterQueryInput = z.infer<typeof testerQuerySchema>;
export type SendEmailInput = z.infer<typeof sendEmailSchema>;
