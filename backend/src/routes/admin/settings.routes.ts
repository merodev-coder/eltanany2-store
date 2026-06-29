// backend/src/routes/admin/settings.routes.ts
import { Router } from 'express';
import { getPaymentMethods, updatePaymentMethods } from '../../controllers/admin/settings.controller.js';
import authenticateAdmin from '../../middleware/authenticateAdmin.js';

const router = Router();

// All routes require admin authentication
router.use(authenticateAdmin);

// GET /api/v1/admin/settings/payment-methods
router.get('/payment-methods', getPaymentMethods);

// PUT /api/v1/admin/settings/payment-methods
router.put('/payment-methods', updatePaymentMethods);

export default router;
