// backend/src/routes/user/profile.routes.ts
import { Router } from 'express';
import * as profileController from '../../controllers/user/profile.controller.js';
import authenticateUser from '../../middleware/authenticateUser.js';
import validate from '../../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'الاسم يجب أن يكون 2 أحرف على الأقل')
      .max(50, 'الاسم يجب أن لا يتجاوز 50 حرف')
      .optional(),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^\+?[1-9]\d{1,14}$/.test(val),
        'رقم الهاتف غير صالح (E.164)'
      ),
  }),
});

// ── Protected ──────────────────────────────────────────
router.use(authenticateUser);

router.get('/me', profileController.getProfile);
router.patch('/me', validate(updateProfileSchema), profileController.updateProfile);

export default router;
