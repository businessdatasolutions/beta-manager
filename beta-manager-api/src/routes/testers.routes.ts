import { Router } from 'express';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createTesterSchema,
  updateTesterSchema,
  updateStageSchema,
  testerQuerySchema,
  sendEmailSchema,
} from '../schemas/tester.schema';
import {
  listTesters,
  getTester,
  createTester,
  updateTester,
  deleteTester,
  updateStage,
  getTesterTimeline,
  renderEmail,
} from '../controllers/testers.controller';

const router = Router();

// GET /api/testers - List all testers with filters
router.get('/', validateQuery(testerQuerySchema), listTesters);

// GET /api/testers/:id - Get single tester with stats
router.get('/:id', getTester);

// POST /api/testers - Create new tester
router.post('/', validateBody(createTesterSchema), createTester);

// PATCH /api/testers/:id - Update tester
router.patch('/:id', validateBody(updateTesterSchema), updateTester);

// DELETE /api/testers/:id - Delete tester
router.delete('/:id', deleteTester);

// POST /api/testers/:id/stage - Update tester stage with history
router.post('/:id/stage', validateBody(updateStageSchema), updateStage);

// GET /api/testers/:id/timeline - Get tester timeline
router.get('/:id/timeline', getTesterTimeline);

// POST /api/testers/:id/render-email - Render email content for copying
router.post('/:id/render-email', validateBody(sendEmailSchema), renderEmail);

export default router;
