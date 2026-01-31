export type IncidentType = 'crash' | 'bug' | 'ux_complaint' | 'dropout' | 'uninstall';
export type IncidentSeverity = 'critical' | 'major' | 'minor';
export type IncidentStatus = 'open' | 'investigating' | 'resolved';
export type IncidentSource = 'manual' | 'crashlytics' | 'automated';

export interface Incident {
  id: number;
  tester_id?: number;
  type: IncidentType;
  severity: IncidentSeverity;
  title: string;
  description: string;
  status: IncidentStatus;
  source: IncidentSource;
  crash_id?: string;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateIncidentInput {
  tester_id?: number;
  type: IncidentType;
  severity: IncidentSeverity;
  title: string;
  description: string;
  source: IncidentSource;
  crash_id?: string;
}

export interface UpdateIncidentInput {
  type?: IncidentType;
  severity?: IncidentSeverity;
  title?: string;
  description?: string;
  status?: IncidentStatus;
  resolution_notes?: string;
}
