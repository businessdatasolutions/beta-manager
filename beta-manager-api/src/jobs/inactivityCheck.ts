import { baserow } from '../services/baserow.service';
import { templateService } from '../services/template.service';
import { logger } from '../utils/logger';
import { BaserowTester, BaserowIncident } from '../types/baserow';
import { isInactive } from '../utils/dates';
import { INACTIVITY_THRESHOLD_DAYS } from '../config/constants';

// Stages that should be checked for inactivity
const ACTIVE_STAGES = ['active', 'onboarded', 'installed'];

// Template for re-engagement email (optional)
const REENGAGEMENT_TEMPLATE = 'reengagement';

/**
 * Check if a dropout incident already exists for a tester
 */
export async function hasExistingDropoutIncident(testerId: number): Promise<boolean> {
  try {
    const result = await baserow.listRows<BaserowIncident>('incidents', {
      filters: {
        tester: testerId.toString(),
        type: 'dropout',
      },
      size: 1,
    });

    return result.count > 0;
  } catch (error) {
    logger.error('Failed to check for existing dropout incident', { testerId, error });
    return false; // Assume no incident exists, will create one
  }
}

/**
 * Create a dropout incident for an inactive tester
 */
export async function createDropoutIncident(tester: BaserowTester): Promise<BaserowIncident | null> {
  try {
    const incident = await baserow.createRow<BaserowIncident>('incidents', {
      tester: [tester.id],
      type: 'dropout',
      severity: 'major',
      title: `Inactive tester: ${tester.name}`,
      description: `Tester ${tester.name} (${tester.email}) has been inactive for more than ${INACTIVITY_THRESHOLD_DAYS} days. Last activity: ${tester.last_active || 'never'}`,
      status: 'open',
      source: 'automated',
    });

    logger.info('Created dropout incident', {
      testerId: tester.id,
      incidentId: incident.id,
    });

    return incident;
  } catch (error) {
    logger.error('Failed to create dropout incident', { testerId: tester.id, error });
    return null;
  }
}

/**
 * Optionally send a re-engagement email to an inactive tester
 */
export async function sendReengagementEmail(tester: BaserowTester): Promise<boolean> {
  try {
    const result = await templateService.sendTemplateEmail(tester, REENGAGEMENT_TEMPLATE);

    if (result.success) {
      logger.info('Sent re-engagement email', { testerId: tester.id });
      return true;
    } else {
      // Template might not exist, which is fine
      logger.debug('Could not send re-engagement email', {
        testerId: tester.id,
        error: result.error,
      });
      return false;
    }
  } catch (error) {
    logger.warn('Failed to send re-engagement email', { testerId: tester.id, error });
    return false;
  }
}

/**
 * Process a single tester for inactivity
 */
export async function processTesterInactivity(tester: BaserowTester): Promise<{
  testerId: number;
  action: 'incident_created' | 'already_exists' | 'not_inactive' | 'error';
  emailSent?: boolean;
  error?: string;
}> {
  const testerId = tester.id;

  // Check if tester is in an active stage
  const stage = tester.stage;
  if (!stage || !ACTIVE_STAGES.includes(stage)) {
    return { testerId, action: 'not_inactive' };
  }

  // Check if tester is inactive
  if (!isInactive(tester.last_active, INACTIVITY_THRESHOLD_DAYS)) {
    return { testerId, action: 'not_inactive' };
  }

  try {
    // Check if dropout incident already exists
    const exists = await hasExistingDropoutIncident(testerId);
    if (exists) {
      return { testerId, action: 'already_exists' };
    }

    // Create dropout incident
    const incident = await createDropoutIncident(tester);
    if (!incident) {
      return { testerId, action: 'error', error: 'Failed to create incident' };
    }

    // Optionally send re-engagement email
    const emailSent = await sendReengagementEmail(tester);

    return { testerId, action: 'incident_created', emailSent };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error processing tester inactivity', { testerId, error: errorMessage });
    return { testerId, action: 'error', error: errorMessage };
  }
}

/**
 * Run the inactivity check job
 * Queries all active testers and creates incidents for those inactive 3+ days
 */
export async function runInactivityCheck(): Promise<{
  processed: number;
  incidentsCreated: number;
  alreadyExists: number;
  emailsSent: number;
  errors: number;
}> {
  logger.info('Starting inactivity check job');

  const stats = {
    processed: 0,
    incidentsCreated: 0,
    alreadyExists: 0,
    emailsSent: 0,
    errors: 0,
  };

  try {
    // Fetch all testers
    const result = await baserow.listRows<BaserowTester>('testers', {
      size: 1000,
    });

    const testers = result.results.filter((t) => {
      const stage = t.stage;
      return stage && ACTIVE_STAGES.includes(stage);
    });

    logger.info(`Checking ${testers.length} active testers for inactivity`);

    // Process each tester
    for (const tester of testers) {
      const result = await processTesterInactivity(tester);
      stats.processed++;

      switch (result.action) {
        case 'incident_created':
          stats.incidentsCreated++;
          if (result.emailSent) {
            stats.emailsSent++;
          }
          break;
        case 'already_exists':
          stats.alreadyExists++;
          break;
        case 'error':
          stats.errors++;
          break;
      }
    }

    logger.info('Inactivity check job completed', stats);
  } catch (error) {
    logger.error('Inactivity check job failed', { error });
    throw error;
  }

  return stats;
}
