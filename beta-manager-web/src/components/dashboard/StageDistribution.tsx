import { Card, CardHeader, CardTitle, CardContent } from '../ui';
import { STAGE_LABELS, STAGE_COLORS, type TesterStage } from '../../lib/constants';
import type { FunnelItem } from '../../api/dashboard';

interface StageDistributionProps {
  data: FunnelItem[];
  total: number;
  isLoading?: boolean;
}

export function StageDistribution({ data, total, isLoading }: StageDistributionProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stage Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter to only show stages with counts > 0
  const activeStages = data.filter((item) => item.count > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stage Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {activeStages.length === 0 ? (
          <p className="text-gray-500 text-sm">No testers yet</p>
        ) : (
          <div className="space-y-3">
            {activeStages.map((item) => {
              const percentage = total > 0 ? (item.count / total) * 100 : 0;
              const stage = item.stage as TesterStage;
              const label = STAGE_LABELS[stage] || item.stage;
              const colorClass = STAGE_COLORS[stage] || 'bg-gray-100 text-gray-800';

              return (
                <div key={item.stage}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${colorClass}`}>
                      {label}
                    </span>
                    <span className="text-sm text-gray-600">
                      {item.count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
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
