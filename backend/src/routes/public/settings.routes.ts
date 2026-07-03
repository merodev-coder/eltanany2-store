// backend/src/routes/public/settings.routes.ts
// Public endpoints — no authentication required.
// Reads payment info from hardcoded constants and price-list from in-memory store.

import { Router } from 'express';
import { getPriceListSnapshot } from '../../controllers/admin/priceList.controller.js';

const router = Router();

// Hardcoded payment details (matches frontend CheckoutPage.tsx)
// To change: edit the same constants in:
//   - backend/src/controllers/admin/settings.controller.ts
//   - frontend/src/pages/CheckoutPage.tsx
const PAYMENT_INFO = {
  vodafoneCashNumber: '01000000000',
  instaPayAccount: '@eltanany',
} as const;

// GET /api/v1/public/settings
router.get('/', (_req, res) => {
  res.json({ success: true, data: PAYMENT_INFO });
});

// GET /api/v1/public/settings/price-list
// Returns the in-memory price list URL (no DB hit).
// The admin uploads a .docx via UploadThing, which stores the file in
// UploadThing's cloud storage; the URL is then POSTed to the admin
// price-list endpoint and held in a module-level variable.
router.get('/price-list', (_req, res) => {
  res.json({ success: true, data: getPriceListSnapshot() });
});

export default router;
