import { Request, Response, NextFunction } from 'express';
import { baserow, BaserowError } from '../services/baserow.service';
import { NotFoundError, BadRequestError } from '../middleware/errorHandler';
import {
  CreateFeedbackInput,
  UpdateFeedbackInput,
  FeedbackQueryInput,
} from '../schemas/feedback.schema';
import { BaserowFeedback } from '../types/baserow';
import { FeedbackType, FeedbackSeverity, FeedbackStatus } from '../config/constants';

// Helper to transform Baserow feedback to API response
function transformFeedback(feedback: BaserowFeedback) {
  return {
    id: feedback.id,
    tester_id: feedback.tester?.[0]?.id,
    tester_name: feedback.tester?.[0]?.value,
    type: feedback.type as FeedbackType,
    severity: feedback.severity as FeedbackSeverity | undefined,
    title: feedback.title,
    content: feedback.content,
    status: feedback.status as FeedbackStatus,
    device_info: feedback.device_info,
    app_version: feedback.app_version,
    screenshot_url: feedback.screenshot_url,
    admin_notes: feedback.admin_notes,
    created_at: feedback.created_on,
    updated_at: feedback.updated_on,
  };
}

export async function listFeedback(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { tester_id, type, status, severity, page = 1, size = 20 } = req.query as unknown as FeedbackQueryInput;

    // Only pass non-single-select filters to Baserow
    const filters: Record<string, string> = {};
    if (tester_id) filters.tester = tester_id.toString();
    // Note: type, status, severity are single select fields - filtered in memory below

    // Fetch more records for in-memory filtering
    const fetchSize = (type || status || severity) ? 200 : size;

    const result = await baserow.listRows<BaserowFeedback>('feedback', {
      page: (type || status || severity) ? 1 : page,
      size: fetchSize,
      orderBy: '-created_on',
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    });

    // In-memory filtering for text fields
    let filtered = result.results;
    if (type) {
      filtered = filtered.filter(f => f.type === type);
    }
    if (status) {
      filtered = filtered.filter(f => f.status === status);
    }
    if (severity) {
      filtered = filtered.filter(f => f.severity === severity);
    }

    // Apply pagination to filtered results
    const totalFiltered = filtered.length;
    const startIndex = (page - 1) * size;
    const paginatedResults = filtered.slice(startIndex, startIndex + size);

    res.json({
      results: paginatedResults.map(transformFeedback),
      count: totalFiltered,
      page,
      size,
    });
  } catch (error) {
    next(error);
  }
}

export async function getFeedback(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      throw new BadRequestError('Invalid feedback ID');
    }

    const feedback = await baserow.getRow<BaserowFeedback>('feedback', id);
    res.json(transformFeedback(feedback));
  } catch (error) {
    if (error instanceof BaserowError && error.statusCode === 404) {
      return next(new NotFoundError('Feedback not found'));
    }
    next(error);
  }
}

export async function createFeedback(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { tester_id, type, severity, title, content, device_info, app_version, screenshot_url } = req.body as CreateFeedbackInput;

    const feedback = await baserow.createRow<BaserowFeedback>('feedback', {
      tester: [tester_id],
      type,
      severity,
      title,
      content,
      status: 'new',
      device_info,
      app_version,
      screenshot_url,
    });

    res.status(201).json(transformFeedback(feedback));
  } catch (error) {
    next(error);
  }
}

export async function updateFeedback(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      throw new BadRequestError('Invalid feedback ID');
    }

    const { type, severity, title, content, status, admin_notes } = req.body as UpdateFeedbackInput;

    const updateData: Record<string, unknown> = {};
    if (type !== undefined) updateData.type = type;
    if (severity !== undefined) updateData.severity = severity;
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (status !== undefined) updateData.status = status;
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes;

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestError('No fields to update');
    }

    const feedback = await baserow.updateRow<BaserowFeedback>('feedback', id, updateData);
    res.json(transformFeedback(feedback));
  } catch (error) {
    if (error instanceof BaserowError && error.statusCode === 404) {
      return next(new NotFoundError('Feedback not found'));
    }
    next(error);
  }
}

export async function deleteFeedback(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      throw new BadRequestError('Invalid feedback ID');
    }

    await baserow.deleteRow('feedback', id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof BaserowError && error.statusCode === 404) {
      return next(new NotFoundError('Feedback not found'));
    }
    next(error);
  }
}
