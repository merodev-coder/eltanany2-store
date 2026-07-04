import { z } from 'zod';

// ── Enum helpers (must match Product.model.ts enums) ─────
const BrandEnum = z.enum(['HP', 'Dell', 'Lenovo']);
const CPUEnum  = z.enum(['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen']);
const GPUEnum  = z.enum(['Intel', 'NVIDIA', 'AMD']);
const RAMEnum  = z.enum(['8 GB', '16 GB', '32 GB', '64 GB']);
const StorEnum = z.enum(['128 GB', '256 GB', '512 GB']);

// ── Specs sub-schema ──────────────────────────────────────
const SpecsSchema = z.object({
  cpu:    CPUEnum.optional(),
  gpu:    GPUEnum.optional(),
  ram:    RAMEnum.optional(),
  storage: StorEnum.optional(),
});

// ── Create Product ────────────────────────────────────────
export const createProductSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'اسم المنتج مطلوب' })
      .trim()
      .min(2, 'اسم المنتج يجب أن يكون 2 أحرف على الأقل')
      .max(120, 'اسم المنتج يجب أن لا يتجاوز 120 حرف'),
    description: z
      .string({ required_error: 'وصف المنتج مطلوب' })
      .trim()
      .max(2000, 'الوصف يجب أن لا يتجاوز 2000 حرف'),
    // sellingPrice = price shown to customers (required)
    sellingPrice: z
      .number({ required_error: 'السعر مطلوب', invalid_type_error: 'السعر يجب أن يكون رقماً' })
      .min(0, 'السعر يجب أن يكون أكبر من أو يساوي 0'),
    price: z.number().min(0).optional(), // alias/legacy — sync with sellingPrice in controller
    stock: z
      .number({ required_error: 'المخزون مطلوب', invalid_type_error: 'المخزون يجب أن يكون رقماً' })
      .int('المخزون يجب أن يكون عدداً صحيحاً')
      .min(0, 'المخزون يجب أن يكون أكبر من أو يساوي 0'),
    category: z
      .string({ required_error: 'التصنيف مطلوب' })
      .trim()
      .min(1, 'التصنيف مطلوب'),
    subcategory: z.string().trim().optional(),
    brand: BrandEnum,
    specs: SpecsSchema.optional(),
    imageUrl: z.string().url('يجب أن تكون الصورة URL صالح').optional().or(z.literal('')),
    images: z
      .array(z.string().url('يجب أن تكون الصورة URL صالح'))
      .max(5, 'لا يمكن رفع أكثر من 5 صور')
      .optional()
      .default([]),
    isPublished: z.boolean().optional().default(true),
    rating: z.number().min(0).max(5).optional(),
    reviewCount: z.number().int().min(0).optional(),
    oldPrice: z.number().min(0).optional(),
    badge: z.string().trim().optional(),
    isFeatured: z.boolean().optional(),
    isNew: z.boolean().optional(),
  }),
});

// ── Update Product ────────────────────────────────────────
export const updateProductSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'اسم المنتج يجب أن يكون 2 أحرف على الأقل')
      .max(120, 'اسم المنتج يجب أن لا يتجاوز 120 حرف')
      .optional(),
    description: z
      .string()
      .trim()
      .max(2000, 'الوصف يجب أن لا يتجاوز 2000 حرف')
      .optional(),
    sellingPrice: z.number().min(0).optional(),
    price: z.number().min(0).optional(),
    stock: z
      .number()
      .int('المخزون يجب أن يكون عدداً صحيحاً')
      .min(0, 'المخزون يجب أن يكون أكبر من أو يساوي 0')
      .optional(),
    category: z.string().trim().optional(),
    subcategory: z.string().trim().optional(),
    brand: BrandEnum.optional(),
    specs: SpecsSchema.optional(),
    imageUrl: z.string().url('يجب أن تكون الصورة URL صالح').optional().or(z.literal('')),
    images: z
      .array(z.string().url('يجب أن تكون الصورة URL صالح'))
      .max(5, 'لا يمكن رفع أكثر من 5 صور')
      .optional(),
    isPublished: z.boolean().optional(),
    rating: z.number().min(0).max(5).optional(),
    reviewCount: z.number().int().min(0).optional(),
    oldPrice: z.number().min(0).optional(),
    badge: z.string().trim().optional(),
    isFeatured: z.boolean().optional(),
    isNew: z.boolean().optional(),
  }),
});
