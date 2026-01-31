import jwt from 'jsonwebtoken';

// Mock the env module
jest.mock('../../../src/config/env', () => ({
  env: {
    JWT_SECRET: 'test-secret-key-that-is-at-least-32-characters-long',
    JWT_EXPIRY: '1h',
  },
}));

import { signToken, verifyToken, decodeToken } from '../../../src/utils/jwt';

describe('JWT utils', () => {
  const testPayload = { email: 'test@example.com', role: 'admin' };

  describe('signToken', () => {
    it('should sign and verify valid token', () => {
      const token = signToken(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const payload = verifyToken(token);
      expect(payload.email).toBe(testPayload.email);
      expect(payload.role).toBe(testPayload.role);
    });
  });

  describe('verifyToken', () => {
    it('should reject expired token', () => {
      // Create an already expired token
      const expiredToken = jwt.sign(
        testPayload,
        'test-secret-key-that-is-at-least-32-characters-long',
        { expiresIn: '-1h' }
      );

      expect(() => verifyToken(expiredToken)).toThrow();
    });

    it('should reject tampered token', () => {
      const token = signToken(testPayload);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';

      expect(() => verifyToken(tamperedToken)).toThrow();
    });

    it('should reject token with wrong secret', () => {
      const wrongToken = jwt.sign(testPayload, 'wrong-secret', {
        expiresIn: '1h',
      });

      expect(() => verifyToken(wrongToken)).toThrow();
    });
  });

  describe('decodeToken', () => {
    it('should decode token without verification', () => {
      const token = signToken(testPayload);
      const decoded = decodeToken(token);

      expect(decoded?.email).toBe(testPayload.email);
      expect(decoded?.role).toBe(testPayload.role);
    });

    it('should return null for invalid token', () => {
      const decoded = decodeToken('invalid-token');
      expect(decoded).toBeNull();
    });
  });
});
