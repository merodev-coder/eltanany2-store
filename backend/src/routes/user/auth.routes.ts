// backend/src/routes/user/auth.routes.ts
import { Router } from 'express';
import * as authController from '../../controllers/user/auth.controller.js';
import authenticateUser from '../../middleware/authenticateUser.js';
import validate from '../../middleware/validate.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from '../../validators/auth.validator.js';
import { authLimiter, passwordResetLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

// ── Public ───────────────────────────────────────────────
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', passwordResetLimiter, validate(resetPasswordSchema), authController.resetPassword);

// ── Protected ──────────────────────────────────────────
router.post('/logout', authenticateUser, authController.logout);
router.post('/refresh', authController.refresh);
router.get('/me', authenticateUser, authController.getMe);
router.post('/change-password', authenticateUser, validate(changePasswordSchema), authController.changePassword);

export default router;
