import request from 'supertest';
import bcrypt from 'bcrypt';

// Mock the env module
const TEST_EMAIL = 'admin@test.com';
const TEST_PASSWORD = 'testpassword123';
let TEST_PASSWORD_HASH: string;

beforeAll(async () => {
  TEST_PASSWORD_HASH = await bcrypt.hash(TEST_PASSWORD, 10);
});

jest.mock('../../../src/config/env', () => ({
  env: {
    JWT_SECRET: 'test-secret-key-that-is-at-least-32-characters-long',
    JWT_EXPIRY: '1h',
    ADMIN_EMAIL: 'admin@test.com',
    get ADMIN_PASSWORD_HASH() {
      return TEST_PASSWORD_HASH;
    },
    FRONTEND_URL: 'http://localhost:5173',
    NODE_ENV: 'test',
  },
}));

// Mock logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import app from '../../../src/app';

describe('Auth routes', () => {
  describe('POST /auth/login', () => {
    it('should return 401 for invalid credentials - wrong email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'wrong@test.com', password: TEST_PASSWORD });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 401 for invalid credentials - wrong password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: TEST_EMAIL, password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'invalid-email', password: TEST_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation Error');
    });

    it('should sets httpOnly cookie on success', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.email).toBe(TEST_EMAIL);

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('token=');
      expect(cookies[0]).toContain('HttpOnly');
    });
  });

  describe('GET /auth/me', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).get('/auth/me');

      expect(response.status).toBe(401);
    });

    it('should return user info with valid token', async () => {
      // First login to get a cookie
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

      const cookie = loginResponse.headers['set-cookie'][0];

      // Then use the cookie to get user info
      const response = await request(app)
        .get('/auth/me')
        .set('Cookie', cookie);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe(TEST_EMAIL);
      expect(response.body.role).toBe('admin');
    });
  });

  describe('POST /auth/logout', () => {
    it('should clear cookie on logout', async () => {
      // First login
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

      const cookie = loginResponse.headers['set-cookie'][0];

      // Then logout
      const response = await request(app)
        .post('/auth/logout')
        .set('Cookie', cookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Cookie should be cleared
      const clearCookie = response.headers['set-cookie'];
      expect(clearCookie).toBeDefined();
    });
  });
});
