// backend/src/controllers/admin/product.controller.ts
import { Request, Response, NextFunction } from 'express';
import Product from '../../models/admin/Product.model.js';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';

/**
 * GET /api/v1/admin/products
 * Paginated list of products with search.
 */
export const getProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
  const skip = (page - 1) * limit;
  const search = req.query.search as string;
  const category = req.query.category as string;

  const filter: Record<string, any> = {};

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
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
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
 * GET /api/v1/admin/products/:id
 */
export const getProductById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError('المنتج غير موجود', 404);
  }

  res.status(200).json({
    success: true,
    data: { product },
  });
});

/**
 * POST /api/v1/admin/products
 * Create a new product.
 */
export const createProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const adminId = (req as any).admin?._id;

  const product = await Product.create({
    ...req.body,
    createdBy: adminId,
  });

  res.status(201).json({
    success: true,
    message: 'تم إنشاء المنتج بنجاح',
    data: { product },
  });
});

/**
 * PATCH /api/v1/admin/products/:id
 * Update a product.
 */
export const updateProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!product) {
    throw new AppError('المنتج غير موجود', 404);
  }

  res.status(200).json({
    success: true,
    message: 'تم تحديث المنتج بنجاح',
    data: { product },
  });
});

/**
 * DELETE /api/v1/admin/products/:id
 * Soft delete (unpublish) a product.
 */
export const deleteProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isPublished: false },
    { new: true }
  );

  if (!product) {
    throw new AppError('المنتج غير موجود', 404);
  }

  res.status(200).json({
    success: true,
    message: 'تم إخفاء المنتج بنجاح',
    data: { product },
  });
});
