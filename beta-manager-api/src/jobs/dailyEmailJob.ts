import { baserow } from '../services/baserow.service';
import { logger } from '../utils/logger';
import { BaserowTester } from '../types/baserow';
import { calculateDaysInTest } from '../utils/dates';

// Stages that should receive scheduled emails
const ACTIVE_STAGES = ['active', 'onboarded', 'installed'];

/**
 * Process a single tester - mark as completed on day 14
 */
export async function processTester(tester: BaserowTester): Promise<{
  testerId: number;
  action: 'marked_complete' | 'skipped' | 'error';
  day?: number;
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

  // On day 14 or later, mark tester as completed
  if (daysInTest >= 14) {
    try {
      await baserow.updateRow('testers', testerId, {
        stage: 'completed',
        completed_at: new Date().toISOString(),
      });

      logger.info('Marked tester as completed', { testerId, daysInTest });
      return { testerId, action: 'marked_complete', day: daysInTest };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error marking tester as completed', {
        testerId,
        error: errorMessage,
      });
      return { testerId, action: 'error', day: daysInTest, error: errorMessage };
    }
  }

  return { testerId, action: 'skipped', day: daysInTest };
}

/**
 * Run the daily job
 * Queries all active testers and marks those at 14+ days as completed
 */
export async function runDailyEmailJob(): Promise<{
  processed: number;
  completed: number;
  errors: number;
}> {
  logger.info('Starting daily completion check job');

  const stats = {
    processed: 0,
    completed: 0,
    errors: 0,
  };

  try {
    // Fetch all testers (we'll filter in memory for simplicity)
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
        case 'marked_complete':
          stats.completed++;
          break;
        case 'error':
          stats.errors++;
          break;
      }
    }

    logger.info('Daily completion check job completed', stats);
  } catch (error) {
    logger.error('Daily completion check job failed', { error });
    throw error;
  }

  return stats;
}
