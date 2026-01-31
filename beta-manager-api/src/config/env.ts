import { z } from 'zod';

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('8080'),

  // Auth
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRY: z.string().default('24h'),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD_HASH: z.string().min(1),

  // Baserow
  BASEROW_API_TOKEN: z.string().min(1),
  BASEROW_TESTERS_TABLE_ID: z.string().min(1),
  BASEROW_FEEDBACK_TABLE_ID: z.string().min(1),
  BASEROW_INCIDENTS_TABLE_ID: z.string().min(1),
  BASEROW_COMMUNICATIONS_TABLE_ID: z.string().min(1),
  BASEROW_TEMPLATES_TABLE_ID: z.string().min(1),

  // Resend
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().min(1),

  // URLs
  FRONTEND_URL: z.string().url(),
  PLAY_STORE_LINK: z.string().url().optional(),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

export const env = loadEnv();
