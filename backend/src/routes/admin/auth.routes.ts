// backend/src/routes/admin/auth.routes.ts
import { Router } from 'express';
import * as authController from '../../controllers/admin/auth.controller.js';
import authenticateAdmin from '../../middleware/authenticateAdmin.js';
import validate from '../../middleware/validate.js';
import { adminLoginSchema } from '../../validators/auth.validator.js';
import { authLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

// ── Public ───────────────────────────────────────────────
router.post('/login', authLimiter, validate(adminLoginSchema), authController.adminLogin);

// ── Protected ──────────────────────────────────────────
router.post('/logout', authenticateAdmin(), authController.adminLogout);
router.post('/refresh', authController.adminRefresh);
router.get('/me', authenticateAdmin(), authController.getAdminMe);

export default router;
