// backend/src/config/userDb.js
import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const MAX_RETRIES = 3;

/**
 * Create and manage the User MongoDB connection.
 * Uses a factory function so dotenv has loaded before this runs.
 */
export function createUserDbConnection() {
  const MONGO_URI = process.env.USER_DB_URI;

  if (!MONGO_URI) {
    throw new Error('❌ USER_DB_URI is required');
  }

  const userDb = mongoose.createConnection(MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  // ── Event listeners ──────────────────────────────────────
  userDb.on('connected', () => {
    logger.info('✅ User DB connected');
  });

  userDb.on('error', (err) => {
    logger.error(`❌ User DB error: ${err.message}`);
  });

  userDb.on('disconnected', () => {
    logger.warn('⚠️ User DB disconnected');
  });

  // ── Retry logic (3 attempts, exponential backoff) ────────
  let retries = 0;
  userDb.on('error', () => {
    if (retries < MAX_RETRIES) {
      retries += 1;
      const delay = Math.pow(2, retries) * 1000;
      logger.warn(`Retrying User DB connection in ${delay}ms… (attempt ${retries}/${MAX_RETRIES})`);
      setTimeout(() => userDb.openUri(MONGO_URI), delay);
    }
  });

  // ── Graceful shutdown ────────────────────────────────────
  process.on('SIGINT', async () => {
    await userDb.close();
    logger.info('User DB connection closed (SIGINT)');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await userDb.close();
    logger.info('User DB connection closed (SIGTERM)');
    process.exit(0);
  });

  return userDb;
}
