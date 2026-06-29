// backend/src/config/db.js
// Production-grade dual MongoDB connection manager
// Handles SRV DNS failures gracefully without crashing the process
// ─────────────────────────────────────────────────────────

import mongoose from 'mongoose';
import logger from '../utils/logger.js';

// ── Configuration ────────────────────────────────────────
const MAX_RETRIES = 5;
const INITIAL_DELAY_MS = 1000;
const SERVER_SELECTION_TIMEOUT = 30000; // 30s for SRV resolution

// ── Helper: Exponential backoff ────────────────────────
const getRetryDelay = (attempt) => Math.pow(2, attempt) * INITIAL_DELAY_MS;

// ── Core connection factory ──────────────────────────────
// Wraps mongoose.createConnection in a Promise with full error isolation.
// Does NOT throw — all errors are caught and logged.
async function createConnectionAsync(uri, name) {
  if (!uri) {
    logger.error(`❌ ${name}_DB_URI is missing — check .env`);
    return null;
  }

  let attempt = 0;
  let lastError = null;

  while (attempt < MAX_RETRIES) {
    try {
      const db = mongoose.createConnection(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT,
        socketTimeoutMS: 45000,
        // Critical for SRV: allow longer initial DNS resolution time
        connectTimeoutMS: 10000,
      });

      // ── Event wiring (safe — never throws) ─────────────
      db.on('connected', () => {
        logger.info(`✅ ${name} DB connected`);
      });

      db.on('error', (err) => {
        logger.error(`❌ ${name} DB error: ${err.message}`);
      });

      db.on('disconnected', () => {
        logger.warn(`⚠️  ${name} DB disconnected`);
      });

      // Wait for the 'connected' event or catch immediate failure
      await new Promise((resolve, reject) => {
        const onConnected = () => {
          cleanup();
          resolve();
        };
        const onError = (err) => {
          cleanup();
          reject(err);
        };
        const cleanup = () => {
          db.off('connected', onConnected);
          db.off('error', onError);
        };

        db.once('connected', onConnected);
        db.once('error', onError);

        // Fallback timeout in case neither event fires (defensive)
        setTimeout(() => {
          cleanup();
          reject(new Error(`Connection timeout for ${name} DB`));
        }, SERVER_SELECTION_TIMEOUT + 5000);
      });

      return db; // Success
    } catch (err) {
      lastError = err;
      attempt += 1;
      const isSrvError = err.message?.includes('querySrv') || err.message?.includes('ECONNREFUSED');

      if (isSrvError) {
        logger.warn(
          `⚠️  ${name} DB SRV/DNS failure (attempt ${attempt}/${MAX_RETRIES}): ${err.message}`
        );
      } else {
        logger.error(`❌ ${name} DB connection failed (attempt ${attempt}/${MAX_RETRIES}): ${err.message}`);
      }

      if (attempt < MAX_RETRIES) {
        const delay = getRetryDelay(attempt);
        logger.info(`⏳ Retrying ${name} DB in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // All retries exhausted
  logger.error(`❌ ${name} DB: All ${MAX_RETRIES} connection attempts failed.`);
  logger.error(`   Last error: ${lastError?.message}`);
  return null;
}

// ── Lazy-initialized connections ─────────────────────────
let userDbInstance = null;
let adminDbInstance = null;
let userDbPromise = null;
let adminDbPromise = null;

export async function connectUserDb() {
  if (userDbInstance && userDbInstance.readyState === 1) return userDbInstance;
  if (userDbPromise) return userDbPromise;

  userDbPromise = createConnectionAsync(process.env.USER_DB_URI, 'User').then((db) => {
    userDbInstance = db;
    return db;
  });

  return userDbPromise;
}

export async function connectAdminDb() {
  if (adminDbInstance && adminDbInstance.readyState === 1) return adminDbInstance;
  if (adminDbPromise) return adminDbPromise;

  adminDbPromise = createConnectionAsync(process.env.ADMIN_DB_URI, 'Admin').then((db) => {
    adminDbInstance = db;
    return db;
  });

  return adminDbPromise;
}

// ── Synchronous getters (for model registration) ─────────
// Models MUST register before connection is ready.
// Mongoose defers actual DB ops until the connection is open.
export function getUserDb() {
  if (!userDbInstance) {
    throw new Error(
      'getUserDb() called before connectUserDb() resolved. ' +
      'Ensure connectUserDb() is awaited before importing models.'
    );
  }
  return userDbInstance;
}

export function getAdminDb() {
  if (!adminDbInstance) {
    throw new Error(
      'getAdminDb() called before connectAdminDb() resolved. ' +
      'Ensure connectAdminDb() is awaited before importing models.'
    );
  }
  return adminDbInstance;
}

// ── Legacy exports (for backward compat) ─────────────────
// These are set after connection resolves.
export let userDb = null;
export let adminDb = null;

export async function initializeConnections() {
  [userDb, adminDb] = await Promise.all([connectUserDb(), connectAdminDb()]);
  return { userDb, adminDb };
}

// ── Health check ───────────────────────────────────────
export function isDbHealthy() {
  return {
    userDb: userDb?.readyState === 1,
    adminDb: adminDb?.readyState === 1,
  };
}

// ── Graceful shutdown ───────────────────────────────────
async function closeConnections() {
  const promises = [];
  if (userDb?.readyState === 1) promises.push(userDb.close());
  if (adminDb?.readyState === 1) promises.push(adminDb.close());
  if (promises.length > 0) await Promise.all(promises);
  logger.info('💤 Database connections closed');
}

process.on('SIGINT', async () => {
  await closeConnections();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeConnections();
  process.exit(0);
});
