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
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const skip = (page - 1) * limit;
  const search = req.query.search as string;
  const category = req.query.category as string;
  const subcategory = req.query.subcategory as string;
  const brand = req.query.brand as string;
  const minPrice = parseInt(req.query.minPrice as string);
  const maxPrice = parseInt(req.query.maxPrice as string);
  const isFeatured = req.query.isFeatured as string;

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

  if (subcategory) {
    filter.subcategory = subcategory;
  }

  if (brand) {
    const brands = brand.split(',').map((b) => b.trim());
    filter.brand = { $in: brands };
  }

  if (!isNaN(minPrice) || !isNaN(maxPrice)) {
    filter.price = {};
    if (!isNaN(minPrice)) filter.price.$gte = minPrice;
    if (!isNaN(maxPrice)) filter.price.$lte = maxPrice;
  }

  if (isFeatured) {
    filter.isFeatured = isFeatured === 'true';
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-createdBy -description -buyingPrice'),
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
  }).select('-createdBy -buyingPrice');

  if (!product) {
    throw new AppError('المنتج غير موجود', 404);
  }

  res.status(200).json({
    success: true,
    data: { product },
  });
});
