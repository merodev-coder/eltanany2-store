// backend/src/app.ts
// Load environment variables FIRST before any other imports
import './config/env.js';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

// Centralized DB module — triggers all connections in parallel
import './config/db.js';

// ── MODEL REGISTRATION (must be BEFORE routes) ───────────────
// Routes import controllers. Controllers import models. Importing models
// here guarantees their schemas register on the correct mongoose connection
// before any route or controller is loaded.
import './models/user/User.model.js';
import './models/user/Cart.model.js';
import './models/user/Order.model.js';
import './models/admin/Admin.model.js';
import './models/admin/AdminSettings.model.js';
import './models/admin/Governorate.model.js';
import './models/admin/Product.model.js';
import './models/admin/PriceList.model.js';

// Import routes (AFTER models are registered)
import userAuthRoutes from './routes/user/auth.routes.js';
import userCartRoutes from './routes/user/cart.routes.js';
import userOrderRoutes from './routes/user/order.routes.js';
import userProfileRoutes from './routes/user/profile.routes.js';
import userReceiptRoutes from './routes/user/receipt.routes.js';
import adminAuthRoutes from './routes/admin/auth.routes.js';
import adminProductRoutes from './routes/admin/product.routes.js';
import adminOrderRoutes from './routes/admin/orders.routes.js';
import adminGovernorateRoutes from './routes/admin/governorate.routes.js';
import adminSettingsRoutes from './routes/admin/settings.routes.js';
import adminAnalyticsRoutes from './routes/admin/analytics.routes.js';
import publicProductRoutes from './routes/public/product.routes.js';
import publicGovernorateRoutes from './routes/public/governorate.routes.js';
import publicSettingsRoutes from './routes/public/settings.routes.js';
import publicPriceListRoutes from './routes/public/priceList.routes.js';

// Import middleware
import errorHandler from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import sanitize from './middleware/sanitize.js';
import { createRouteHandler } from 'uploadthing/express';
import { uploadRouter } from './uploadthing.js';

const app = express();

// ── Trust proxy (for rate limiting behind proxies) ───────
app.set('trust proxy', 1);

// ── CORS ───────────────────────────────────────────────────
// Allow specific origins with credentials for cross-origin cookies
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://eltanany2-store-y8bf-seven.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ── Body parsing ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Security middleware ─────────────────────────────────────
app.use(sanitize);
app.use(generalLimiter);

// ── Static files (uploaded receipts) ────────────────────
app.use('/uploads', express.static(path.resolve('uploads')));

// ── Health check ────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// ── Uploadthing route handler ─────────────────────────────
app.use(
  '/api/uploadthing',
  createRouteHandler({
    router: uploadRouter,
    config: {
      token: process.env.UPLOADTHING_SECRET,
    },
  })
);

// ── API Routes ──────────────────────────────────────────────
// Public routes
app.use('/api/v1/public/products', publicProductRoutes);
app.use('/api/v1/public/governorates', publicGovernorateRoutes);
app.use('/api/v1/public/settings', publicSettingsRoutes);
app.use('/api/v1/public/price-list', publicPriceListRoutes);

// User routes
app.use('/api/v1/users/auth', userAuthRoutes);
app.use('/api/v1/users/cart', userCartRoutes);
app.use('/api/v1/users/orders', userOrderRoutes);
app.use('/api/v1/users/profile', userProfileRoutes);
app.use('/api/v1/users/receipts', userReceiptRoutes);

// Admin routes
app.use('/api/v1/admin/auth', adminAuthRoutes);
app.use('/api/v1/admin/products', adminProductRoutes);
app.use('/api/v1/admin/orders', adminOrderRoutes);
app.use('/api/v1/admin/governorates', adminGovernorateRoutes);
app.use('/api/v1/admin/settings', adminSettingsRoutes);
app.use('/api/v1/admin/analytics', adminAnalyticsRoutes);

// ── Error handling ─────────────────────────────────────────
app.use(errorHandler);

export default app;
