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

export const STAGE_LABELS: Record<TesterStage, string> = {
  prospect: 'Prospect',
  invited: 'Invited',
  accepted: 'Accepted',
  installed: 'Installed',
  onboarded: 'Onboarded',
  active: 'Active',
  completed: 'Completed',
  transitioned: 'Transitioned',
  declined: 'Declined',
  dropped_out: 'Dropped Out',
  unresponsive: 'Unresponsive',
};

export const STAGE_COLORS: Record<TesterStage, string> = {
  prospect: 'bg-gray-100 text-gray-800',
  invited: 'bg-blue-100 text-blue-800',
  accepted: 'bg-cyan-100 text-cyan-800',
  installed: 'bg-indigo-100 text-indigo-800',
  onboarded: 'bg-violet-100 text-violet-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-emerald-100 text-emerald-800',
  transitioned: 'bg-teal-100 text-teal-800',
  declined: 'bg-red-100 text-red-800',
  dropped_out: 'bg-orange-100 text-orange-800',
  unresponsive: 'bg-yellow-100 text-yellow-800',
};

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

export const TEST_DURATION_DAYS = 14;
