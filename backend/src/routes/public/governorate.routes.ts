// backend/src/routes/public/governorate.routes.ts
import { Router } from 'express';
import { getActiveGovernorates } from '../../controllers/admin/governorate.controller.js';

const router = Router();

// ── Public: list active governorates for checkout ──────
router.get('/', getActiveGovernorates);

export default router;
