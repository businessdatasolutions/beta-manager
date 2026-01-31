import { Router } from 'express';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createCommunicationSchema,
  communicationQuerySchema,
} from '../schemas/communication.schema';
import {
  listCommunications,
  getCommunication,
  createCommunication,
} from '../controllers/communications.controller';

const router = Router();

// GET /api/communications - List all communications with filters
router.get('/', validateQuery(communicationQuerySchema), listCommunications);

// GET /api/communications/:id - Get single communication
router.get('/:id', getCommunication);

// POST /api/communications - Log a manual communication
router.post('/', validateBody(createCommunicationSchema), createCommunication);

export default router;
