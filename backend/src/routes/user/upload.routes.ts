// backend/src/routes/user/upload.routes.ts
import { Router } from 'express';
import { uploadReceipt } from '../../controllers/user/upload.controller.js';
import authenticateUser from '../../middleware/authenticateUser.js';

const router = Router();

// POST /api/v1/users/upload/receipt
router.post('/receipt', authenticateUser, uploadReceipt);

export default router;
