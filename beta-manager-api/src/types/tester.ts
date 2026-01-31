export type TesterStage =
  | 'prospect'
  | 'invited'
  | 'accepted'
  | 'installed'
  | 'onboarded'
  | 'active'
  | 'completed'
  | 'transitioned'
  | 'declined'
  | 'dropped_out'
  | 'unresponsive';

export type TesterSource = 'email' | 'linkedin' | 'whatsapp' | 'referral' | 'other';

export interface Tester {
  id: number;
  name: string;
  email: string;
  phone?: string;
  source: TesterSource;
  stage: TesterStage;
  invited_at?: string;
  started_at?: string;
  last_active?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TesterWithStats extends Tester {
  days_in_test: number;
  days_remaining: number;
  feedback_count: number;
  incident_count: number;
}

export interface CreateTesterInput {
  name: string;
  email: string;
  phone?: string;
  source: TesterSource;
  notes?: string;
}

export interface UpdateTesterInput {
  name?: string;
  email?: string;
  phone?: string;
  source?: TesterSource;
  stage?: TesterStage;
  notes?: string;
  last_active?: string;
}
