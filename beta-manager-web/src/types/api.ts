export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  message?: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface DashboardStats {
  totalTesters: number;
  activeTesters: number;
  completedTesters: number;
  openIncidents: number;
  pendingFeedback: number;
  retentionRate: number;
}

export interface FunnelData {
  stage: string;
  count: number;
  percentage: number;
}

export interface ActivityItem {
  id: number;
  type: 'tester' | 'feedback' | 'incident' | 'communication';
  action: string;
  description: string;
  timestamp: string;
  relatedId?: number;
}

export interface AlertItem {
  id: number;
  type: 'inactive' | 'incident' | 'feedback';
  severity: 'critical' | 'major' | 'minor';
  title: string;
  description: string;
  relatedId?: number;
  timestamp: string;
}
