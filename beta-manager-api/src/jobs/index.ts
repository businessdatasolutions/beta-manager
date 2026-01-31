import cron from 'node-cron';
import { logger } from '../utils/logger';
import { runDailyEmailJob } from './dailyEmailJob';
import { runInactivityCheck } from './inactivityCheck';

// Cron schedules
// Daily email job: 9:00 AM every day
const DAILY_EMAIL_SCHEDULE = '0 9 * * *';

// Inactivity check job: 10:00 AM every day
const INACTIVITY_CHECK_SCHEDULE = '0 10 * * *';

/**
 * Initialize and start all scheduled jobs
 */
export function initializeScheduler(): void {
  logger.info('Initializing job scheduler');

  // Schedule daily email job
  cron.schedule(DAILY_EMAIL_SCHEDULE, async () => {
    logger.info('Running scheduled daily email job');
    try {
      await runDailyEmailJob();
    } catch (error) {
      logger.error('Scheduled daily email job failed', { error });
    }
  });

  logger.info('Daily email job scheduled', { schedule: DAILY_EMAIL_SCHEDULE });

  // Schedule inactivity check job
  cron.schedule(INACTIVITY_CHECK_SCHEDULE, async () => {
    logger.info('Running scheduled inactivity check job');
    try {
      await runInactivityCheck();
    } catch (error) {
      logger.error('Scheduled inactivity check job failed', { error });
    }
  });

  logger.info('Inactivity check job scheduled', { schedule: INACTIVITY_CHECK_SCHEDULE });

  logger.info('Job scheduler initialized successfully');
}

// Export job functions for manual execution or testing
export { runDailyEmailJob, runInactivityCheck };
