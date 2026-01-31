import {
  calculateDaysInTest,
  calculateDaysRemaining,
  isInactive,
  formatDateForBaserow,
  getDatePlusDays,
  isTestComplete,
} from '../../../src/utils/dates';

describe('Date utilities', () => {
  describe('calculateDaysInTest', () => {
    it('should return 0 for undefined startedAt', () => {
      expect(calculateDaysInTest(undefined)).toBe(0);
      expect(calculateDaysInTest(null)).toBe(0);
    });

    it('should calculate days correctly', () => {
      const now = new Date();
      const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
      expect(calculateDaysInTest(fiveDaysAgo.toISOString())).toBe(5);
    });

    it('should return 0 for future dates', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      expect(calculateDaysInTest(tomorrow.toISOString())).toBe(0);
    });
  });

  describe('calculateDaysRemaining', () => {
    it('should return 14 for undefined startedAt', () => {
      expect(calculateDaysRemaining(undefined)).toBe(14);
      expect(calculateDaysRemaining(null)).toBe(14);
    });

    it('should calculate remaining days correctly', () => {
      const now = new Date();
      const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
      expect(calculateDaysRemaining(fiveDaysAgo.toISOString())).toBe(9);
    });

    it('should return 0 when test period exceeded', () => {
      const now = new Date();
      const twentyDaysAgo = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000);
      expect(calculateDaysRemaining(twentyDaysAgo.toISOString())).toBe(0);
    });
  });

  describe('isInactive', () => {
    it('should return false for undefined lastActive', () => {
      expect(isInactive(undefined)).toBe(false);
      expect(isInactive(null)).toBe(false);
    });

    it('should return false for recent activity', () => {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
      expect(isInactive(oneDayAgo.toISOString())).toBe(false);
    });

    it('should return true for inactive users (3+ days)', () => {
      const now = new Date();
      const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
      expect(isInactive(fiveDaysAgo.toISOString())).toBe(true);
    });

    it('should respect custom threshold', () => {
      const now = new Date();
      const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
      expect(isInactive(fiveDaysAgo.toISOString(), 7)).toBe(false);
      expect(isInactive(fiveDaysAgo.toISOString(), 3)).toBe(true);
    });
  });

  describe('formatDateForBaserow', () => {
    it('should format date as ISO string', () => {
      const date = new Date('2024-01-15T10:30:00.000Z');
      expect(formatDateForBaserow(date)).toBe('2024-01-15T10:30:00.000Z');
    });
  });

  describe('getDatePlusDays', () => {
    it('should add days correctly', () => {
      const baseDate = new Date('2024-01-15T10:30:00.000Z');
      const result = getDatePlusDays(5, baseDate);
      expect(result.getDate()).toBe(20);
    });

    it('should use current date when not specified', () => {
      const now = new Date();
      const result = getDatePlusDays(1);
      expect(result.getDate()).toBe(now.getDate() + 1 > 31 ? 1 : now.getDate() + 1);
    });
  });

  describe('isTestComplete', () => {
    it('should return false for undefined startedAt', () => {
      expect(isTestComplete(undefined)).toBe(false);
      expect(isTestComplete(null)).toBe(false);
    });

    it('should return false when test still running', () => {
      const now = new Date();
      const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
      expect(isTestComplete(fiveDaysAgo.toISOString())).toBe(false);
    });

    it('should return true when test period exceeded', () => {
      const now = new Date();
      const twentyDaysAgo = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000);
      expect(isTestComplete(twentyDaysAgo.toISOString())).toBe(true);
    });
  });
});
