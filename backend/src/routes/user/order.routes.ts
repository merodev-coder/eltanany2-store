// backend/src/routes/user/order.routes.ts
import { Router } from 'express';
import * as orderController from '../../controllers/user/order.controller.js';
import authenticateUser from '../../middleware/authenticateUser.js';
import validate from '../../middleware/validate.js';
import { createOrderSchema } from '../../validators/order.validator.js';

const router = Router();

// ── Protected ──────────────────────────────────────────
router.use(authenticateUser);

router.post('/', validate(createOrderSchema), orderController.createOrder);
router.get('/my', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/receipt', orderController.attachReceipt);

export default router;
