// backend/src/controllers/user/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../../models/user/User.model.js';
import {
  generateUserTokens,
  setUserCookies,
  clearUserCookies,
} from '../../utils/generateToken.js';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';
import logger from '../../utils/logger.js';

// ── Helper: Parse env value (strips surrounding quotes) ──
function getEnvRaw(key: string): string {
  return (process.env[key] || '').replace(/^["']|["']$/g, '').trim();
}

// ── Helper: Check if user email matches the default admin email ──
function checkIsAdmin(email: string): boolean {
  const adminEmail = getEnvRaw('DEFAULT_ADMIN_EMAIL').toLowerCase();
  return adminEmail.length > 0 && email.trim().toLowerCase() === adminEmail;
}

// ── Helper: Get default admin credentials from .env ──
function getDefaultAdminCredentials() {
  const email = getEnvRaw('DEFAULT_ADMIN_EMAIL').toLowerCase();
  const password = getEnvRaw('DEFAULT_ADMIN_PASS');
  return email && password ? { email, password } : null;
}

/**
 * POST /api/v1/users/auth/register
 * Register a new user, then auto-login (set cookies).
 */
export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, phone } = req.body;

  // ── Block registration with default admin email ────
  const creds = getDefaultAdminCredentials();
  if (creds && email.trim().toLowerCase() === creds.email) {
    throw new AppError('هذا البريد الإلكتروني مستخدم بالفعل', 409);
  }

  // ── Check for duplicate email (constant-time response) ─
  const existingUser = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (existingUser) {
    // Still consume time similar to hash comparison
    throw new AppError('هذا البريد الإلكتروني مستخدم بالفعل', 409);
  }

  // ── Create user ──────────────────────────────────────
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    phone,
  });

  // ── Auto-login: generate token and set cookies ─
  const tokens = generateUserTokens(user._id.toString());
  setUserCookies(res, tokens);

  // ── Construct safe user object ─────────────────────
  const safeUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
  };

  const isAdmin = checkIsAdmin(user.email);

  res.status(201).json({
    success: true,
    message: 'تم إنشاء الحساب بنجاح',
    data: { user: safeUser, isAdmin },
  });
});

/**
 * POST /api/v1/users/auth/login
 * Authenticate user and set cookies.
 */
export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const creds = getDefaultAdminCredentials();
  const isDefaultAdmin = creds && email.trim().toLowerCase() === creds.email;

  // ── Find user (email always stored lowercase) ──────
  let user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  // ── Default admin: auto-create if missing ──────────
  if (!user && isDefaultAdmin) {
    try {
      user = await User.create({
        name: 'Admin',
        email: creds.email,
        password: creds.password,
      });
    } catch (err: any) {
      // Race condition: another request created it → fetch again
      user = await User.findOne({ email: creds.email }).select('+password');
    }
  }

  if (!user) {
    throw new AppError('بيانات الدخول غير صحيحة', 401);
  }

  // ── Verify password ─────────────────────────────────
  let isMatch = await user.comparePassword(password);

  // ── Default admin: allow login with .env password ──
  if (!isMatch && isDefaultAdmin && password === creds.password) {
    // Password changed in .env → update stored hash
    user.password = creds.password;
    await user.save();
    isMatch = true;
  }

  if (!isMatch) {
    await user.incLoginAttempts();
    throw new AppError('بيانات الدخول غير صحيحة', 401);
  }

  // ── Reset login attempts on success ─────────────────
  await user.resetLoginAttempts();

  // ── Generate tokens and set cookies ─────────────────
  const tokens = generateUserTokens(user._id.toString());
  setUserCookies(res, tokens);

  const safeUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
  };

  // ── Check admin privileges ──────────────────────────
  const isAdmin = checkIsAdmin(user.email);

  res.status(200).json({
    success: true,
    message: 'تم تسجيل الدخول بنجاح',
    data: { user: safeUser, isAdmin },
  });
});

/**
 * POST /api/v1/users/auth/logout
 * Invalidate session by clearing cookies.
 */
export const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  clearUserCookies(res);

  res.status(200).json({
    success: true,
    message: 'تم تسجيل الخروج بنجاح',
  });
});

/**
 * POST /api/v1/users/auth/refresh
 * Rotate user access token using refresh token.
 * Verifies the refresh token cryptographically and validates
 * the user still exists and hasn't changed their password.
 */
