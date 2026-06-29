// backend/src/server.ts
// Entry point: validates env → connects DBs → loads app → starts server
// ─────────────────────────────────────────────────────────

import 'dotenv/config';

import logger from './utils/logger.js';
import { initializeConnections, isDbHealthy } from './config/db.js';

// ── Global process safety nets ─────────────────────────
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err.message);
  // Give logger time to flush, then exit
  setTimeout(() => process.exit(1), 1000);
});

// ── Required environment variables ─────────────────────
const REQUIRED_ENV = [
  'USER_DB_URI',
  'ADMIN_DB_URI',
  'USER_JWT_SECRET',
  'USER_REFRESH_SECRET',
  'ADMIN_JWT_SECRET',
  'ADMIN_REFRESH_SECRET',
];

let missing = false;
for (const env of REQUIRED_ENV) {
  if (!process.env[env]) {
    logger.error(`❌ Required environment variable missing: ${env}`);
    missing = true;
  }
}

if (missing) {
  logger.error('⛔ Fix missing env vars in .env then restart');
  process.exit(1);
}

// Validate secret lengths
const MIN_SECRET_LENGTH = 32;
['USER_JWT_SECRET', 'USER_REFRESH_SECRET', 'ADMIN_JWT_SECRET', 'ADMIN_REFRESH_SECRET'].forEach(
  (key) => {
    if ((process.env[key]?.length || 0) < MIN_SECRET_LENGTH) {
      logger.error(`❌ ${key} must be at least ${MIN_SECRET_LENGTH} characters`);
      process.exit(1);
    }
  }
);

// ── Main startup sequence ──────────────────────────────
async function startServer() {
  // 1) Connect databases FIRST (before any models or routes are loaded)
  logger.info('⏳ Initializing database connections...');
  const { userDb, adminDb } = await initializeConnections();

  if (!userDb || !adminDb) {
    logger.error('❌ Failed to establish database connections. Diagnostics:');
    logger.error('   1. Check USER_DB_URI and ADMIN_DB_URI in .env');
    logger.error('   2. Verify IP whitelist in MongoDB Atlas → Network Access');
    logger.error('   3. Confirm DNS resolution works: nslookup _mongodb._tcp.cluster0.mxjc25q.mongodb.net');
    logger.error('   4. If SRV fails consistently, switch to standard mongodb:// connection strings');
    process.exit(1);
  }

  logger.info('✅ Both databases connected successfully');

  // 2) Import models AFTER DB connections are ready
  //    Dynamic import ensures models register on the now-established connection
  const { default: Admin } = await import('./models/admin/Admin.model.js');

  // 3) Seed admin in development (non-critical, log failure)
  if (process.env.NODE_ENV !== 'production') {
    try {
      await Admin.seedSuperadmin();
    } catch (err) {
      logger.warn('⚠️  Admin seed failed (non-critical):', err.message);
    }
  }

  // 3a) Seed default user admin (ALL envs — must exist for login to work)
  try {
    const { default: User } = await import('./models/user/User.model.js');
    const adminEmailRaw = (process.env.DEFAULT_ADMIN_EMAIL || '').replace(/^["']|["']$/g, '').trim().toLowerCase();
    const adminPassRaw = (process.env.DEFAULT_ADMIN_PASS || '').replace(/^["']|["']$/g, '').trim();
    if (adminEmailRaw && adminPassRaw) {
      let existing = await User.findOne({ email: adminEmailRaw }).select('+password');
      if (!existing) {
        await User.create({ name: 'Admin', email: adminEmailRaw, password: adminPassRaw });
        logger.info(`✅ Default admin user seeded: ${adminEmailRaw}`);
      } else {
        // Password changed in .env → update stored hash
        const passMatch = await existing.comparePassword(adminPassRaw);
        if (!passMatch) {
          existing.password = adminPassRaw;
          await existing.save();
          logger.info('✅ Default admin password updated from .env');
        }
      }
    }
  } catch (err) {
    logger.warn('⚠️ Default user admin seed (non-critical):', err.message);
  }

  // 4) Import and start the Express app (routes, controllers, middleware)
  //    This is deferred until AFTER databases are connected so all model
  //    imports receive the established connection object.
  const { default: app } = await import('./app.js');

  // 5) Start HTTP server
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    logger.info(`📡 User DB: ${isDbHealthy().userDb ? 'connected' : 'disconnected'}`);
    logger.info(`📡 Admin DB: ${isDbHealthy().adminDb ? 'connected' : 'disconnected'}`);
  });
}

startServer().catch((err) => {
  logger.error('❌ Fatal server startup error:', err.message);
  process.exit(1);
});
