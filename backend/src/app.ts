// backend/src/app.ts
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';

import { generalLimiter } from './middleware/rateLimiter.js';
import sanitizeMiddleware from './middleware/sanitize.js';
import errorHandler from './middleware/errorHandler.js';
import adminOriginCheck from './middleware/adminOriginCheck.js';
import logger from './utils/logger.js';

// Routes
import userAuthRoutes from './routes/user/auth.routes.js';
import userOrderRoutes from './routes/user/order.routes.js';
import userProfileRoutes from './routes/user/profile.routes.js';
import userCartRoutes from './routes/user/cart.routes.js';
import adminAuthRoutes from './routes/admin/auth.routes.js';
import adminProductRoutes from './routes/admin/product.routes.js';
import adminGovernorateRoutes from './routes/admin/governorate.routes.js';
import publicProductRoutes from './routes/public/product.routes.js';
import publicGovernorateRoutes from './routes/public/governorate.routes.js';
import userUploadRoutes from './routes/user/upload.routes.js';

const app = express();

// ── Express app factory (no listen) ──────────────────────

// ── Security: Disable x-powered-by ─────────────────────
app.disable('x-powered-by');

// ── Security: Helmet ───────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", process.env.CLIENT_URL || ""],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    hsts: {
      maxAge: 31536000, // 31,536,000 seconds = 1 year
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// ── CORS ───────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigin = process.env.CLIENT_URL;
      if (!origin || origin === allowedOrigin) {
        return callback(null, true);
      }
      callback(new Error('CORS: Origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Origin'],
  })
);

// ── Body parsing ───────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// ── Request logging ────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', { stream: { write: (msg: string) => logger.info(msg.trim()) } }));
} else {
  app.use(morgan('dev'));
}

// ── Sanitization ───────────────────────────────────────
app.use(sanitizeMiddleware);

// ── General rate limiter ───────────────────────────────
app.use('/api/v1', generalLimiter);

// ── Admin Origin Check (returns 404 if missing) ────────
app.use('/api/v1/admin', adminOriginCheck);

// ── Health check ───────────────────────────────────────
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ───────────────────────────────────────────────
app.use('/api/v1/users/auth', userAuthRoutes);
app.use('/api/v1/users/orders', userOrderRoutes);
app.use('/api/v1/users/profile', userProfileRoutes);
app.use('/api/v1/users/cart', userCartRoutes);
app.use('/api/v1/admin/auth', adminAuthRoutes);
app.use('/api/v1/admin/products', adminProductRoutes);
// ── Static files (uploads) ─────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));
app.use('/api/v1/admin/governorates', adminGovernorateRoutes);
app.use('/api/v1/public/products', publicProductRoutes);
app.use('/api/v1/public/governorates', publicGovernorateRoutes);
app.use('/api/v1/users/upload', userUploadRoutes);

// ── 404 Handler ────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'المسار غير موجود',
  });
});

// ── Error Handler (must be last) ───────────────────────
app.use(errorHandler);

export default app;
