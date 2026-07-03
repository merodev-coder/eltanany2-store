// backend/src/routes/admin/orders.routes.ts
import { Router } from 'express';
import authenticateAdmin from '../../middleware/authenticateAdmin.js';
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  cleanupOldOrders,
} from '../../controllers/admin/orders.controller.js';

const router = Router();

// All routes require admin authentication and optional X-Admin-Origin header
router.use(authenticateAdmin());

// List all orders (supports ?status=pending&page=1&limit=20)
router.get('/', getAllOrders);

// Get single order details
router.get('/:id', getOrderById);

// Accept / reject / update status  → body: { status: 'approved' | 'rejected' | ... }
router.patch('/:id/status', updateOrderStatus);

// Hard delete — removes document permanently from DB
router.delete('/:id', deleteOrder);

// Force cleanup of orders older than 15 days
router.delete('/cleanup/old', cleanupOldOrders);

export default router;
