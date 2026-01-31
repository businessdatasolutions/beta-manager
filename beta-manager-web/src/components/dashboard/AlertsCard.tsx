import { Card, CardHeader, CardTitle, CardContent, Badge } from '../ui';
import { AlertTriangle, UserX, MessageSquare } from 'lucide-react';
import type { AlertsResponse } from '../../api/dashboard';

interface AlertsCardProps {
  data: AlertsResponse;
  isLoading?: boolean;
}

export function AlertsCard({ data, isLoading }: AlertsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Needs Attention
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalAlerts =
    data.counts.inactive_testers +
    data.counts.pending_feedback +
    data.counts.open_incidents;

  if (totalAlerts === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-green-500" />
            Needs Attention
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-600 text-sm">All clear! No items need attention.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Needs Attention
          <Badge variant="warning">{totalAlerts}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Inactive Testers */}
        {data.inactive_testers.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <UserX className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">
                Inactive Testers ({data.counts.inactive_testers})
              </span>
            </div>
            <ul className="space-y-1 ml-6">
              {data.inactive_testers.slice(0, 3).map((tester) => (
                <li key={tester.id} className="text-sm text-gray-600">
                  {tester.name} - last active{' '}
                  {new Date(tester.last_active).toLocaleDateString()}
                </li>
              ))}
              {data.inactive_testers.length > 3 && (
                <li className="text-sm text-gray-400">
                  +{data.inactive_testers.length - 3} more
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Pending Feedback */}
        {data.pending_feedback.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">
                New Feedback ({data.counts.pending_feedback})
              </span>
            </div>
            <ul className="space-y-1 ml-6">
              {data.pending_feedback.slice(0, 3).map((feedback) => (
                <li key={feedback.id} className="text-sm text-gray-600">
                  {feedback.title}
                  {feedback.severity && (
                    <Badge
                      variant={feedback.severity === 'critical' ? 'destructive' : 'secondary'}
                      className="ml-2 text-xs"
                    >
                      {feedback.severity}
                    </Badge>
                  )}
                </li>
              ))}
              {data.pending_feedback.length > 3 && (
                <li className="text-sm text-gray-400">
                  +{data.pending_feedback.length - 3} more
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Open Incidents */}
        {data.open_incidents.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-gray-700">
                Open Incidents ({data.counts.open_incidents})
              </span>
            </div>
            <ul className="space-y-1 ml-6">
              {data.open_incidents.slice(0, 3).map((incident) => (
                <li key={incident.id} className="text-sm text-gray-600">
                  {incident.title}
                  <Badge
                    variant={incident.severity === 'critical' ? 'destructive' : 'warning'}
                    className="ml-2 text-xs"
                  >
                    {incident.severity}
                  </Badge>
                </li>
              ))}
              {data.open_incidents.length > 3 && (
                <li className="text-sm text-gray-400">
                  +{data.open_incidents.length - 3} more
                </li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
