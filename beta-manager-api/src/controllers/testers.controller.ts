import { Request, Response, NextFunction } from 'express';
import { baserow, BaserowError } from '../services/baserow.service';
import { NotFoundError, BadRequestError } from '../middleware/errorHandler';
import {
  CreateTesterInput,
  UpdateTesterInput,
  UpdateStageInput,
  TesterQueryInput,
} from '../schemas/tester.schema';
import {
  BaserowTester,
  BaserowFeedback,
  BaserowIncident,
  BaserowCommunication,
} from '../types/baserow';
import { TEST_DURATION_DAYS, TesterStage } from '../config/constants';
import { calculateDaysInTest, calculateDaysRemaining, formatDateForBaserow } from '../utils/dates';

// Helper to transform Baserow tester to API response
function transformTester(tester: BaserowTester) {
  return {
    id: tester.id,
    name: tester.name,
    email: tester.email,
    phone: tester.phone,
    source: tester.source?.value,
    stage: tester.stage?.value as TesterStage,
    invited_at: tester.invited_at,
    started_at: tester.started_at,
    last_active: tester.last_active,
    completed_at: tester.completed_at,
    notes: tester.notes,
    created_at: tester.created_on,
    updated_at: tester.updated_on,
  };
}

// Helper to add computed stats to tester
function addTesterStats(
  tester: ReturnType<typeof transformTester>,
  feedbackCount: number,
  incidentCount: number
) {
  return {
    ...tester,
    days_in_test: calculateDaysInTest(tester.started_at),
    days_remaining: calculateDaysRemaining(tester.started_at),
    feedback_count: feedbackCount,
    incident_count: incidentCount,
  };
}

export async function listTesters(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { stage, source, search, page = 1, size = 20, orderBy } = req.query as unknown as TesterQueryInput;

    const filters: Record<string, string> = {};
    if (stage) filters.stage = stage;
    if (source) filters.source = source;

    const result = await baserow.listRows<BaserowTester>('testers', {
      page,
      size,
      orderBy: orderBy || '-created_on',
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    });

    // Transform results
    let testers = result.results.map(transformTester);

    // Client-side search filter (Baserow doesn't support full-text search natively)
    if (search) {
      const searchLower = search.toLowerCase();
      testers = testers.filter(
        (t) =>
          t.name.toLowerCase().includes(searchLower) ||
          t.email.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      results: testers,
      count: search ? testers.length : result.count,
      page,
      size,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTester(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      throw new BadRequestError('Invalid tester ID');
    }

    const tester = await baserow.getRow<BaserowTester>('testers', id);
    const transformed = transformTester(tester);

    // Get feedback and incident counts
    const [feedbackResult, incidentResult] = await Promise.all([
      baserow.listRows<BaserowFeedback>('feedback', {
        filters: { tester: id.toString() },
        size: 1,
      }),
      baserow.listRows<BaserowIncident>('incidents', {
        filters: { tester: id.toString() },
        size: 1,
      }),
    ]);

    const testerWithStats = addTesterStats(
      transformed,
      feedbackResult.count,
      incidentResult.count
    );

    res.json(testerWithStats);
  } catch (error) {
    if (error instanceof BaserowError && error.statusCode === 404) {
      return next(new NotFoundError('Tester not found'));
    }
    next(error);
  }
}

export async function createTester(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, email, phone, source, notes } = req.body as CreateTesterInput;

    // Create with default stage 'prospect'
    const tester = await baserow.createRow<BaserowTester>('testers', {
      name,
      email,
      phone,
      source,
      stage: 'prospect',
      notes,
    });

    res.status(201).json(transformTester(tester));
  } catch (error) {
    next(error);
  }
}

