// backend/src/routes/admin/settings.routes.ts
// All admin "settings" routes live here so they share ONE auth middleware block
// and mount at /api/v1/admin/settings/price-list and /api/v1/admin/settings/payment.
// Price-list is stored purely in-memory — no MongoDB, no AdminSettings.
import { Router } from 'express';
import { getPaymentMethods, updatePaymentMethods } from './../../controllers/admin/settings.controller.js';
import {
  getPriceList,
  createPriceList,
  removePriceList,
} from './../../controllers/admin/priceList.controller.js';
import authenticateAdmin from './../../middleware/authenticateAdmin.js';
import { paymentLimiter } from './../../middleware/paymentRateLimiter.js';
import validate from './../../middleware/validate.js';
import {
  getPaymentSettingsSchema,
  updatePaymentSettingsSchema,
  updatePriceListSchema,
} from './../../validators/settings.validator.js';

const router = Router();
router.use(authenticateAdmin);

// ── Payment (backwards-compat — values are hardcoded, saving is a no-op)
router.get('/payment', getPaymentMethods);
router.post('/payment', paymentLimiter, validate(updatePaymentSettingsSchema), updatePaymentMethods);

// ── Price-list  (docx — in-memory only, no DB)
router.get('/price-list', getPriceList);
router.post('/price-list', paymentLimiter, validate(updatePriceListSchema), createPriceList);
router.delete('/price-list', removePriceList);

export default router;
