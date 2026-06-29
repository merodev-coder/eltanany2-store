// backend/src/routes/user/cart.routes.ts
import { Router } from 'express';
import * as cartController from '../../controllers/user/cart.controller.js';
import authenticateUser from '../../middleware/authenticateUser.js';

const router = Router();

// ── Protected ──────────────────────────────────────────
router.use(authenticateUser);

router.get('/', cartController.getCart);
router.post('/', cartController.syncCart);
router.delete('/', cartController.clearCart);
router.post('/guest', cartController.syncGuestCart);

export default router;
