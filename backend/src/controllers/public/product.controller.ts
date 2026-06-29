// backend/src/controllers/public/product.controller.ts
import { Request, Response, NextFunction } from 'express';
import Product from '../../models/admin/Product.model.js';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';

/**
 * GET /api/v1/public/products
 * Public product listing (only published).
 */
export const getPublishedProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
  const skip = (page - 1) * limit;
  const search = req.query.search as string;
  const category = req.query.category as string;

  const filter: Record<string, any> = { isPublished: true };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) {
    filter.category = category;
  }

  const [products, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-createdBy'),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      products,
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
 * GET /api/v1/public/products/:id
 * Get a single published product.
 */
export const getPublishedProductById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const product = await Product.findOne({
    _id: req.params.id,
    isPublished: true,
  }).select('-createdBy');

  if (!product) {
    throw new AppError('المنتج غير موجود', 404);
  }

  res.status(200).json({
    success: true,
    data: { product },
  });
});
