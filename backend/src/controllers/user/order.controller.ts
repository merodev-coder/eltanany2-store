// backend/src/controllers/user/order.controller.ts
import { Request, Response, NextFunction } from 'express';
import Order from '../../models/user/Order.model.js';
import Product from '../../models/admin/Product.model.js';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';
import { userMongoose } from '../../config/db.js';

/**
 * POST /api/v1/users/orders
 * Create a new order from the user's cart.
 * Accepts JSON body with receiptUrl from Uploadthing.
 */
export const createOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?._id;
  if (!userId) {
    throw new AppError('يجب تسجيل الدخول أولاً', 401);
  }

  // ── Parse body fields ─────────────────────────────────
  const {
    customerName,
    customerPhone,
    customerAddress,
    notes,
    deliveryType,
    governorate,
    shippingCost,
    paymentMethod,
    items: itemsRaw,
    subtotal,
    receiptUrl,
  } = req.body;

  let items: any[] = [];
  try {
    items = typeof itemsRaw === 'string' ? JSON.parse(itemsRaw) : itemsRaw;
  } catch {
    throw new AppError('بيانات المنتجات غير صالحة', 400);
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError('السلة فارغة', 400);
  }

  // ── Validate receipt URL from Uploadthing ─────────────
  // Receipt is only required for shipping orders
  if (deliveryType === 'shipping' && !receiptUrl) {
    throw new AppError('يرجى رفع إيصال الدفع', 400);
  }

  // ── Validate products and calculate totals ───────────
  let calculatedSubtotal = 0;
  let totalCost = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId).select('sellingPrice price name');
    if (!product) {
      throw new AppError(`المنتج ${item.name} غير موجود`, 400);
    }

    const price = Number(item.price ?? product.sellingPrice ?? product.price ?? 0);
    const qty = Number(item.qty ?? item.quantity ?? 1);
    const itemTotal = price * qty;
    calculatedSubtotal += itemTotal;

    // Calculate cost for profit tracking
    const costPrice = 0; // buyingPrice removed
    totalCost += costPrice * qty; // 0 because buyingPrice removed

    orderItems.push({
      product: new userMongoose.Types.ObjectId(item.productId),
      name: item.name || product.name,
      price,
      quantity: qty,
      image: item.imageUrl || '',
      color: item.color || undefined,
    });
  }

  const safeSubtotal = Number(subtotal ?? calculatedSubtotal);
  // Enforce flat shipping rate of 150 EGP for all shipping orders
  const safeShipping = deliveryType === 'shipping' ? 150 : Number(shippingCost ?? 0);
  const totalAmount = safeSubtotal + safeShipping;
  const totalRevenue = safeSubtotal;
  const netProfit = totalRevenue - totalCost;

  const order = await Order.create({
    user: userId,
    items: orderItems,
    subtotal: safeSubtotal,
    shippingCost: safeShipping,
    totalAmount,
    status: deliveryType === 'pickup' ? 'pending' : 'pending',
    deliveryType: deliveryType || 'shipping',
    shippingAddress: governorate
      ? {
          governorate,
          phone: customerPhone,
        }
      : undefined,
    customerInfo: {
      name: customerName,
      phone: customerPhone,
      address: customerAddress || '',
      notes: notes || '',
    },
    paymentMethod: paymentMethod || undefined,
    receiptUrl: receiptUrl || undefined,
    totalCost,
    totalRevenue,
    netProfit,
  });

  res.status(201).json({
    success: true,
    message: 'تم إنشاء الطلب بنجاح',
    data: { order },
  });
});

/**
 * GET /api/v1/users/orders/my
 * Get all orders for the authenticated user.
 */
export const getMyOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?._id;
  if (!userId) {
    throw new AppError('يجب تسجيل الدخول أولاً', 401);
  }

  const orders = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .select('-totalCost -totalRevenue -netProfit');

  res.status(200).json({
    success: true,
    data: { orders },
  });
});

/**
 * GET /api/v1/users/orders/:id
 * Get a single order by ID (must belong to the user).
 */
export const getOrderById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?._id;
  if (!userId) {
    throw new AppError('يجب تسجيل الدخول أولاً', 401);
  }

  const { id } = req.params;
  const order = await Order.findOne({ _id: id, user: userId });

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
 * Attach a receipt URL to an existing order.
 */
export const attachReceipt = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?._id;
  if (!userId) {
    throw new AppError('يجب تسجيل الدخول أولاً', 401);
  }

  const { id } = req.params;
  const { receiptUrl } = req.body;

  const order = await Order.findOneAndUpdate(
    { _id: id, user: userId },
    { receiptUrl, receiptVerified: false },
    { new: true }
  );

  if (!order) {
    throw new AppError('الطلب غير موجود', 404);
  }

  res.status(200).json({
    success: true,
    message: 'تم إرفاق الإيصال بنجاح',
    data: { order },
  });
});

// ── Admin Endpoints ──────────────────────────────────────

/**
 * GET /api/v1/admin/orders
 * List all orders (admin only) with pagination, filtering, and search.
 */
export const getAllOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const skip = (page - 1) * limit;
  const status = req.query.status as string;
  const search = req.query.search as string;

  const filter: Record<string, any> = {};
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
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-totalCost -totalRevenue -netProfit'),
    Order.countDocuments(filter),
  ]);

  // Transform orders to match frontend types (add aliased fields)
  const transformedOrders = orders.map(order => ({
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
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
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

  order.status = status;
  if (status === 'approved' || status === 'delivered') {
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

/**
 * PATCH /api/v1/admin/orders/:id/deposit-status
 * Update deposit/receipt verification status (admin only).
 */
export const updateDepositStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { receiptVerified } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    throw new AppError('الطلب غير موجود', 404);
  }

  order.receiptVerified = receiptVerified;
  await order.save();

  res.status(200).json({
    success: true,
    message: receiptVerified ? 'تم تأكيد الإيصال' : 'تم إلغاء تأكيد الإيصال',
    data: { order },
  });
});
