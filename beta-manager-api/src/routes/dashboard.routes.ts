import { Router } from 'express';
import {
  getStats,
  getFunnel,
  getActivity,
  getAlerts,
} from '../controllers/dashboard.controller';

const router = Router();

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', getStats);

// GET /api/dashboard/funnel - Get tester funnel (count per stage)
router.get('/funnel', getFunnel);

// GET /api/dashboard/activity - Get recent activity feed
router.get('/activity', getActivity);

// GET /api/dashboard/alerts - Get items needing attention
router.get('/alerts', getAlerts);

export default router;
