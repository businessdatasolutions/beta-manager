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
    type: incident.type as IncidentType,
    severity: incident.severity as IncidentSeverity,
    title: incident.title,
    description: incident.description,
    status: incident.status as IncidentStatus,
    source: incident.source,
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

    // Only pass non-single-select filters to Baserow
    const filters: Record<string, string> = {};
    if (tester_id) filters.tester = tester_id.toString();
    // Note: type, status, severity are single select fields - filtered in memory below

    // Fetch more records for in-memory filtering
    const fetchSize = (type || status || severity) ? 200 : size;

    const result = await baserow.listRows<BaserowIncident>('incidents', {
      page: (type || status || severity) ? 1 : page,
      size: fetchSize,
      orderBy: '-created_on',
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    });

    // In-memory filtering for text fields
    let filtered = result.results;
    if (type) {
      filtered = filtered.filter(i => i.type === type);
    }
    if (status) {
      filtered = filtered.filter(i => i.status === status);
    }
    if (severity) {
      filtered = filtered.filter(i => i.severity === severity);
    }

    // Apply pagination to filtered results
    const totalFiltered = filtered.length;
    const startIndex = (page - 1) * size;
    const paginatedResults = filtered.slice(startIndex, startIndex + size);

    res.json({
      results: paginatedResults.map(transformIncident),
      count: totalFiltered,
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

    // Only add tester reference if provided
    if (tester_id) {
      incidentData.tester = tester_id.toString();
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
