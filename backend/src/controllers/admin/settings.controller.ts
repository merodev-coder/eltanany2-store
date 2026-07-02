// backend/src/controllers/admin/settings.controller.ts
import { Request, Response, NextFunction } from 'express';
import AdminSettings from '../../models/admin/AdminSettings.model.js';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';

// ── GET /api/v1/admin/settings/payment ────────────────────────────────────
export const getPaymentMethods = catchAsync(async (req: Request, res: Response) => {
  const settings = await AdminSettings.getOrCreate();

  res.status(200).json({
    success: true,
    data: {
      vodafoneCashNumber: settings.paymentMethods?.vodafoneCash || '',
      instaPayAccount: settings.paymentMethods?.instaPay || '',
    },
  });
});

// ── POST /api/v1/admin/settings/payment ───────────────────────────────────
// Body is validated upstream (Zod schema `updatePaymentSettingsSchema`), so
// TypeScript narrows `req.body` to `{ vodafoneCashNumber?: string; instaPayAccount?: string }`.
export const updatePaymentMethods = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { vodafoneCashNumber, instaPayAccount } = req.body as {
    vodafoneCashNumber?: string;
    instaPayAccount?: string;
  };

  // Explicit field mapping: cast each through String().trim() so nothing
  // sneaks through (no injection vector).
  const update: Record<string, string> = {};
  if (vodafoneCashNumber !== undefined) {
    update.vodafoneCash = String(vodafoneCashNumber).trim().slice(0, 20);
  }
  if (instaPayAccount !== undefined) {
    update.instaPay = String(instaPayAccount).trim().slice(0, 50);
  }

  const settings = await AdminSettings.getOrCreate();

  if (!settings.paymentMethods) {
    settings.paymentMethods = { vodafoneCash: '', instaPay: '' };
  }

  if ('vodafoneCash' in update) {
    settings.paymentMethods.vodafoneCash = update.vodafoneCash;
  }
  if ('instaPay' in update) {
    settings.paymentMethods.instaPay = update.instaPay;
  }

  await settings.save();

  res.status(200).json({
    success: true,
    message: 'تم تحديث طرق الدفع بنجاح',
    data: {
      vodafoneCashNumber: settings.paymentMethods.vodafoneCash,
      instaPayAccount: settings.paymentMethods.instaPay,
    },
  });
});

// ── GET /api/v1/admin/settings/price-list ─────────────────────────────────
export const getPriceList = catchAsync(async (req: Request, res: Response) => {
  const settings = await AdminSettings.getOrCreate();

  res.status(200).json({
    success: true,
    data: {
      url: settings.priceList?.url || '',
      fileName: settings.priceList?.fileName || '',
      uploadedAt: settings.priceList?.uploadedAt || null,
    },
  });
});

// ── POST /api/v1/admin/settings/price-list ────────────────────────────────
// Body validated upstream (`updatePriceListSchema`), so fields are guaranteed present.
export const updatePriceList = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { url, fileName } = req.body as { url: string; fileName: string };

  // Defensive: even though Zod already validated, guard against empty strings
  // from a class of bypass where an empty string passes zod's `min(1)`.
  if (!url?.trim() || !fileName?.trim()) {
    return next(new AppError('URL and fileName are required', 400));
  }

  const settings = await AdminSettings.getOrCreate();

  if (!settings.priceList) {
    settings.priceList = { url: '', fileName: '', uploadedAt: new Date() };
  }

  settings.priceList.url = url.trim();
  settings.priceList.fileName = fileName.trim();
  settings.priceList.uploadedAt = new Date();

  await settings.save();

  res.status(200).json({
    success: true,
    message: 'تم تحديث قائمة الأسعار بنجاح',
    data: {
      url: settings.priceList.url,
      fileName: settings.priceList.fileName,
      uploadedAt: settings.priceList.uploadedAt,
    },
  });
});
