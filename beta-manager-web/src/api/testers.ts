import { apiClient } from './client';
import type {
  Tester,
  TesterWithStats,
  TesterStage,
  CreateTesterInput,
  UpdateTesterInput,
} from '../types/tester';
import type { Communication } from '../types/communication';
import type { Feedback } from '../types/feedback';
import type { Incident } from '../types/incident';

export interface ListTestersParams {
  page?: number;
  size?: number;
  stage?: TesterStage;
  search?: string;
  orderBy?: string;
}

export interface TestersResponse {
  results: Tester[];
  count: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface TesterTimelineItem {
  id: number;
  type: 'communication' | 'feedback' | 'incident' | 'stage_change';
  timestamp: string;
  data: Communication | Feedback | Incident | StageChangeData;
}

interface StageChangeData {
  from_stage: TesterStage;
  to_stage: TesterStage;
  changed_at: string;
}

export async function getTesters(
  params: ListTestersParams = {}
): Promise<TestersResponse> {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.set('page', String(params.page));
  if (params.size) queryParams.set('size', String(params.size));
  if (params.stage) queryParams.set('stage', params.stage);
  if (params.search) queryParams.set('search', params.search);
  if (params.orderBy) queryParams.set('order_by', params.orderBy);

  const query = queryParams.toString();
  const url = query ? `/api/testers?${query}` : '/api/testers';

  const response = await apiClient.get<TestersResponse>(url);
  return response.data;
}

export async function getTester(id: number): Promise<TesterWithStats> {
  const response = await apiClient.get<TesterWithStats>(`/api/testers/${id}`);
  return response.data;
}

export async function createTester(data: CreateTesterInput): Promise<Tester> {
  const response = await apiClient.post<Tester>('/api/testers', data);
  return response.data;
}

export async function updateTester(
  id: number,
  data: UpdateTesterInput
): Promise<Tester> {
  const response = await apiClient.patch<Tester>(`/api/testers/${id}`, data);
  return response.data;
}

export async function deleteTester(id: number): Promise<void> {
  await apiClient.delete(`/api/testers/${id}`);
}

export async function updateTesterStage(
  id: number,
  stage: TesterStage
): Promise<Tester> {
  const response = await apiClient.post<Tester>(`/api/testers/${id}/stage`, {
    stage,
  });
  return response.data;
}

export async function getTesterTimeline(
  id: number
): Promise<TesterTimelineItem[]> {
  const response = await apiClient.get<TesterTimelineItem[]>(
    `/api/testers/${id}/timeline`
  );
  return response.data;
}

export interface SendEmailParams {
  templateName?: string;
  subject?: string;
  body?: string;
}

export async function sendTesterEmail(
  id: number,
  params: SendEmailParams
): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(
    `/api/testers/${id}/send-email`,
    params
  );
  return response.data;
}
