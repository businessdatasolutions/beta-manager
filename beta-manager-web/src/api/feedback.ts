import { apiClient } from './client';
import type {
  Feedback,
  FeedbackStatus,
  CreateFeedbackInput,
  UpdateFeedbackInput,
} from '../types/feedback';

export interface ListFeedbackParams {
  page?: number;
  size?: number;
  status?: FeedbackStatus;
  testerId?: number;
}

export interface FeedbackResponse {
  results: Feedback[];
  count: number;
  page: number;
  size: number;
  totalPages: number;
}

export async function getFeedback(
  params: ListFeedbackParams = {}
): Promise<FeedbackResponse> {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.set('page', String(params.page));
  if (params.size) queryParams.set('size', String(params.size));
  if (params.status) queryParams.set('status', params.status);
  if (params.testerId) queryParams.set('tester_id', String(params.testerId));

  const query = queryParams.toString();
  const url = query ? `/api/feedback?${query}` : '/api/feedback';

  const response = await apiClient.get<FeedbackResponse>(url);
  return response.data;
}

export async function getFeedbackById(id: number): Promise<Feedback> {
  const response = await apiClient.get<Feedback>(`/api/feedback/${id}`);
  return response.data;
}

export async function createFeedback(
  data: CreateFeedbackInput
): Promise<Feedback> {
  const response = await apiClient.post<Feedback>('/api/feedback', data);
  return response.data;
}

export async function updateFeedback(
  id: number,
  data: UpdateFeedbackInput
): Promise<Feedback> {
  const response = await apiClient.patch<Feedback>(`/api/feedback/${id}`, data);
  return response.data;
}

export async function deleteFeedback(id: number): Promise<void> {
  await apiClient.delete(`/api/feedback/${id}`);
}
