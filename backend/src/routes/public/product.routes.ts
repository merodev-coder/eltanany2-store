// backend/src/routes/public/product.routes.ts
import { Router } from 'express';
import * as productController from '../../controllers/public/product.controller.js';
import { generalLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

router.get('/', generalLimiter, productController.getPublishedProducts);
router.get('/:id', generalLimiter, productController.getPublishedProductById);

export default router;
