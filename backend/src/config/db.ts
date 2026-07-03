// backend/src/config/db.ts
// Centralized database connection manager with singleton pattern.
// All models share the same connection instance per database.

import dns from 'dns';
import mongoose from 'mongoose';
import logger from '../utils/logger.js';

// Fix for Windows DNS lookup issues with MongoDB Atlas SRV records
// Forces IPv4 first to avoid ECONNREFUSED on some networks
dns.setDefaultResultOrder('ipv4first');

const MAX_RETRIES = 3;

// ── Shared mongoose options for all connections ────────────
const sharedOptions: mongoose.ConnectOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 8000,
  socketTimeoutMS: 45000,
  // DNS fallback: if SRV lookup fails, try direct connection
  family: 4,
};

// ── Singleton connection cache ───────────────────────────────
const connectionCache = new Map<string, { mongoose: mongoose.Mongoose; connection: mongoose.Connection }>();

/**
 * Create or retrieve a cached MongoDB connection.
 * Uses singleton pattern so multiple model imports don't create duplicate connections.
 */
function getOrCreateConnection(
  envVarName: string,
  dbLabel: string
): { mongoose: mongoose.Mongoose; connection: mongoose.Connection } {
  // Return cached connection if it exists
  if (connectionCache.has(envVarName)) {
    return connectionCache.get(envVarName)!;
  }

  const MONGO_URI = process.env[envVarName]!;

  if (!MONGO_URI) {
    logger.error(`❌ ${envVarName} is not set in environment`);
    // Return a dummy connection that won't crash the app
    const dummyMongoose = new mongoose.Mongoose();
    const dummy = dummyMongoose.createConnection();
    dummy.on('error', () => {});
    const result = { mongoose: dummyMongoose, connection: dummy };
    connectionCache.set(envVarName, result);
    return result;
  }

  // Create a fresh isolated mongoose instance to avoid shared-state issues
  const mongooseInstance = new mongoose.Mongoose();
  const conn = mongooseInstance.createConnection();

  // Always attach an error listener so mongoose doesn't throw uncaught exceptions
  conn.on('error', (err) => {
    logger.error(`❌ ${dbLabel} error: ${err.message}`);
  });

  conn.on('connected', () => {
    logger.info(`✅ ${dbLabel} connected`);
  });

  conn.on('disconnected', () => {
    logger.warn(`⚠️ ${dbLabel} disconnected`);
  });

  // ── Retry logic with exponential backoff ─────────────────
  let retries = 0;

  async function connectWithRetry() {
    try {
      await conn.openUri(MONGO_URI, sharedOptions);
      logger.info(`✅ ${dbLabel} connected (retry success)`);
    } catch (err: any) {
      logger.error(`❌ ${dbLabel} connection failed: ${err.message}`);
      if (retries < MAX_RETRIES) {
        retries += 1;
        const delay = Math.pow(2, retries) * 1000;
        logger.warn(
          `Retrying ${dbLabel} connection in ${delay}ms… (attempt ${retries}/${MAX_RETRIES})`
        );
        setTimeout(connectWithRetry, delay);
      } else {
        logger.error(
          `❌ ${dbLabel} max retries exceeded. Features using this DB will be unavailable.`
        );
      }
    }
  }

  // Kick off the first connection attempt (non-blocking)
  connectWithRetry();

  // Cache it so future imports reuse the same connection
  const result = { mongoose: mongooseInstance, connection: conn };
  connectionCache.set(envVarName, result);
  return result;
}

// ── Public exports: one singleton per database ─────────────
const adminDbResult = getOrCreateConnection('ADMIN_DB_URI', 'Admin DB');
const userDbResult = getOrCreateConnection('USER_DB_URI', 'User DB');

// Export the mongoose instances (for creating schemas) and connections (for registering models)
export const adminMongoose = adminDbResult.mongoose;
export const adminDb = adminDbResult.connection;

export const userMongoose = userDbResult.mongoose;
export const userDb = userDbResult.connection;
