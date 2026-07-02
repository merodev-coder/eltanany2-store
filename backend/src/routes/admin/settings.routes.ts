// backend/src/routes/admin/settings.routes.ts
import { Router } from 'express';
import { getPaymentMethods, updatePaymentMethods, getPriceList, updatePriceList } from '../../controllers/admin/settings.controller.js';
import authenticateAdmin from '../../middleware/authenticateAdmin.js';
import { paymentLimiter } from '../../middleware/paymentRateLimiter.js';
import {
  getPaymentSettingsSchema,
  updatePaymentSettingsSchema,
  updatePriceListSchema,
} from '../../validators/settings.validator.js';
import validate from '../../middleware/validate.js';

const router = Router();

// All routes require admin authentication
router.use(authenticateAdmin);

// ── GET /payment — read-only, no body validation needed ──────────────────
router.get('/payment', getPaymentMethods);

// ── POST /payment — mutation, payment-scoped limiter + Zod ───────────────
router.post(
  '/payment',
  paymentLimiter,
  validate(updatePaymentSettingsSchema),
  updatePaymentMethods,
);

// ── GET /price-list — read-only ─────────────────────────────────────────
router.get('/price-list', getPriceList);

// ── POST /price-list — mutation, payment-scoped limiter + Zod ───────────
router.post(
  '/price-list',
  paymentLimiter,
  validate(updatePriceListSchema),
  updatePriceList,
);

export default router;
