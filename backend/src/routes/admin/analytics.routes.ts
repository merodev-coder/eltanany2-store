// backend/src/routes/admin/analytics.routes.ts
import { Router } from 'express';
import { getMonthlyAnalytics, getOverviewStats } from '../../controllers/admin/analytics.controller.js';
import authenticateAdmin from '../../middleware/authenticateAdmin.js';

const router = Router();

router.use(authenticateAdmin());

router.get('/monthly', getMonthlyAnalytics);
router.get('/overview', getOverviewStats);

export default router;
