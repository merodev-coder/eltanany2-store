// backend/src/routes/user/receipt.routes.ts
// Isolated route for deposit receipt uploads.

import { Router } from 'express';
import authenticateUser from '../../middleware/authenticateUser.js';
import { uploadReceipt, getReceiptById } from '../../controllers/user/receipt.controller.js';

const router = Router();

// POST /api/v1/users/receipt/upload — upload deposit receipt image
router.post('/upload', authenticateUser, uploadReceipt);

// GET /api/v1/users/receipt/:orderId — get deposit receipt for an order
router.get('/:orderId', authenticateUser, getReceiptById);

export default router;
