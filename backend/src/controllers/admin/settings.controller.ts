// backend/src/controllers/admin/settings.controller.ts
import { Request, Response, NextFunction } from 'express';
import AdminSettings from '../../models/admin/AdminSettings.model.js';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';

/**
 * GET /api/v1/admin/settings/payment-methods
 * Get current payment method numbers (admin only).
 */
export const getPaymentMethods = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const settings = await (AdminSettings as any).getOrCreate();

  res.status(200).json({
    success: true,
    data: {
      paymentMethods: settings.paymentMethods,
    },
  });
});

/**
 * PUT /api/v1/admin/settings/payment-methods
 * Update payment method numbers (admin only).
 */
export const updatePaymentMethods = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { vodafoneCash, instaPay } = req.body;

  let settings = await (AdminSettings as any).getOrCreate();

  if (vodafoneCash !== undefined) {
    settings.paymentMethods.vodafoneCash = String(vodafoneCash).trim();
  }
  if (instaPay !== undefined) {
    settings.paymentMethods.instaPay = String(instaPay).trim();
  }

  await settings.save();

  res.status(200).json({
    success: true,
    message: 'تم تحديث طرق الدفع بنجاح',
    data: {
      paymentMethods: settings.paymentMethods,
    },
  });
});
