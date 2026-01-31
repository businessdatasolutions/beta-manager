import { apiClient } from './client';
import type { EmailTemplate } from '../types/email_template';

export interface TemplatesResponse {
  results: EmailTemplate[];
  count: number;
}

export async function getTemplates(): Promise<TemplatesResponse> {
  const response = await apiClient.get<TemplatesResponse>('/api/templates');
  return response.data;
}

export async function getTemplateByName(name: string): Promise<EmailTemplate> {
  const response = await apiClient.get<EmailTemplate>(`/api/templates/${name}`);
  return response.data;
}
