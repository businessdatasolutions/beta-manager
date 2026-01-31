import { Request, Response, NextFunction } from 'express';
import { baserow, BaserowError } from '../services/baserow.service';
import { NotFoundError, BadRequestError } from '../middleware/errorHandler';
import {
  CreateIncidentInput,
  UpdateIncidentInput,
  IncidentQueryInput,
} from '../schemas/incident.schema';
import { BaserowIncident } from '../types/baserow';
import { IncidentType, IncidentSeverity, IncidentStatus } from '../config/constants';
import { formatDateForBaserow } from '../utils/dates';

// Helper to transform Baserow incident to API response
function transformIncident(incident: BaserowIncident) {
  return {
    id: incident.id,
    tester_id: incident.tester?.[0]?.id,
    tester_name: incident.tester?.[0]?.value,
    type: incident.type?.value as IncidentType,
    severity: incident.severity?.value as IncidentSeverity,
    title: incident.title,
    description: incident.description,
    status: incident.status?.value as IncidentStatus,
    source: incident.source?.value,
    crash_id: incident.crash_id,
    resolved_at: incident.resolved_at,
    resolution_notes: incident.resolution_notes,
    created_at: incident.created_on,
    updated_at: incident.updated_on,
  };
}

export async function listIncidents(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { tester_id, type, status, severity, page = 1, size = 20 } = req.query as unknown as IncidentQueryInput;

    const filters: Record<string, string> = {};
    if (tester_id) filters.tester = tester_id.toString();
    if (type) filters.type = type;
    if (status) filters.status = status;
    if (severity) filters.severity = severity;

    const result = await baserow.listRows<BaserowIncident>('incidents', {
      page,
      size,
      orderBy: '-created_on',
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    });

    res.json({
      results: result.results.map(transformIncident),
      count: result.count,
      page,
      size,
    });
  } catch (error) {
    next(error);
  }
}

export async function getIncident(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      throw new BadRequestError('Invalid incident ID');
    }

    const incident = await baserow.getRow<BaserowIncident>('incidents', id);
    res.json(transformIncident(incident));
  } catch (error) {
    if (error instanceof BaserowError && error.statusCode === 404) {
      return next(new NotFoundError('Incident not found'));
    }
    next(error);
  }
}

export async function createIncident(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { tester_id, type, severity, title, description, source, crash_id } = req.body as CreateIncidentInput;

    const incidentData: Record<string, unknown> = {
      type,
      severity,
      title,
      description,
      status: 'open',
      source,
      crash_id,
    };

    // Only add tester link if provided
    if (tester_id) {
      incidentData.tester = [tester_id];
    }

    const incident = await baserow.createRow<BaserowIncident>('incidents', incidentData);
    res.status(201).json(transformIncident(incident));
  } catch (error) {
    next(error);
  }
}

export async function updateIncident(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      throw new BadRequestError('Invalid incident ID');
    }

    const { type, severity, title, description, status, resolution_notes } = req.body as UpdateIncidentInput;

    const updateData: Record<string, unknown> = {};
    if (type !== undefined) updateData.type = type;
    if (severity !== undefined) updateData.severity = severity;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) {
      updateData.status = status;
      // Set resolved_at when status changes to resolved
      if (status === 'resolved') {
        updateData.resolved_at = formatDateForBaserow(new Date());
      }
    }
    if (resolution_notes !== undefined) updateData.resolution_notes = resolution_notes;

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestError('No fields to update');
    }

    const incident = await baserow.updateRow<BaserowIncident>('incidents', id, updateData);
    res.json(transformIncident(incident));
  } catch (error) {
    if (error instanceof BaserowError && error.statusCode === 404) {
      return next(new NotFoundError('Incident not found'));
    }
    next(error);
  }
}

export async function deleteIncident(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      throw new BadRequestError('Invalid incident ID');
    }

    await baserow.deleteRow('incidents', id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof BaserowError && error.statusCode === 404) {
      return next(new NotFoundError('Incident not found'));
    }
    next(error);
  }
}
