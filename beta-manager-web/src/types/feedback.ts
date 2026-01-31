export type FeedbackType = 'bug' | 'feature_request' | 'ux_issue' | 'general';
export type FeedbackSeverity = 'critical' | 'major' | 'minor';
export type FeedbackStatus = 'new' | 'in_review' | 'addressed' | 'closed';

export interface Feedback {
  id: number;
  tester_id: number;
  type: FeedbackType;
  severity?: FeedbackSeverity;
  title: string;
  content: string;
  status: FeedbackStatus;
  device_info?: string;
  app_version?: string;
  screenshot_url?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFeedbackInput {
  tester_id: number;
  type: FeedbackType;
  severity?: FeedbackSeverity;
  title: string;
  content: string;
  device_info?: string;
  app_version?: string;
}

export interface UpdateFeedbackInput {
  type?: FeedbackType;
  severity?: FeedbackSeverity;
  title?: string;
  content?: string;
  status?: FeedbackStatus;
  admin_notes?: string;
}
