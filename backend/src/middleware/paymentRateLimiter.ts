// backend/src/middleware/paymentRateLimiter.ts
//
// Why: This file was silently failing because the original code exported the
// _config object_ instead of calling `rateLimit(config)` to produce a middleware
// function. Express treats whatever you register as a handler — it ran the raw
// options object as though it were a request handler, the object then called
// `next()` which Express rejected with
//   "Route.post() requires a callback function but got [object Object]"
//
// Fix: wrap the config with rateLimit() so the export is a real middleware fn.
import rateLimit from 'express-rate-limit';

export const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || 'unknown',
  skip: (req) => req.method !== 'POST',
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'عدد المحاولات كبير جداً. يرجى الانتظار 10 دقائق قبل المحاولة مرة أخرى.',
    });
  },
});
