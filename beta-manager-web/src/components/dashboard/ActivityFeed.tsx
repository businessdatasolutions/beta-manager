import { Card, CardHeader, CardTitle, CardContent, Badge } from '../ui';
import { MessageSquare, AlertTriangle, Mail } from 'lucide-react';
import type { ActivityItem } from '../../api/dashboard';

interface ActivityFeedProps {
  items: ActivityItem[];
  isLoading?: boolean;
}

const typeIcons = {
  communication: Mail,
  feedback: MessageSquare,
  incident: AlertTriangle,
};

const typeColors = {
  communication: 'secondary',
  feedback: 'default',
  incident: 'destructive',
} as const;

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function ActivityFeed({ items, isLoading }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-gray-500 text-sm">No recent activity</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const Icon = typeIcons[item.type];
              const badgeVariant = typeColors[item.type];

              return (
                <div key={`${item.type}-${item.id}`} className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={badgeVariant} className="text-xs">
                        {item.type}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {formatRelativeTime(item.date)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.title}
                    </p>
                    {item.tester_name && (
                      <p className="text-xs text-gray-500">
                        {item.tester_name}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
