export const TESTER_STAGES = [
  'prospect',
  'invited',
  'accepted',
  'installed',
  'onboarded',
  'active',
  'completed',
  'transitioned',
  'declined',
  'dropped_out',
  'unresponsive',
] as const;

export type TesterStage = (typeof TESTER_STAGES)[number];

export const TESTER_SOURCES = ['email', 'linkedin', 'whatsapp', 'referral', 'other'] as const;
export type TesterSource = (typeof TESTER_SOURCES)[number];

export const FEEDBACK_TYPES = ['bug', 'feature_request', 'ux_issue', 'general'] as const;
export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export const FEEDBACK_SEVERITIES = ['critical', 'major', 'minor'] as const;
export type FeedbackSeverity = (typeof FEEDBACK_SEVERITIES)[number];

export const FEEDBACK_STATUSES = ['new', 'in_review', 'addressed', 'closed'] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export const INCIDENT_TYPES = ['crash', 'bug', 'ux_complaint', 'dropout', 'uninstall'] as const;
export type IncidentType = (typeof INCIDENT_TYPES)[number];

export const INCIDENT_SEVERITIES = ['critical', 'major', 'minor'] as const;
export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number];

export const INCIDENT_STATUSES = ['open', 'investigating', 'resolved'] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export const COMMUNICATION_CHANNELS = ['email', 'whatsapp', 'linkedin', 'phone', 'other'] as const;
export type CommunicationChannel = (typeof COMMUNICATION_CHANNELS)[number];

export const COMMUNICATION_DIRECTIONS = ['outbound', 'inbound'] as const;
export type CommunicationDirection = (typeof COMMUNICATION_DIRECTIONS)[number];

export const COMMUNICATION_STATUSES = ['sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'] as const;
export type CommunicationStatus = (typeof COMMUNICATION_STATUSES)[number];

export const TEST_DURATION_DAYS = 14;
export const INACTIVITY_THRESHOLD_DAYS = 3;

export const RATE_LIMITS = {
  standard: { windowMs: 60 * 1000, max: 100 }, // 100 req/min
  strict: { windowMs: 60 * 1000, max: 10 }, // 10 req/min for public routes
};
