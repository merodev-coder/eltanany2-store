// backend/src/routes/admin/priceList.routes.ts
import { Router } from 'express';
import {
  getPriceList,
  createPriceList,
  removePriceList,
} from '../../controllers/admin/priceList.controller.js';
import authenticateAdmin from '../../middleware/authenticateAdmin.js';

const router = Router();

// All routes require admin auth
router.use(authenticateAdmin);

// GET /admin/price-list → current price list (in-memory)
router.get('/', getPriceList);

// POST /admin/price-list → store new price list (after UploadThing callback)
router.post('/', createPriceList);

// DELETE /admin/price-list → clear the stored price list
router.delete('/', removePriceList);

export default router;
