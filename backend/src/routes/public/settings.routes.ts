// backend/src/routes/public/settings.routes.ts
import { Router } from 'express';
import AdminSettings from '../../models/admin/AdminSettings.model.js';
import catchAsync from '../../utils/catchAsync.js';

const router = Router();

// GET /api/v1/public/settings/payment-methods
// Public endpoint — no authentication required
router.get( '/payment-methods' , catchAsync(async (req, res) => {
  const settings = await (AdminSettings as any).getOrCreate();
  res.status(200).json({
    success: true,
    data: {
      paymentMethods: settings.paymentMethods,
    },
  });
}));

export default router;
