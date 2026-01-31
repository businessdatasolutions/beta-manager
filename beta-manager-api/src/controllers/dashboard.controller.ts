import { Request, Response, NextFunction } from 'express';
import { baserow } from '../services/baserow.service';
import {
  BaserowTester,
  BaserowFeedback,
  BaserowIncident,
  BaserowCommunication,
} from '../types/baserow';
import { TESTER_STAGES, INACTIVITY_THRESHOLD_DAYS } from '../config/constants';
import { isInactive } from '../utils/dates';

// Active stages for retention calculation
const ACTIVE_STAGES = ['active', 'onboarded', 'installed', 'accepted'];
const COMPLETED_STAGES = ['completed', 'transitioned'];
const STARTED_STAGES = [...ACTIVE_STAGES, ...COMPLETED_STAGES, 'dropped_out', 'unresponsive'];

export async function getStats(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Fetch all testers to compute stats
    const testersResult = await baserow.listRows<BaserowTester>('testers', {
      size: 200, // Baserow max page size
    });

    const testers = testersResult.results;
    const totalTesters = testers.length;

    // Count active testers
    const activeCount = testers.filter(
      (t) => t.stage && ACTIVE_STAGES.includes(t.stage)
    ).length;

    // Fetch open incidents count
    const incidentsResult = await baserow.listRows<BaserowIncident>('incidents', {
      filters: { status: 'open' },
      size: 1,
    });
    const openIncidents = incidentsResult.count;

    // Calculate retention rate (completed / started)
    const startedCount = testers.filter(
      (t) => t.stage && STARTED_STAGES.includes(t.stage)
    ).length;
    const completedCount = testers.filter(
      (t) => t.stage && COMPLETED_STAGES.includes(t.stage)
    ).length;
    const retentionRate = startedCount > 0 ? Math.round((completedCount / startedCount) * 100) : 0;

    res.json({
      total_testers: totalTesters,
      active_count: activeCount,
      open_incidents: openIncidents,
      retention_rate: retentionRate,
      started_count: startedCount,
      completed_count: completedCount,
    });
  } catch (error) {
    next(error);
  }
}

export async function getFunnel(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Fetch all testers
    const testersResult = await baserow.listRows<BaserowTester>('testers', {
      size: 200, // Baserow max page size
    });

    const testers = testersResult.results;

    // Count testers per stage
    const stageCounts: Record<string, number> = {};
    for (const stage of TESTER_STAGES) {
      stageCounts[stage] = 0;
    }

    for (const tester of testers) {
      const stage = tester.stage;
      if (stage && stage in stageCounts) {
        stageCounts[stage]++;
      }
    }

    // Return as array with ordered stages
    const funnel = TESTER_STAGES.map((stage) => ({
      stage,
      count: stageCounts[stage],
    }));

    res.json({ funnel, total: testers.length });
  } catch (error) {
    next(error);
  }
}

export async function getActivity(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 20;

    // Fetch recent items in parallel
    const [communications, feedback, incidents] = await Promise.all([
      baserow.listRows<BaserowCommunication>('communications', {
        orderBy: '-sent_at',
        size: limit,
      }),
      baserow.listRows<BaserowFeedback>('feedback', {
        orderBy: '-created_on',
        size: limit,
      }),
      baserow.listRows<BaserowIncident>('incidents', {
        orderBy: '-created_on',
        size: limit,
      }),
    ]);

    // Build activity feed
    const activity = [
      ...communications.results.map((c) => ({
        type: 'communication' as const,
        id: c.id,
        date: c.sent_at,
        title: c.subject || `${c.channel?.value} ${c.direction?.value}`,
        description: c.content?.substring(0, 100) + (c.content?.length > 100 ? '...' : ''),
        tester_id: c.tester?.[0]?.id,
        tester_name: c.tester?.[0]?.value,
      })),
      ...feedback.results.map((f) => ({
        type: 'feedback' as const,
        id: f.id,
        date: f.created_on,
        title: f.title,
        description: f.content?.substring(0, 100) + (f.content?.length > 100 ? '...' : ''),
        tester_id: f.tester?.[0]?.id,
        tester_name: f.tester?.[0]?.value,
        metadata: {
          feedback_type: f.type?.value,
          severity: f.severity?.value,
          status: f.status?.value,
        },
      })),
      ...incidents.results.map((i) => ({
        type: 'incident' as const,
        id: i.id,
        date: i.created_on,
        title: i.title,
        description: i.description?.substring(0, 100) + (i.description?.length > 100 ? '...' : ''),
        tester_id: i.tester?.[0]?.id,
        tester_name: i.tester?.[0]?.value,
        metadata: {
          incident_type: i.type?.value,
          severity: i.severity?.value,
          status: i.status?.value,
        },
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);

    res.json({ activity });
  } catch (error) {
    next(error);
  }
}

export async function getAlerts(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Fetch data in parallel
    const [testersResult, feedbackResult, incidentsResult] = await Promise.all([
      baserow.listRows<BaserowTester>('testers', {
        size: 200, // Baserow max page size
      }),
      baserow.listRows<BaserowFeedback>('feedback', {
        filters: { status: 'new' },
        size: 100,
      }),
      baserow.listRows<BaserowIncident>('incidents', {
        filters: { status: 'open' },
        size: 100,
      }),
    ]);

    // Find inactive testers (active stage but inactive for 3+ days)
    const inactiveTesters = testersResult.results
      .filter((t) => {
        const stage = t.stage;
        if (!stage || !ACTIVE_STAGES.includes(stage)) return false;
        return isInactive(t.last_active, INACTIVITY_THRESHOLD_DAYS);
      })
      .map((t) => ({
        id: t.id,
        name: t.name,
        email: t.email,
        stage: t.stage,
        last_active: t.last_active,
      }));

    // Pending feedback (status = 'new')
    const pendingFeedback = feedbackResult.results.map((f) => ({
      id: f.id,
      title: f.title,
      type: f.type?.value,
      severity: f.severity?.value,
      tester_id: f.tester?.[0]?.id,
      tester_name: f.tester?.[0]?.value,
      created_at: f.created_on,
    }));

    // Open incidents
    const openIncidents = incidentsResult.results.map((i) => ({
      id: i.id,
      title: i.title,
      type: i.type?.value,
      severity: i.severity?.value,
      tester_id: i.tester?.[0]?.id,
      tester_name: i.tester?.[0]?.value,
      created_at: i.created_on,
    }));

    res.json({
      inactive_testers: inactiveTesters,
      pending_feedback: pendingFeedback,
      open_incidents: openIncidents,
      counts: {
        inactive_testers: inactiveTesters.length,
        pending_feedback: pendingFeedback.length,
        open_incidents: openIncidents.length,
      },
    });
  } catch (error) {
    next(error);
  }
}
