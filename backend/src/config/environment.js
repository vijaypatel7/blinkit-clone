import 'dotenv/config';

/**
 * Centralised, typed access to environment configuration.
 *
 * Every config value is read exactly once at process start and validated so a
 * misconfigured deployment fails fast instead of failing on the first request.
 */
const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const toBool = (value, fallback = false) => {
  if (value === undefined || value === null) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  port: toInt(process.env.PORT, 3000),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  // MongoDB
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/blinkit',
    poolSize: toInt(process.env.MONGODB_POOL_SIZE, 50),
    minPoolSize: toInt(process.env.MONGODB_MIN_POOL_SIZE, 10),
    maxIdleTimeMs: toInt(process.env.MONGODB_MAX_IDLE_TIME_MS, 30000),
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: toInt(process.env.REDIS_PORT, 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    dbCache: toInt(process.env.REDIS_DB_CACHE, 0),
    dbQueue: toInt(process.env.REDIS_DB_QUEUE, 1),
    dbSession: toInt(process.env.REDIS_DB_SESSION, 2),
  },

  // Auth
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'insecure-dev-secret-change-me',
    accessTtl: process.env.JWT_ACCESS_TTL || '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL || '30d',
    otpTtlSeconds: toInt(process.env.OTP_TTL_SECONDS, 300),
  },

  // Rate limiting
  rateLimit: {
    windowSeconds: toInt(process.env.RATE_LIMIT_WINDOW_SECONDS, 60),
    maxRequests: toInt(process.env.RATE_LIMIT_MAX_REQUESTS, 120),
  },

  // Delivery / geo
  delivery: {
    defaultSearchRadiusMeters: toInt(process.env.DEFAULT_SEARCH_RADIUS_METERS, 5000),
    maxDeliveryDistanceMeters: toInt(process.env.MAX_DELIVERY_DISTANCE_METERS, 10000),
  },

  // Payments — Razorpay gateway.
  payments: {
    gatewayUrl: process.env.PAYMENT_GATEWAY_URL,
    webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET,
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },

  logLevel: process.env.LOG_LEVEL || 'info',
};

/** Throws if any *required* production variable is missing. */
export function assertRequiredConfig() {
  if (!env.isProduction) return;

  const required = [
    'mongodb.uri',
    'auth.jwtSecret',
    'payments.webhookSecret',
  ];

  const missing = required.filter((key) => {
    const [section, field] = key.split('.');
    const value = env[section]?.[field];
    return !value || value.startsWith('change-me') || value.includes('change-me');
  });

  if (missing.length > 0) {
    throw new Error(`Missing required production config: ${missing.join(', ')}`);
  }
}
