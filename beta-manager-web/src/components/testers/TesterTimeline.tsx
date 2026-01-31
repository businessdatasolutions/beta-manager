import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import type { TesterTimelineItem } from '../../api/testers';

interface TesterTimelineProps {
  items: TesterTimelineItem[];
  isLoading?: boolean;
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getTypeColor(type: TesterTimelineItem['type']): string {
  switch (type) {
    case 'communication':
      return 'bg-blue-100 text-blue-800';
    case 'feedback':
      return 'bg-purple-100 text-purple-800';
    case 'incident':
      return 'bg-red-100 text-red-800';
    case 'stage_change':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getTypeLabel(type: TesterTimelineItem['type']): string {
  switch (type) {
    case 'communication':
      return 'Email';
    case 'feedback':
      return 'Feedback';
    case 'incident':
      return 'Incident';
    case 'stage_change':
      return 'Stage Change';
    default:
      return type;
  }
}

function getItemDescription(item: TesterTimelineItem): string {
  const data = item.data as unknown;
  switch (item.type) {
    case 'communication': {
      const comm = data as { subject?: string; channel: string };
      return comm.subject || `${comm.channel} communication`;
    }
    case 'feedback': {
      const fb = data as { type: string; summary: string };
      return `${fb.type}: ${fb.summary}`;
    }
    case 'incident': {
      const inc = data as { type: string; description: string };
      return `${inc.type}: ${inc.description}`;
    }
    case 'stage_change': {
      const sc = data as { from_stage: string; to_stage: string };
      return `Changed from ${sc.from_stage} to ${sc.to_stage}`;
    }
    default:
      return '';
  }
}

export function TesterTimeline({ items, isLoading }: TesterTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="py-4">
              <div className="flex items-start gap-4">
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500">No timeline events yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={`${item.type}-${item.id}`}>
          <CardContent className="py-4">
            <div className="flex items-start gap-4">
              <Badge className={getTypeColor(item.type)}>
                {getTypeLabel(item.type)}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">
                  {formatDateTime(item.timestamp)}
                </p>
                <p className="mt-1 text-gray-900">{getItemDescription(item)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
