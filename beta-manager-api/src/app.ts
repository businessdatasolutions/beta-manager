import express, { Express, Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import { corsMiddleware } from './middleware/cors';
import { standardLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import authRoutes from './routes/auth.routes';
import testersRoutes from './routes/testers.routes';
import feedbackRoutes from './routes/feedback.routes';
import incidentsRoutes from './routes/incidents.routes';
import communicationsRoutes from './routes/communications.routes';
import dashboardRoutes from './routes/dashboard.routes';
import templatesRoutes from './routes/templates.routes';
import publicRoutes from './routes/public.routes';
import { authenticate } from './middleware/auth';

const app: Express = express();

// CORS middleware
app.use(corsMiddleware);

// Rate limiting
app.use(standardLimiter);

// Cookie parser
app.use(cookieParser());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    query: req.query,
    ip: req.ip,
  });
  next();
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/auth', authRoutes);
app.use('/api/testers', authenticate, testersRoutes);
app.use('/api/feedback', authenticate, feedbackRoutes);
app.use('/api/incidents', authenticate, incidentsRoutes);
app.use('/api/communications', authenticate, communicationsRoutes);
app.use('/api/dashboard', authenticate, dashboardRoutes);
app.use('/api/templates', authenticate, templatesRoutes);

// Public routes (no auth required, strict rate limiting)
app.use('/public', publicRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
