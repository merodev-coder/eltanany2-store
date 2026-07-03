// backend/src/controllers/user/cart.controller.ts
import { Request, Response, NextFunction } from 'express';
import Cart from '../../models/user/Cart.model.js';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';

/**
 * GET /api/v1/users/cart
 * Get the current user's cart.
 */
export const getCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?._id;
  const userEmail = (req as any).user?.email;

  if (!userId) {
    throw new AppError('غير مصرح', 401);
  }

  const cart = await Cart.findOne({ user: userId });

  res.status(200).json({
    success: true,
    data: { cart: cart || { items: [] } },
  });
});

/**
 * POST /api/v1/users/cart
 * Sync (create or update) the user's cart.
 */
export const syncCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?._id;
  const userEmail = (req as any).user?.email;

  if (!userId) {
    throw new AppError('غير مصرح', 401);
  }

  const { items } = req.body;

  if (!Array.isArray(items)) {
    throw new AppError('عناصر العربة غير صالحة', 400);
  }

  // Upsert the cart with userEmail for identification
  const cart = await Cart.findOneAndUpdate(
    { user: userId },
    {
      items,
      userEmail: userEmail || undefined,
      updatedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  res.status(200).json({
    success: true,
    message: 'تم تحديث العربة بنجاح',
    data: { cart },
  });
});

/**
 * DELETE /api/v1/users/cart
 * Clear the user's cart.
 */
export const clearCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?._id;

  if (!userId) {
    throw new AppError('غير مصرح', 401);
  }

  await Cart.findOneAndUpdate(
    { user: userId },
    { items: [], updatedAt: new Date() },
    { upsert: true }
  );

  res.status(200).json({
    success: true,
    message: 'تم تفريغ العربة بنجاح',
    data: { cart: { items: [] } },
  });
});

/**
 * POST /api/v1/users/cart/guest
 * Sync a guest cart from cookies into the DB after login.
 */
export const syncGuestCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?._id;
  const userEmail = (req as any).user?.email;

  if (!userId) {
    throw new AppError('غير مصرح', 401);
  }

  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError('عناصر العربة غير صالحة', 400);
  }

  const existingCart = await Cart.findOne({ user: userId });

  if (existingCart) {
    // Merge guest items into existing cart
    const mergedItems = [...existingCart.items];
    for (const guestItem of items) {
      const existingIndex = mergedItems.findIndex(
        (item) => String(item.product) === String(guestItem.productId) && item.color === guestItem.color
      );
      if (existingIndex >= 0) {
        mergedItems[existingIndex].qty += guestItem.qty;
      } else {
        mergedItems.push(guestItem);
      }
    }

    existingCart.items = mergedItems as any;
    existingCart.userEmail = userEmail || existingCart.userEmail;
    await existingCart.save();

    return res.status(200).json({
      success: true,
      message: 'تم دمج العربة المخزنة بنجاح',
      data: { cart: existingCart },
    });
  }

  // Create new cart with guest items
  const cart = await Cart.create({
    user: userId,
    userEmail: userEmail || undefined,
    items,
  });

  res.status(201).json({
    success: true,
    message: 'تم نقل العربة بنجاح',
    data: { cart },
  });
});
