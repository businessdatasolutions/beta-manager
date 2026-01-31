import { Router } from 'express';
import { login, logout, me } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { loginSchema } from '../schemas/auth.schema';

const router = Router();

router.post('/login', validateBody(loginSchema), login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

export default router;
