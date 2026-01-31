"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    // Server
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().default('8080'),
    // Auth
    JWT_SECRET: zod_1.z.string().min(32),
    JWT_EXPIRY: zod_1.z.string().default('24h'),
    ADMIN_EMAIL: zod_1.z.string().email(),
    ADMIN_PASSWORD_HASH: zod_1.z.string().min(1),
    // Baserow
    BASEROW_API_TOKEN: zod_1.z.string().min(1),
    BASEROW_TESTERS_TABLE_ID: zod_1.z.string().min(1),
    BASEROW_FEEDBACK_TABLE_ID: zod_1.z.string().min(1),
    BASEROW_INCIDENTS_TABLE_ID: zod_1.z.string().min(1),
    BASEROW_COMMUNICATIONS_TABLE_ID: zod_1.z.string().min(1),
    BASEROW_TEMPLATES_TABLE_ID: zod_1.z.string().min(1),
    // Resend
    RESEND_API_KEY: zod_1.z.string().min(1),
    EMAIL_FROM: zod_1.z.string().min(1),
    // URLs
    FRONTEND_URL: zod_1.z.string().url(),
    PLAY_STORE_LINK: zod_1.z.string().url().optional(),
});
function loadEnv() {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
        console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
        throw new Error('Invalid environment variables');
    }
    return parsed.data;
}
exports.env = loadEnv();
//# sourceMappingURL=env.js.map