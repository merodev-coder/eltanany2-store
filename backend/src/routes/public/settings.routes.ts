// backend/src/routes/public/settings.routes.ts
import { Router } from 'express';
import AdminSettings from '../../models/admin/AdminSettings.model.js';
import catchAsync from '../../utils/catchAsync.js';

const router = Router();

// GET /api/v1/public/settings
// Public endpoint — no authentication required
router.get('/', catchAsync(async (req, res) => {
  const settings = await (AdminSettings as any).getOrCreate();
  res.status(200).json({
    success: true,
    data: {
      vodafoneCashNumber: settings.paymentMethods?.vodafoneCash || '01000000000',
      instaPayAccount: settings.paymentMethods?.instaPay || '@username',
    },
  });
}));

// GET /api/v1/public/settings/price-list
// Public endpoint to get price list URL — no authentication required
router.get('/price-list', catchAsync(async (req, res) => {
  const settings = await (AdminSettings as any).getOrCreate();
  res.status(200).json({
    success: true,
    data: {
      url: settings.priceList?.url || '',
      fileName: settings.priceList?.fileName || '',
      uploadedAt: settings.priceList?.uploadedAt || null,
    },
  });
}));

export default router;
