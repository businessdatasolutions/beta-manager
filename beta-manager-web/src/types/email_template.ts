export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEmailTemplateInput {
  name: string;
  subject: string;
  body: string;
  variables?: string[];
  is_active?: boolean;
}

export interface UpdateEmailTemplateInput {
  name?: string;
  subject?: string;
  body?: string;
  variables?: string[];
  is_active?: boolean;
}
