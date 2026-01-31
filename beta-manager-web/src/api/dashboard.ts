import apiClient from './client';

export interface DashboardStats {
  total_testers: number;
  active_count: number;
  open_incidents: number;
  retention_rate: number;
  started_count: number;
  completed_count: number;
}

export interface FunnelItem {
  stage: string;
  count: number;
}

export interface FunnelResponse {
  funnel: FunnelItem[];
  total: number;
}

export interface ActivityItem {
  type: 'communication' | 'feedback' | 'incident';
  id: number;
  date: string;
  title: string;
  description: string;
  tester_id?: number;
  tester_name?: string;
  metadata?: {
    feedback_type?: string;
    severity?: string;
    status?: string;
    incident_type?: string;
  };
}

export interface ActivityResponse {
  activity: ActivityItem[];
}

export interface AlertTester {
  id: number;
  name: string;
  email: string;
  stage: string;
  last_active: string;
}

export interface AlertFeedback {
  id: number;
  title: string;
  type: string;
  severity?: string;
  tester_id?: number;
  tester_name?: string;
  created_at: string;
}

export interface AlertIncident {
  id: number;
  title: string;
  type: string;
  severity: string;
  tester_id?: number;
  tester_name?: string;
  created_at: string;
}

export interface AlertsResponse {
  inactive_testers: AlertTester[];
  pending_feedback: AlertFeedback[];
  open_incidents: AlertIncident[];
  counts: {
    inactive_testers: number;
    pending_feedback: number;
    open_incidents: number;
  };
}

export async function getStats(): Promise<DashboardStats> {
  const response = await apiClient.get<DashboardStats>('/api/dashboard/stats');
  return response.data;
}

export async function getFunnel(): Promise<FunnelResponse> {
  const response = await apiClient.get<FunnelResponse>('/api/dashboard/funnel');
  return response.data;
}

export async function getActivity(limit = 20): Promise<ActivityResponse> {
  const response = await apiClient.get<ActivityResponse>('/api/dashboard/activity', {
    params: { limit },
  });
  return response.data;
}

export async function getAlerts(): Promise<AlertsResponse> {
  const response = await apiClient.get<AlertsResponse>('/api/dashboard/alerts');
  return response.data;
}