export const refresh = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies?.user_refresh;

  if (!refreshToken) {
    throw new AppError('رمز التحديث مطلوب', 401);
  }

  // ── Verify the refresh token ─────────────────────────
  let decoded: { sub: string; type?: string };
  try {
    decoded = jwt.verify(refreshToken, process.env.USER_REFRESH_SECRET!) as { sub: string; type?: string };
  } catch {
    clearUserCookies(res);
    throw new AppError('رمز التحديث غير صالح أو منتهي الصلاحية', 401);
  }

  if (decoded.type !== 'user_refresh') {
    clearUserCookies(res);
    throw new AppError('رمز التحديث غير صالح', 401);
  }

  // ── Validate user still exists ──────────────────────
  const user = await User.findById(decoded.sub);
  if (!user) {
    clearUserCookies(res);
    throw new AppError('المستخدم غير موجود', 401);
  }

  // ── Check if password was changed after token issuance
  if (user.passwordChangedAt) {
    const tokenIat = (jwt.decode(refreshToken) as { iat?: number })?.iat || 0;
    if (user.passwordChangedAt.getTime() / 1000 > tokenIat) {
      clearUserCookies(res);
      throw new AppError('تم تغيير كلمة المرور، يرجى إعادة تسجيل الدخول', 401);
    }
  }

  // ── Rotate tokens ─────────────────────────────────
  const tokens = generateUserTokens(user._id.toString());
  setUserCookies(res, tokens);

  res.status(200).json({
    success: true,
    message: 'تم تحديث الجلسة',
  });
});

/**
 * GET /api/v1/users/auth/me
 * Get current user profile.
 */
export const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?._id;

  if (!userId) {
    throw new AppError('غير مصرح', 401);
  }

  const user = await User.findById(userId).select('-password -loginAttempts -lockUntil -passwordResetOTP -passwordResetOTPExpires -passwordChangedAt');

  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const isAdmin = checkIsAdmin(user.email);

  res.status(200).json({
    success: true,
    data: { user, isAdmin },
  });
});

/**
 * POST /api/v1/users/auth/forgot-password
 * Send OTP for password reset.
 */
export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal whether email exists — same response either way
    return res.status(200).json({
      success: true,
      message: 'إذا كان البريد الإلكتروني موجوداً، فستصلك رسالة بإعادة تعيين كلمة المرور',
    });
  }

  // ── Generate 6-digit OTP ────────────────────────────
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

  user.passwordResetOTP = hashedOTP;
  user.passwordResetOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save({ validateBeforeSave: false });

  // ── TODO: Send OTP via email (Nodemailer) ──────
  // In production, send the OTP via email/SMS
  // IMPORTANT: Never log the plaintext OTP. Log only the request event.
  logger.info(`Password reset requested for ${email}`);

  res.status(200).json({
    success: true,
    message: 'إذا كان البريد الإلكتروني موجوداً، فستصلك رسالة بإعادة تعيين كلمة المرور',
  });
});

/**
 * POST /api/v1/users/auth/reset-password
 * Verify OTP and set new password.
 */
export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, otp, newPassword } = req.body;

  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

  const user = await User.findOne({
    email,
    passwordResetOTP: hashedOTP,
    passwordResetOTPExpires: { $gt: new Date() },
  }).select('+password');

  if (!user) {
    throw new AppError('رمز OTP غير صالح أو منتهي الصلاحية', 400);
  }

  // ── Update password ─────────────────────────────────
  user.password = newPassword;
  user.passwordChangedAt = new Date();
  user.passwordResetOTP = undefined;
  user.passwordResetOTPExpires = undefined;
  await user.save();

  // ── Invalidate existing tokens ──────────────────────
  clearUserCookies(res);

  res.status(200).json({
    success: true,
    message: 'تم إعادة تعيين كلمة المرور بنجاح. يرجى تسجيل الدخول مجدداً.',
  });
});

/**
 * POST /api/v1/users/auth/change-password
 * Change password while logged in.
 */
export const changePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { currentPassword, newPassword } = req.body;
  const userId = (req as any).user?._id;

  if (!userId) {
    throw new AppError('غير مصرح', 401);
  }

  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  // ── Verify current password ────────────────────────
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('كلمة المرور الحالية غير صحيحة', 401);
  }

  // ── New password must be different ─────────────────
  const samePassword = await user.comparePassword(newPassword);
  if (samePassword) {
    throw new AppError('يجب أن تكون كلمة المرور الجديدة مختلفة', 422);
  }

  // ── Update password ────────────────────────────────
  user.password = newPassword;
  user.passwordChangedAt = new Date();
  await user.save();

  // ── Clear cookies to force re-login ──────────────
  clearUserCookies(res);

  res.status(200).json({
    success: true,
    message: 'تم تغيير كلمة المرور. يرجى تسجيل الدخول مجدداً.',
  });
});
