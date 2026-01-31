import { z } from 'zod';
import { COMMUNICATION_CHANNELS, COMMUNICATION_DIRECTIONS, COMMUNICATION_STATUSES } from '../config/constants';

export const createCommunicationSchema = z.object({
  tester_id: z.number().int().positive(),
  channel: z.enum(COMMUNICATION_CHANNELS),
  direction: z.enum(COMMUNICATION_DIRECTIONS),
  subject: z.string().max(200).optional(),
  content: z.string().min(1, 'Content is required'),
  template_name: z.string().optional(),
  status: z.enum(COMMUNICATION_STATUSES).optional(),
});

export const communicationQuerySchema = z.object({
  tester_id: z.coerce.number().int().positive().optional(),
  channel: z.enum(COMMUNICATION_CHANNELS).optional(),
  direction: z.enum(COMMUNICATION_DIRECTIONS).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  size: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type CreateCommunicationInput = z.infer<typeof createCommunicationSchema>;
export type CommunicationQueryInput = z.infer<typeof communicationQuerySchema>;
