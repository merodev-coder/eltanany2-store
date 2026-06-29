// backend/src/controllers/user/profile.controller.ts
import { Request, Response, NextFunction } from 'express';
import User from '../../models/user/User.model.js';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';

/**
 * GET /api/v1/users/profile/me
 * Get current user profile (safe fields only).
 */
export const getProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?._id;

  if (!userId) {
    throw new AppError('غير مصرح', 401);
  }

  const user = await User.findById(userId).select(
    '-password -loginAttempts -lockUntil -passwordResetOTP -passwordResetOTPExpires -passwordChangedAt'
  );

  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  res.status(200).json({
    success: true,
    data: { user },
  });
});

/**
 * PATCH /api/v1/users/profile/me
 * Update user profile (name, phone only).
 */
export const updateProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?._id;

  if (!userId) {
    throw new AppError('غير مصرح', 401);
  }

  // Only allow updating name and phone
  const { name, phone } = req.body;
  const updates: Record<string, any> = {};

  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;

  const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true }).select(
    '-password -loginAttempts -lockUntil -passwordResetOTP -passwordResetOTPExpires -passwordChangedAt'
  );

  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  res.status(200).json({
    success: true,
    message: 'تم تحديث الملف الشخصي بنجاح',
    data: { user },
  });
});
