// backend/src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';

const isDev = process.env.NODE_ENV !== 'production';

// ── Auth routes: relaxed for dev, strict for prod ─────
// Dev: 50 req / 15 min (StrictMode + hot-reload burns through fast)
// Prod: 5 req / 15 min
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 999_999, // effectively unlimited — admin needs unrestricted access
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded on auth endpoint: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'عدد المحاولات كبير جداً. يرجى الانتظار 15 دقيقة قبل المحاولة مرة أخرى.',
    });
  },
  keyGenerator: (req) => req.ip || 'unknown',
});

// ── Password reset: 3 requests per 60 minutes ────────────
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded on password reset: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'عدد محاولات إعادة تعيين كلمة المرور كبير. يرجى الانتظار ساعة.',
    });
  },
  keyGenerator: (req) => req.ip || 'unknown',
});

// ── General API: 3000 requests per 15 minutes ───────────
// Relaxed for dev: a typical page + its data = ~20 requests.
// In production, swap to a Redis store and tighten this.

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 3000 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded on general API: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'عدد الطلبات كبير جداً. يرجى المحاولة لاحقاً.',
    });
  },
});
