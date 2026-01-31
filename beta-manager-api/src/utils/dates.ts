import { TEST_DURATION_DAYS } from '../config/constants';

/**
 * Calculate the number of days since the test started
 */
export function calculateDaysInTest(startedAt?: string | null): number {
  if (!startedAt) return 0;

  const startDate = new Date(startedAt);
  const now = new Date();
  const diffMs = now.getTime() - startDate.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(0, days);
}

/**
 * Calculate the number of days remaining in the test period
 */
export function calculateDaysRemaining(startedAt?: string | null): number {
  if (!startedAt) return TEST_DURATION_DAYS;

  const daysInTest = calculateDaysInTest(startedAt);
  return Math.max(0, TEST_DURATION_DAYS - daysInTest);
}

/**
 * Check if a tester is inactive based on their last_active date
 */
export function isInactive(lastActive?: string | null, thresholdDays: number = 3): boolean {
  if (!lastActive) return false;

  const lastActiveDate = new Date(lastActive);
  const now = new Date();
  const diffMs = now.getTime() - lastActiveDate.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return days >= thresholdDays;
}

/**
 * Format a Date object for Baserow (ISO string)
 */
export function formatDateForBaserow(date: Date): string {
  return date.toISOString();
}

/**
 * Get date N days from now
 */
export function getDatePlusDays(days: number, fromDate: Date = new Date()): Date {
  const result = new Date(fromDate);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Check if test period is complete
 */
export function isTestComplete(startedAt?: string | null): boolean {
  if (!startedAt) return false;
  return calculateDaysRemaining(startedAt) === 0;
}
