export type CommunicationChannel = 'email' | 'whatsapp' | 'linkedin' | 'phone' | 'other';
export type CommunicationDirection = 'outbound' | 'inbound';
export type CommunicationStatus = 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';

export interface Communication {
  id: number;
  tester_id: number;
  channel: CommunicationChannel;
  direction: CommunicationDirection;
  subject?: string;
  content: string;
  template_name?: string;
  status?: CommunicationStatus;
  sent_at: string;
  opened_at?: string;
  clicked_at?: string;
  created_at: string;
}
