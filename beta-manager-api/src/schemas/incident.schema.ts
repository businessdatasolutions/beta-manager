import { z } from 'zod';
import { INCIDENT_TYPES, INCIDENT_SEVERITIES, INCIDENT_STATUSES } from '../config/constants';

const INCIDENT_SOURCES = ['manual', 'crashlytics', 'automated'] as const;

export const createIncidentSchema = z.object({
  tester_id: z.number().int().positive().optional(),
  type: z.enum(INCIDENT_TYPES),
  severity: z.enum(INCIDENT_SEVERITIES),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required'),
  source: z.enum(INCIDENT_SOURCES),
  crash_id: z.string().optional(),
});

export const updateIncidentSchema = z.object({
  type: z.enum(INCIDENT_TYPES).optional(),
  severity: z.enum(INCIDENT_SEVERITIES).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(INCIDENT_STATUSES).optional(),
  resolution_notes: z.string().optional(),
});

export const incidentQuerySchema = z.object({
  tester_id: z.coerce.number().int().positive().optional(),
  type: z.enum(INCIDENT_TYPES).optional(),
  status: z.enum(INCIDENT_STATUSES).optional(),
  severity: z.enum(INCIDENT_SEVERITIES).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  size: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;
export type IncidentQueryInput = z.infer<typeof incidentQuerySchema>;
