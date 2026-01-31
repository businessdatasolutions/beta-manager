import { apiClient } from './client';
import type {
  Incident,
  IncidentStatus,
  IncidentType,
  CreateIncidentInput,
  UpdateIncidentInput,
} from '../types/incident';

export interface ListIncidentsParams {
  page?: number;
  size?: number;
  status?: IncidentStatus;
  type?: IncidentType;
  testerId?: number;
}

export interface IncidentsResponse {
  results: Incident[];
  count: number;
  page: number;
  size: number;
  totalPages: number;
}

export async function getIncidents(
  params: ListIncidentsParams = {}
): Promise<IncidentsResponse> {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.set('page', String(params.page));
  if (params.size) queryParams.set('size', String(params.size));
  if (params.status) queryParams.set('status', params.status);
  if (params.type) queryParams.set('type', params.type);
  if (params.testerId) queryParams.set('tester_id', String(params.testerId));

  const query = queryParams.toString();
  const url = query ? `/api/incidents?${query}` : '/api/incidents';

  const response = await apiClient.get<IncidentsResponse>(url);
  return response.data;
}

export async function getIncidentById(id: number): Promise<Incident> {
  const response = await apiClient.get<Incident>(`/api/incidents/${id}`);
  return response.data;
}

export async function createIncident(
  data: CreateIncidentInput
): Promise<Incident> {
  const response = await apiClient.post<Incident>('/api/incidents', data);
  return response.data;
}

export async function updateIncident(
  id: number,
  data: UpdateIncidentInput
): Promise<Incident> {
  const response = await apiClient.patch<Incident>(
    `/api/incidents/${id}`,
    data
  );
  return response.data;
}

export async function deleteIncident(id: number): Promise<void> {
  await apiClient.delete(`/api/incidents/${id}`);
}
