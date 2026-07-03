// backend/src/controllers/admin/orders.controller.ts
import { Request, Response, NextFunction } from 'express';
import Order from '../../models/user/Order.model.js';
import Product from '../../models/admin/Product.model.js';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';
import { userMongoose } from '../../config/db.js';

/** GET /api/v1/admin/orders */
export const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const skip = (page - 1) * limit;
  const status = req.query.status as string | undefined;
  const search = req.query.search as string | undefined;

  const filter: Record<string, unknown> = {};

  if (status && status !== 'all') {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'customerInfo.name': { $regex: search, $options: 'i' } },
      { 'customerInfo.phone': { $regex: search, $options: 'i' } },
    ];
  }

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-totalCost -totalRevenue -netProfit'),
    Order.countDocuments(filter),
  ]);

  const transformedOrders = orders.map((order) => ({
    ...order.toObject(),
    customerName: order.customerInfo?.name || '',
    customerPhone: order.customerInfo?.phone || '',
    customerAddress: order.customerInfo?.address || '',
    totalValue: order.totalAmount,
  }));

  res.status(200).json({
    success: true,
    data: {
      orders: transformedOrders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  });
});

/** PATCH /api/v1/admin/orders/:id/status (accept or reject) */
export const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'approved', 'rejected', 'delivered', 'cancelled'].includes(status)) {
    throw new AppError('حالة الطلب غير صالحة', 400);
  }

  const order = await Order.findById(id);
  if (!order) {
    throw new AppError('الطلب غير موجود', 404);
  }

  order.status = status;
  if (status === 'approved' || status === 'delivered' || status === 'cancelled') {
    order.isPaid = true;
    order.paidAt = new Date();
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: 'تم تحديث حالة الطلب بنجاح',
    data: { order },
  });
});

/** DELETE /api/v1/admin/orders/:id — hard delete */
export const deleteOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const order = await Order.findById(id);
  if (!order) {
    throw new AppError('الطلب غير موجود', 404);
  }

  await Order.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'تم حذف الطلب نهائياً',
  });
});

/** GET /api/v1/admin/orders/:id */
export const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const order = await Order.findById(id).select('-totalCost -totalRevenue -netProfit');
  if (!order) {
    throw new AppError('الطلب غير موجود', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      ...order.toObject(),
      customerName: order.customerInfo?.name || '',
      customerPhone: order.customerInfo?.phone || '',
      customerAddress: order.customerInfo?.address || '',
      totalValue: order.totalAmount,
    },
  });
});

/** Cron-style: delete orders older than 15 days */
export const cleanupOldOrders = catchAsync(async (_req: Request, res: Response) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 15);

  const result = await Order.deleteMany({
    createdAt: { $lt: cutoffDate },
    status: { $nin: ['approved', 'delivered'] },
  });

  res.status(200).json({
    success: true,
    message: `تم حذف ${result.deletedCount} طلب قديم`,
    deletedCount: result.deletedCount,
  });
});