export async function updateTester(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      throw new BadRequestError('Invalid tester ID');
    }

    // Only include defined fields
    const updateData: Record<string, unknown> = {};
    const { name, email, phone, source, stage, notes, last_active } = req.body as UpdateTesterInput;

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (source !== undefined) updateData.source = source;
    if (stage !== undefined) updateData.stage = stage;
    if (notes !== undefined) updateData.notes = notes;
    if (last_active !== undefined) updateData.last_active = last_active;

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestError('No fields to update');
    }

    const tester = await baserow.updateRow<BaserowTester>('testers', id, updateData);
    res.json(transformTester(tester));
  } catch (error) {
    if (error instanceof BaserowError && error.statusCode === 404) {
      return next(new NotFoundError('Tester not found'));
    }
    next(error);
  }
}

export async function deleteTester(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      throw new BadRequestError('Invalid tester ID');
    }

    await baserow.deleteRow('testers', id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof BaserowError && error.statusCode === 404) {
      return next(new NotFoundError('Tester not found'));
    }
    next(error);
  }
}

export async function updateStage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      throw new BadRequestError('Invalid tester ID');
    }

    const { stage } = req.body as UpdateStageInput;
    const now = formatDateForBaserow(new Date());

    // Build update data with appropriate timestamps
    const updateData: Record<string, unknown> = { stage };

    switch (stage) {
      case 'invited':
        updateData.invited_at = now;
        break;
      case 'active':
      case 'onboarded':
        // Set started_at when tester becomes active if not already set
        const existing = await baserow.getRow<BaserowTester>('testers', id);
        if (!existing.started_at) {
          updateData.started_at = now;
        }
        updateData.last_active = now;
        break;
      case 'completed':
      case 'transitioned':
        updateData.completed_at = now;
        break;
    }

    const tester = await baserow.updateRow<BaserowTester>('testers', id, updateData);
    res.json(transformTester(tester));
  } catch (error) {
    if (error instanceof BaserowError && error.statusCode === 404) {
      return next(new NotFoundError('Tester not found'));
    }
    next(error);
  }
}

export async function getTesterTimeline(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      throw new BadRequestError('Invalid tester ID');
    }

    // Verify tester exists
    await baserow.getRow<BaserowTester>('testers', id);

    // Fetch communications for this tester
    const communications = await baserow.listRows<BaserowCommunication>('communications', {
      filters: { tester: id.toString() },
      orderBy: '-sent_at',
      size: 50,
    });

    // Fetch feedback for this tester
    const feedback = await baserow.listRows<BaserowFeedback>('feedback', {
      filters: { tester: id.toString() },
      orderBy: '-created_on',
      size: 50,
    });

    // Fetch incidents for this tester
    const incidents = await baserow.listRows<BaserowIncident>('incidents', {
      filters: { tester: id.toString() },
      orderBy: '-created_on',
      size: 50,
    });

    // Combine into timeline
    const timeline = [
      ...communications.results.map((c) => ({
        type: 'communication' as const,
        id: c.id,
        date: c.sent_at,
        title: c.subject || `${c.channel?.value} ${c.direction?.value}`,
        description: c.content?.substring(0, 100) + (c.content?.length > 100 ? '...' : ''),
      })),
      ...feedback.results.map((f) => ({
        type: 'feedback' as const,
        id: f.id,
        date: f.created_on,
        title: f.title,
        description: f.content?.substring(0, 100) + (f.content?.length > 100 ? '...' : ''),
        metadata: { feedbackType: f.type?.value, severity: f.severity?.value },
      })),
      ...incidents.results.map((i) => ({
        type: 'incident' as const,
        id: i.id,
        date: i.created_on,
        title: i.title,
        description: i.description?.substring(0, 100) + (i.description?.length > 100 ? '...' : ''),
        metadata: { incidentType: i.type?.value, severity: i.severity?.value, status: i.status?.value },
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json({ timeline });
  } catch (error) {
    if (error instanceof BaserowError && error.statusCode === 404) {
      return next(new NotFoundError('Tester not found'));
    }
    next(error);
  }
}
