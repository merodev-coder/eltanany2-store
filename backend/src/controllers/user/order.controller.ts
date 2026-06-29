// backend/src/controllers/user/order.controller.ts
import { Request, Response, NextFunction } from 'express';
import Order from '../../models/user/Order.model.js';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';

/**
 * POST /api/v1/users/orders
 * Create a new order for the authenticated user.
 */
export const createOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?._id;

  if (!userId) {
    throw new AppError('غير مصرح', 401);
  }

  const {
    items,
    notes,
    customerName,
    customerPhone,
    governorate,
    city,
    address,
    landmark,
    deliveryMethod,
    paymentMethod,
    shippingCost,
    depositAmount,
    totalAmount,
    depositSlipUrl,
  } = req.body;

  // Validate required fields for 422 fix
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError('الطلب يجب أن يحتوي على منتج واحد على الأقل', 422);
  }

  if (!customerName || !customerPhone || !address) {
    throw new AppError('بيانات العميل غير مكتملة', 422);
  }

  // If shipping is selected, deposit slip is mandatory
  if (deliveryMethod === 'home' && !depositSlipUrl) {
    throw new AppError('إيصال العربون مطلوب عند اختيار التوصيل', 422);
  }

  const subtotal = items.reduce((sum: number, item: { price: number; qty: number }) =>
    sum + item.price * item.qty, 0
  );

  // Set deposit status based on delivery method
  const initialDepositStatus = deliveryMethod === 'pickup' ? 'not_required' : 'pending';

  const order = await Order.create({
    user: userId,
    items,
    subtotal,
    shippingCost: shippingCost || 0,
    depositAmount: depositAmount || 0,
    totalAmount,
    customerName,
    customerPhone,
    governorate,
    city,
    address,
    landmark,
    deliveryMethod,
    paymentMethod: paymentMethod || 'cod',
    depositSlipUrl,
    depositStatus: initialDepositStatus,
    notes,
  });

  res.status(201).json({
    success: true,
    message: 'تم إنشاء الطلب بنجاح',
    data: { order },
  });
});

/**
 * GET /api/v1/users/orders/my
 * Get all orders for the current user.
 */
export const getMyOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?._id;

  if (!userId) {
    throw new AppError('غير مصرح', 401);
  }

  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { orders },
  });
});

/**
 * GET /api/v1/users/orders/:id
 * Get a single order by ID (must belong to the current user).
 */
export const getOrderById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?._id;
  const orderId = req.params.id;

  if (!userId) {
    throw new AppError('غير مصرح', 401);
  }

  const order = await Order.findOne({ _id: orderId, user: userId });

  if (!order) {
    throw new AppError('الطلب غير موجود', 404);
  }

  res.status(200).json({
    success: true,
    data: { order },
  });
});

/**
 * PATCH /api/v1/users/orders/:id/receipt
 * Attach receipt URL to a pending order.
 */
export const attachReceipt = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?._id;
  const orderId = req.params.id;
  const { receiptUrl } = req.body;

  if (!userId) {
    throw new AppError('غير مصرح', 401);
  }

  const order = await Order.findOne({ _id: orderId, user: userId, status: 'pending' });

  if (!order) {
    throw new AppError('الطلب غير موجود أو لم يعد قابلاً للتعديل', 404);
  }

  order.receiptUrl = receiptUrl;
  await order.save();

  res.status(200).json({
    success: true,
    message: 'تم رفع الإيصال بنجاح',
    data: { order },
  });
});

/* ==========================================================
   Admin Endpoints
   ========================================================== */

/**
 * GET /api/v1/admin/orders
 * Get all orders for admin dashboard.
 */
export const getAllOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const orders = await Order.find()
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { orders },
  });
});

/**
 * PATCH /api/v1/admin/orders/:id/status
 * Update order status (admin only).
 */
export const updateOrderStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    throw new AppError('الطلب غير موجود', 404);
  }

  order.status = status as any;
  await order.save();

  res.status(200).json({
    success: true,
    message: 'تم تحديث حالة الطلب بنجاح',
    data: { order },
  });
});

/**
 * PATCH /api/v1/admin/orders/:id/deposit-status
 * Verify or reject deposit (admin only).
 */
export const updateDepositStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { depositStatus } = req.body;

  const order = await Order.findById(id);

  if (!order) {
    throw new AppError('الطلب غير موجود', 404);
  }

  if (depositStatus !== 'confirmed' && depositStatus !== 'rejected' && depositStatus !== 'pending') {
    throw new AppError('حالة العربون غير صالحة', 422);
  }

  // Prevent confirming if deposit slip URL is missing
  if (depositStatus === 'confirmed' && !order.depositSlipUrl) {
    throw new AppError('لا يمكن تأكيد العربون، إيصال غير موجود', 422);
  }

  // Prevent confirming if order is already cancelled
  if (depositStatus === 'confirmed' && order.status === 'cancelled') {
    throw new AppError('لا يمكن تأكيد العربون، الطلب ملغي', 422);
  }

  order.depositStatus = depositStatus;

  // If deposit is confirmed, update order status to processing
  if (depositStatus === 'confirmed') {
    order.status = 'processing';
  }

  // If deposit is rejected, update order status to cancelled
  if (depositStatus === 'rejected') {
    order.status = 'cancelled';
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: `تم تحديث حالة العربون إلى ${depositStatus}`,
    data: { order },
  });
});
