import { baserow } from '../services/baserow.service';
import { templateService } from '../services/template.service';
import { logger } from '../utils/logger';
import { BaserowTester } from '../types/baserow';
import { calculateDaysInTest } from '../utils/dates';

// Email schedule: day -> template name
const EMAIL_SCHEDULE: Record<number, string> = {
  3: 'day_3_checkin',
  7: 'day_7_midpoint',
  12: 'day_12_wrapup',
  14: 'day_14_completion',
};

// Stages that should receive scheduled emails
const ACTIVE_STAGES = ['active', 'onboarded', 'installed'];

/**
 * Process a single tester for scheduled emails
 */
export async function processTester(tester: BaserowTester): Promise<{
  testerId: number;
  action: 'email_sent' | 'marked_complete' | 'skipped' | 'error';
  day?: number;
  template?: string;
  error?: string;
}> {
  const testerId = tester.id;

  // Skip if no started_at date
  if (!tester.started_at) {
    return { testerId, action: 'skipped', error: 'No started_at date' };
  }

  // Skip if not in active stage
  const stage = tester.stage;
  if (!stage || !ACTIVE_STAGES.includes(stage)) {
    return { testerId, action: 'skipped', error: `Stage ${stage} not in active stages` };
  }

  const daysInTest = calculateDaysInTest(tester.started_at);
  const templateName = EMAIL_SCHEDULE[daysInTest];

  // No email scheduled for this day
  if (!templateName) {
    return { testerId, action: 'skipped', day: daysInTest };
  }

  try {
    // Send the scheduled email
    const result = await templateService.sendTemplateEmail(tester, templateName);

    if (!result.success) {
      logger.warn('Failed to send scheduled email', {
        testerId,
        day: daysInTest,
        template: templateName,
        error: result.error,
      });
      return { testerId, action: 'error', day: daysInTest, template: templateName, error: result.error };
    }

    logger.info('Sent scheduled email', {
      testerId,
      day: daysInTest,
      template: templateName,
    });

    // On day 14, mark tester as completed
    if (daysInTest === 14) {
      await baserow.updateRow('testers', testerId, {
        stage: 'completed',
        completed_at: new Date().toISOString(),
      });

      logger.info('Marked tester as completed', { testerId });
      return { testerId, action: 'marked_complete', day: daysInTest, template: templateName };
    }

    return { testerId, action: 'email_sent', day: daysInTest, template: templateName };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error processing tester for daily email', {
      testerId,
      day: daysInTest,
      error: errorMessage,
    });
    return { testerId, action: 'error', day: daysInTest, template: templateName, error: errorMessage };
  }
}

/**
 * Run the daily email job
 * Queries all active testers and sends scheduled emails based on days in test
 */
export async function runDailyEmailJob(): Promise<{
  processed: number;
  emailsSent: number;
  completed: number;
  errors: number;
}> {
  logger.info('Starting daily email job');

  const stats = {
    processed: 0,
    emailsSent: 0,
    completed: 0,
    errors: 0,
  };

  try {
    // Fetch all testers (we'll filter in memory for simplicity)
    // In production, you might want to add Baserow filters
    const result = await baserow.listRows<BaserowTester>('testers', {
      size: 1000,
    });

    const testers = result.results.filter((t) => {
      const stage = t.stage;
      return stage && ACTIVE_STAGES.includes(stage) && t.started_at;
    });

    logger.info(`Found ${testers.length} active testers to process`);

    // Process each tester
    for (const tester of testers) {
      const result = await processTester(tester);
      stats.processed++;

      switch (result.action) {
        case 'email_sent':
          stats.emailsSent++;
          break;
        case 'marked_complete':
          stats.emailsSent++;
          stats.completed++;
          break;
        case 'error':
          stats.errors++;
          break;
      }
    }

    logger.info('Daily email job completed', stats);
  } catch (error) {
    logger.error('Daily email job failed', { error });
    throw error;
  }

  return stats;
}
