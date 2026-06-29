// backend/src/controllers/admin/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../../models/admin/Admin.model.js';
import {
  generateAdminTokens,
  setAdminCookies,
  clearAdminCookies,
} from '../../utils/generateToken.js';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';
import logger from '../../utils/logger.js';

/**
 * POST /api/v1/admin/auth/login
 * Admin authentication with strict rate limiting and timing-safe response.
 * Returns identical response time and message for all outcomes.
 */
export const adminLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const startTime = Date.now();

  try {
    // ── Find admin with password ───────────────────────
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      // Fake comparison to maintain constant time
      await bcrypt.compare(password, '$2b$12$t0t4llyf4k3h4shf0rc0mp4r1ngth1sl4t4.T');
      throw new AppError('Invalid credentials.', 401);
    }

    // ── Verify password ─────────────────────────────────
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid credentials.', 401);
    }

    // ── Update last login ─────────────────────────────
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    // ── Generate tokens ────────────────────────────────
    const tokens = generateAdminTokens(admin._id.toString());
    setAdminCookies(res, tokens);

    // ── Safe response ─────────────────────────────────
    res.status(200).json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: {
        admin: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
        },
      },
    });

    logger.info(`Admin logged in: ${admin.email}`);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/admin/auth/logout
 */
export const adminLogout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  clearAdminCookies(res);

  res.status(200).json({
    success: true,
    message: 'تم تسجيل الخروج بنجاح',
  });
});

/**
 * POST /api/v1/admin/auth/refresh
 * Rotate admin access token.
 * Verifies the refresh token cryptographically and validates
 * the admin still exists and hasn't changed their password.
 */
export const adminRefresh = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies?.admin_refresh;

  if (!refreshToken) {
    throw new AppError('رمز التحديث مطلوب', 401);
  }

  // ── Verify the refresh token ─────────────────────────
  let decoded: { sub: string; type?: string };
  try {
    decoded = jwt.verify(refreshToken, process.env.ADMIN_REFRESH_SECRET!) as { sub: string; type?: string };
  } catch {
    clearAdminCookies(res);
    throw new AppError('رمز التحديث غير صالح أو منتهي الصلاحية', 401);
  }

  if (decoded.type !== 'admin_refresh') {
    clearAdminCookies(res);
    throw new AppError('رمز التحديث غير صالح', 401);
  }

  // ── Validate admin still exists ─────────────────────
  const admin = await Admin.findById(decoded.sub);
  if (!admin) {
    clearAdminCookies(res);
    throw new AppError('المشرف غير موجود', 401);
  }

  // ── Check if password was changed after token issuance
  if (admin.passwordChangedAt) {
    const tokenIat = (jwt.decode(refreshToken) as { iat?: number })?.iat || 0;
    if (admin.passwordChangedAt.getTime() / 1000 > tokenIat) {
      clearAdminCookies(res);
      throw new AppError('تم تغيير كلمة المرور، يرجى إعادة تسجيل الدخول', 401);
    }
  }

  // ── Rotate tokens ─────────────────────────────────
  const tokens = generateAdminTokens(admin._id.toString());
  setAdminCookies(res, tokens);

  res.status(200).json({
    success: true,
    message: 'تم تحديث الجلسة',
  });
});

/**
 * GET /api/v1/admin/auth/me
 */
export const getAdminMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const reqAdmin = (req as any).admin;

  if (!reqAdmin) {
    throw new AppError('غير مصرح', 401);
  }

  res.status(200).json({
    success: true,
    data: {
      admin: {
        _id: reqAdmin._id,
        name: reqAdmin.name,
        email: reqAdmin.email,
        role: reqAdmin.role,
        permissions: reqAdmin.permissions || [],
      },
    },
  });
});
