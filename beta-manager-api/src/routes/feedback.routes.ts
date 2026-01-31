import { Router } from 'express';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createFeedbackSchema,
  updateFeedbackSchema,
  feedbackQuerySchema,
} from '../schemas/feedback.schema';
import {
  listFeedback,
  getFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,
} from '../controllers/feedback.controller';

const router = Router();

// GET /api/feedback - List all feedback with filters
router.get('/', validateQuery(feedbackQuerySchema), listFeedback);

// GET /api/feedback/:id - Get single feedback
router.get('/:id', getFeedback);

// POST /api/feedback - Create new feedback
router.post('/', validateBody(createFeedbackSchema), createFeedback);

// PATCH /api/feedback/:id - Update feedback
router.patch('/:id', validateBody(updateFeedbackSchema), updateFeedback);

// DELETE /api/feedback/:id - Delete feedback
router.delete('/:id', deleteFeedback);

export default router;
