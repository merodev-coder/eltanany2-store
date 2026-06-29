// backend/src/config/adminDb.js
import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const MAX_RETRIES = 3;

/**
 * Create and manage the Admin MongoDB connection.
 * Uses a factory function so dotenv has loaded before this runs.
 */
export function createAdminDbConnection() {
  const MONGO_URI = process.env.ADMIN_DB_URI;

  if (!MONGO_URI) {
    throw new Error('❌ ADMIN_DB_URI is required');
  }

  const adminDb = mongoose.createConnection(MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  // ── Event listeners ──────────────────────────────────────
  adminDb.on('connected', () => {
    logger.info('✅ Admin DB connected');
  });

  adminDb.on('error', (err) => {
    logger.error(`❌ Admin DB error: ${err.message}`);
  });

  adminDb.on('disconnected', () => {
    logger.warn('⚠️ Admin DB disconnected');
  });

  // ── Retry logic (3 attempts, exponential backoff) ────────
  let retries = 0;
  adminDb.on('error', () => {
    if (retries < MAX_RETRIES) {
      retries += 1;
      const delay = Math.pow(2, retries) * 1000;
      logger.warn(`Retrying Admin DB connection in ${delay}ms… (attempt ${retries}/${MAX_RETRIES})`);
      setTimeout(() => adminDb.openUri(MONGO_URI), delay);
    }
  });

  // ── Graceful shutdown ────────────────────────────────────
  process.on('SIGINT', async () => {
    await adminDb.close();
    logger.info('Admin DB connection closed (SIGINT)');
  });

  process.on('SIGTERM', async () => {
    await adminDb.close();
    logger.info('Admin DB connection closed (SIGTERM)');
  });

  return adminDb;
}
