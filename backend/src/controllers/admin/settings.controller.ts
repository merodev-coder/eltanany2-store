// backend/src/controllers/admin/settings.controller.ts
import { Request, Response, NextFunction } from 'express';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';

// No DB at all. Hardcoded payment info (matches frontend CheckoutPage.tsx)
// Editor: change these directly if they change.
const VODAFONE_NUMBER = '01000000000';
const INSTAPAY_ACCOUNT = '@eltanany';

// ── GET /api/v1/admin/settings/payment ────────────────────────────────────
export const getPaymentMethods = catchAsync(async (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: { vodafoneCashNumber: VODAFONE_NUMBER, instaPayAccount: INSTAPAY_ACCOUNT },
  });
});

// ── POST /api/v1/admin/settings/payment ───────────────────────────────────
// No-op: payment methods are hardcoded. Kept for backwards compatibility.
export const updatePaymentMethods = catchAsync(async (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'تم تحديث طرق الدفع',
    data: { vodafoneCashNumber: VODAFONE_NUMBER, instaPayAccount: INSTAPAY_ACCOUNT },
  });
});
