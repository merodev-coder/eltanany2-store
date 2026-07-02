// backend/src/controllers/admin/product.controller.ts
import { Request, Response, NextFunction } from 'express';
import Product from '../../models/admin/Product.model.js';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';

/**
 * GET /api/v1/admin/products
 * Paginated list of products with search and database-aggregated stats.
 */
export const getProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string) || 20);
  const skip = (page - 1) * limit;
  const search = req.query.search as string;
  const category = req.query.category as string;

  const filter: Record<string, any> = { isPublished: { $ne: false } };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) {
    filter.category = category;
  }

  // Aggregate stats from the whole collection (unfiltered for total inventory inventory value, low stock, etc.)
  const [products, total, statsData] = await Promise.all([
    Product.find(filter)
      .select('-description -images') // Exclude description and images to reduce payload size to the minimum
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
    Product.aggregate([
      {
        $match: { isPublished: { $ne: false } }
      },
      {
        $group: {
          _id: null,
          totalInventoryValue: {
            $sum: {
              $multiply: [
                { $ifNull: ['$stock', 0] },
                { $ifNull: ['$buyingPrice', { $ifNull: ['$sellingPrice', { $ifNull: ['$price', 0] }] }] }
              ]
            }
          },
          lowStockCount: {
            $sum: {
              $cond: [{ $lte: [{ $ifNull: ['$stock', 0] }, 5] }, 1, 0]
            }
          },
          activeProductsCount: {
            $sum: {
              $cond: [{ $gt: [{ $ifNull: ['$stock', 0] }, 0] }, 1, 0]
            }
          }
        }
      }
    ])
  ]);

  const stats = statsData[0] || {
    totalInventoryValue: 0,
    lowStockCount: 0,
    activeProductsCount: 0
  };

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
      stats: {
        totalInventoryValue: stats.totalInventoryValue,
        lowStockCount: stats.lowStockCount,
        activeProductsCount: stats.activeProductsCount
      }
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
  const bodyData = { ...req.body };

  // Enforce pricing defaults for cross-compat
  if (bodyData.price && !bodyData.sellingPrice) {
    bodyData.sellingPrice = bodyData.price;
  }
  if (!bodyData.buyingPrice) {
    bodyData.buyingPrice = bodyData.price || bodyData.sellingPrice || 0;
  }
  if (bodyData.sellingPrice && !bodyData.price) {
    bodyData.price = bodyData.sellingPrice;
  }

  const product = await Product.create({
    ...bodyData,
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
  const bodyData = { ...req.body };

  // Sync price details if updated
  if (bodyData.price && !bodyData.sellingPrice) {
    bodyData.sellingPrice = bodyData.price;
  } else if (bodyData.sellingPrice && !bodyData.price) {
    bodyData.price = bodyData.sellingPrice;
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: bodyData },
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
