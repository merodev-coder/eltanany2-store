// backend/src/routes/admin/governorate.routes.ts
import { Router } from 'express';
import * as governorateController from '../../controllers/admin/governorate.controller.js';
import authenticateAdmin from '../../middleware/authenticateAdmin.js';

const router = Router();

// ── Admin Protected ──────────────────────────────────────
router.use(authenticateAdmin());

router.get('/', governorateController.getAllGovernorates);
router.post('/', governorateController.createGovernorate);
router.patch('/:id', governorateController.updateGovernorate);
router.delete('/:id', governorateController.deleteGovernorate);

export default router;
