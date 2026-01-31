import cors from 'cors';

// Extract origin from FRONTEND_URL (browser Origin header never includes path)
const getOrigin = (url: string): string => {
  try {
    const parsed = new URL(url);
    return parsed.origin;
  } catch {
    return url;
  }
};

const allowedOrigins = process.env.FRONTEND_URL
  ? [getOrigin(process.env.FRONTEND_URL)]
  : ['http://localhost:5173'];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
