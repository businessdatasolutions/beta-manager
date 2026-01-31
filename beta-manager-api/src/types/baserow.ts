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
  source?: string;  // Plain text field in Baserow
  stage?: string;   // Plain text field in Baserow
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
  type?: string;      // Plain text field in Baserow
  severity?: string;  // Plain text field in Baserow
  title: string;
  content: string;
  status?: string;    // Plain text field in Baserow
  device_info?: string;
  app_version?: string;
  screenshot_url?: string;
  admin_notes?: string;
  created_on: string;
  updated_on: string;
}

export interface BaserowIncident extends BaserowRow {
  tester?: BaserowLinkField[];
  type?: string;      // Plain text field in Baserow
  severity?: string;  // Plain text field in Baserow
  title: string;
  description: string;
  status?: string;    // Plain text field in Baserow
  source?: string;    // Plain text field in Baserow
  crash_id?: string;
  resolved_at?: string;
  resolution_notes?: string;
  created_on: string;
  updated_on: string;
}

export interface BaserowCommunication extends BaserowRow {
  tester: BaserowLinkField[];
  channel?: string;    // Plain text field in Baserow
  direction?: string;  // Plain text field in Baserow
  subject?: string;
  content: string;
  template_name?: string;
  status?: string;     // Plain text field in Baserow
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
