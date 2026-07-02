// backend/src/server.ts
// SERVER ENTRY POINT
//
// IMPORTANT: Model registration happens in app.ts, NOT here.
// app.ts imports all model files BEFORE importing any routes.
// Routes import controllers, which import models. By placing model
// imports before route imports in app.ts, we guarantee every schema
// is registered on its correct mongoose connection before any
// controller can query it.

// 1. Environment variables FIRST
import './config/env.js';

// 2. Import app (which internally imports models → then routes)
import app from './app.js';
import net from 'net';
import logger from './utils/logger.js';

const DEFAULT_PORT = Number(process.env.PORT) || 5000;

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => {
        tester.close();
        resolve(true);
      })
      .listen(port, '0.0.0.0');
  });
}

async function findAvailablePort(preferred: number): Promise<number> {
  let port = preferred;
  while (!(await isPortAvailable(port))) {
    logger.warn(`Port ${port} is busy, trying ${port + 1}…`);
    port += 1;
    if (port > preferred + 20) {
      throw new Error(`Could not find an available port between ${preferred} and ${port - 1}`);
    }
  }
  return port;
}

async function startServer() {
  try {
    const port = await findAvailablePort(DEFAULT_PORT);

    const server = app.listen(port, () => {
      logger.info(`🚀 Server running on port ${port}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error(`Unhandled Rejection: ${reason?.message || reason}`);
      promise.catch(() => {});
    });

    process.on('uncaughtException', (err: Error) => {
      logger.error(`Uncaught Exception: ${err.message}`);
    });
  } catch (err: any) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
}

startServer();
