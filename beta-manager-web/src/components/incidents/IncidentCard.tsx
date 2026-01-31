import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select } from '../ui/select';
import type { Incident, IncidentStatus } from '../../types/incident';

interface IncidentCardProps {
  incident: Incident;
  onStatusChange?: (id: number, status: IncidentStatus) => void;
  onViewDetails?: (id: number) => void;
}

const STATUS_COLORS: Record<IncidentStatus, string> = {
  open: 'bg-red-100 text-red-800',
  investigating: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
};

const STATUS_LABELS: Record<IncidentStatus, string> = {
  open: 'Open',
  investigating: 'Investigating',
  resolved: 'Resolved',
};

const TYPE_LABELS: Record<string, string> = {
  crash: 'Crash',
  bug: 'Bug',
  ux_complaint: 'UX Complaint',
  dropout: 'Dropout',
  uninstall: 'Uninstall',
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

export function IncidentCard({
  incident,
  onStatusChange,
  onViewDetails,
}: IncidentCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-medium leading-tight">
            {incident.title}
          </CardTitle>
          <div className="flex gap-2 flex-shrink-0">
            <Badge className={STATUS_COLORS[incident.status]}>
              {STATUS_LABELS[incident.status]}
            </Badge>
            <Badge className={SEVERITY_COLORS[incident.severity]}>
              {incident.severity}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700">
              {TYPE_LABELS[incident.type] || incident.type}
            </span>
            <span>&bull;</span>
            <span>{formatDate(incident.created_at)}</span>
            {incident.source !== 'manual' && (
              <>
                <span>&bull;</span>
                <span className="capitalize">{incident.source}</span>
              </>
            )}
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">
            {incident.description}
          </p>

          {incident.resolved_at && (
            <div className="text-xs text-green-600">
              Resolved: {formatDate(incident.resolved_at)}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            {onStatusChange && incident.status !== 'resolved' && (
              <Select
                value={incident.status}
                onChange={(e) =>
                  onStatusChange(incident.id, e.target.value as IncidentStatus)
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
            {incident.status === 'resolved' && (
              <span className="text-sm text-green-600 font-medium">
                Resolved
              </span>
            )}
            {onViewDetails && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(incident.id)}
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
