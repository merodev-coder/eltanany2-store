// backend/src/controllers/admin/governorate.controller.ts
import { Request, Response, NextFunction } from 'express';
import Governorate from '../../models/admin/Governorate.model.js';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';

/**
 * GET /api/v1/admin/governorates
 * List all governorates (admin view, includes inactive).
 */
export const getAllGovernorates = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const governorates = await Governorate.find().sort({ name: 1 });

  res.status(200).json({
    success: true,
    data: { governorates },
  });
});

/**
 * POST /api/v1/admin/governorates
 * Create a new governorate.
 */
export const createGovernorate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, shippingFee, cities, carrierId } = req.body;

  // Check for duplicate name
  const existing = await Governorate.findOne({ name: name.trim() });
  if (existing) {
    throw new AppError('هذه المحافظة موجودة بالفعل', 409);
  }

  const governorate = await Governorate.create({
    name: name.trim(),
    shippingFee,
    cities: cities || [],
    carrierId: carrierId || '',
  });

  res.status(201).json({
    success: true,
    message: 'تم إضافة المحافظة بنجاح',
    data: { governorate },
  });
});

/**
 * PATCH /api/v1/admin/governorates/:id
 * Update a governorate.
 */
export const updateGovernorate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name, shippingFee, active, cities, carrierId } = req.body;

  const governorate = await Governorate.findById(id);
  if (!governorate) {
    throw new AppError('المحافظة غير موجودة', 404);
  }

  // Check name uniqueness if changed
  if (name && name.trim() !== governorate.name) {
    const existing = await Governorate.findOne({ name: name.trim(), _id: { $ne: id } });
    if (existing) {
      throw new AppError('هذه المحافظة موجودة بالفعل', 409);
    }
    governorate.name = name.trim();
  }

  if (shippingFee !== undefined) governorate.shippingFee = shippingFee;
  if (active !== undefined) governorate.active = active;
  if (cities !== undefined) governorate.cities = cities;
  if (carrierId !== undefined) governorate.carrierId = carrierId;

  await governorate.save();

  res.status(200).json({
    success: true,
    message: 'تم تحديث المحافظة بنجاح',
    data: { governorate },
  });
});

/**
 * DELETE /api/v1/admin/governorates/:id
 * Delete a governorate.
 */
export const deleteGovernorate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const result = await Governorate.findByIdAndDelete(id);
  if (!result) {
    throw new AppError('المحافظة غير موجودة', 404);
  }

  res.status(200).json({
    success: true,
    message: 'تم حذف المحافظة بنجاح',
  });
});

/**
 * GET /api/v1/public/governorates
 * List active governorates (public, for checkout).
 */
export const getActiveGovernorates = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const governorates = await Governorate.find({ active: true }).sort({ name: 1 }).select('name shippingFee cities');

  res.status(200).json({
    success: true,
    data: { governorates },
  });
});
