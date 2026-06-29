// backend/src/routes/admin/product.routes.ts
import { Router } from 'express';
import * as productController from '../../controllers/admin/product.controller.js';
import authenticateAdmin from '../../middleware/authenticateAdmin.js';
import validate from '../../middleware/validate.js';
import { createProductSchema, updateProductSchema } from '../../validators/product.validator.js';

const router = Router();

// ── Protected ──────────────────────────────────────────
router.use(authenticateAdmin());

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', authenticateAdmin('products:write'), validate(createProductSchema), productController.createProduct);
router.patch('/:id', authenticateAdmin('products:write'), validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', authenticateAdmin('products:write'), productController.deleteProduct);

export default router;
