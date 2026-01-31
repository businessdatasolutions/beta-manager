import { Users, UserCheck, AlertTriangle, TrendingUp } from 'lucide-react';
import { useStats, useFunnel, useActivity, useAlerts } from '../hooks/useDashboard';
import {
  StatsCard,
  StageDistribution,
  ActivityFeed,
  AlertsCard,
} from '../components/dashboard';

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: funnel, isLoading: funnelLoading } = useFunnel();
  const { data: activity, isLoading: activityLoading } = useActivity(10);
  const { data: alerts, isLoading: alertsLoading } = useAlerts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Overview of your beta testing program
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Testers"
          value={stats?.total_testers ?? 0}
          icon={Users}
          isLoading={statsLoading}
        />
        <StatsCard
          title="Active Testers"
          value={stats?.active_count ?? 0}
          icon={UserCheck}
          description={`${stats?.started_count ?? 0} started testing`}
          isLoading={statsLoading}
        />
        <StatsCard
          title="Open Incidents"
          value={stats?.open_incidents ?? 0}
          icon={AlertTriangle}
          isLoading={statsLoading}
        />
        <StatsCard
          title="Retention Rate"
          value={`${stats?.retention_rate ?? 0}%`}
          icon={TrendingUp}
          description={`${stats?.completed_count ?? 0} completed`}
          isLoading={statsLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Stage Distribution */}
        <div className="lg:col-span-1">
          <StageDistribution
            data={funnel?.funnel ?? []}
            total={funnel?.total ?? 0}
            isLoading={funnelLoading}
          />
        </div>

        {/* Middle column - Activity Feed */}
        <div className="lg:col-span-1">
          <ActivityFeed
            items={activity?.activity ?? []}
            isLoading={activityLoading}
          />
        </div>

        {/* Right column - Alerts */}
        <div className="lg:col-span-1">
          {alerts && (
            <AlertsCard data={alerts} isLoading={alertsLoading} />
          )}
          {alertsLoading && <AlertsCard data={{
            inactive_testers: [],
            pending_feedback: [],
            open_incidents: [],
            counts: { inactive_testers: 0, pending_feedback: 0, open_incidents: 0 }
          }} isLoading={true} />}
        </div>
      </div>
    </div>
  );
}
