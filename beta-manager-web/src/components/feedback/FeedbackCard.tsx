import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select } from '../ui/select';
import type { Feedback, FeedbackStatus } from '../../types/feedback';

interface FeedbackCardProps {
  feedback: Feedback;
  onStatusChange?: (id: number, status: FeedbackStatus) => void;
  onViewDetails?: (id: number) => void;
}

const STATUS_COLORS: Record<FeedbackStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  in_review: 'bg-yellow-100 text-yellow-800',
  addressed: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  new: 'New',
  in_review: 'In Review',
  addressed: 'Addressed',
  closed: 'Closed',
};

const TYPE_LABELS: Record<string, string> = {
  bug: 'Bug',
  feature_request: 'Feature Request',
  ux_issue: 'UX Issue',
  general: 'General',
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-800',
  major: 'bg-orange-100 text-orange-800',
  minor: 'bg-yellow-100 text-yellow-800',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function FeedbackCard({
  feedback,
  onStatusChange,
  onViewDetails,
}: FeedbackCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-medium leading-tight">
            {feedback.title}
          </CardTitle>
          <div className="flex gap-2 flex-shrink-0">
            <Badge className={STATUS_COLORS[feedback.status]}>
              {STATUS_LABELS[feedback.status]}
            </Badge>
            {feedback.severity && (
              <Badge className={SEVERITY_COLORS[feedback.severity]}>
                {feedback.severity}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700">
              {TYPE_LABELS[feedback.type] || feedback.type}
            </span>
            <span>&bull;</span>
            <span>{formatDate(feedback.created_at)}</span>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">
            {feedback.content}
          </p>

          {(feedback.device_info || feedback.app_version) && (
            <div className="text-xs text-gray-400">
              {feedback.device_info && <span>{feedback.device_info}</span>}
              {feedback.device_info && feedback.app_version && (
                <span> &bull; </span>
              )}
              {feedback.app_version && <span>v{feedback.app_version}</span>}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            {onStatusChange && (
              <Select
                value={feedback.status}
                onChange={(e) =>
                  onStatusChange(feedback.id, e.target.value as FeedbackStatus)
                }
                className="w-36 h-8 text-sm"
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
            {onViewDetails && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(feedback.id)}
              >
                View Details
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
