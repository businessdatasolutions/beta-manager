export interface BaserowListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface BaserowRow {
  id: number;
  order: string;
}

export interface BaserowLinkField {
  id: number;
  value: string;
}

export interface BaserowTester extends BaserowRow {
  name: string;
  email: string;
  phone?: string;
  source: { id: number; value: string; color: string };
  stage: { id: number; value: string; color: string };
  invited_at?: string;
  started_at?: string;
  last_active?: string;
  completed_at?: string;
  notes?: string;
  created_on: string;
  updated_on: string;
}

export interface BaserowFeedback extends BaserowRow {
  tester: BaserowLinkField[];
  type: { id: number; value: string; color: string };
  severity?: { id: number; value: string; color: string };
  title: string;
  content: string;
  status: { id: number; value: string; color: string };
  device_info?: string;
  app_version?: string;
  screenshot_url?: string;
  admin_notes?: string;
  created_on: string;
  updated_on: string;
}

export interface BaserowIncident extends BaserowRow {
  tester?: BaserowLinkField[];
  type: { id: number; value: string; color: string };
  severity: { id: number; value: string; color: string };
  title: string;
  description: string;
  status: { id: number; value: string; color: string };
  source: { id: number; value: string; color: string };
  crash_id?: string;
  resolved_at?: string;
  resolution_notes?: string;
  created_on: string;
  updated_on: string;
}

export interface BaserowCommunication extends BaserowRow {
  tester: BaserowLinkField[];
  channel: { id: number; value: string; color: string };
  direction: { id: number; value: string; color: string };
  subject?: string;
  content: string;
  template_name?: string;
  status?: { id: number; value: string; color: string };
  sent_at: string;
  opened_at?: string;
  clicked_at?: string;
  created_on: string;
}

export interface BaserowEmailTemplate extends BaserowRow {
  name: string;
  subject: string;
  body: string;
  variables: string;
  is_active: boolean;
  created_on: string;
  updated_on: string;
}

export type TableName = 'testers' | 'feedback' | 'incidents' | 'communications' | 'email_templates';

export interface BaserowFilterOptions {
  page?: number;
  size?: number;
  orderBy?: string;
  filters?: Record<string, string | number | boolean>;
}
