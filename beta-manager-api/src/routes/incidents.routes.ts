import { Router } from 'express';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createIncidentSchema,
  updateIncidentSchema,
  incidentQuerySchema,
} from '../schemas/incident.schema';
import {
  listIncidents,
  getIncident,
  createIncident,
  updateIncident,
  deleteIncident,
} from '../controllers/incidents.controller';

const router = Router();

// GET /api/incidents - List all incidents with filters
router.get('/', validateQuery(incidentQuerySchema), listIncidents);

// GET /api/incidents/:id - Get single incident
router.get('/:id', getIncident);

// POST /api/incidents - Create new incident
router.post('/', validateBody(createIncidentSchema), createIncident);

// PATCH /api/incidents/:id - Update incident
router.patch('/:id', validateBody(updateIncidentSchema), updateIncident);

// DELETE /api/incidents/:id - Delete incident
router.delete('/:id', deleteIncident);

export default router;
