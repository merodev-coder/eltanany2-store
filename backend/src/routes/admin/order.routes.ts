// backend/src/routes/admin/order.routes.ts
import { Router } from 'express';
import * as orderController from '../../controllers/user/order.controller.js';
import authenticateAdmin from '../../middleware/authenticateAdmin.js';
import validate from '../../middleware/validate.js';
import { updateOrderStatusSchema, updateDepositStatusSchema } from '../../validators/order.validator.js';

const router = Router();

// ── Admin Protected ──────────────────────────────────────
router.use(authenticateAdmin());

// List all orders
router.get('/', orderController.getAllOrders);

// Update order status
router.patch('/:id/status', validate(updateOrderStatusSchema), orderController.updateOrderStatus);

// Update deposit verification status
router.patch('/:id/deposit-status', validate(updateDepositStatusSchema), orderController.updateDepositStatus);

export default router;
