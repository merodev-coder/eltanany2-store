// backend/src/validators/product.validator.ts
import { z } from 'zod';

// ── Create Product ─────────────────────────────────────
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
    price: z
      .number({ required_error: 'السعر مطلوب', invalid_type_error: 'السعر يجب أن يكون رقماً' })
      .min(0, 'السعر يجب أن يكون أكبر من أو يساوي 0'),
    buyingPrice: z.number().min(0).optional(),
    sellingPrice: z.number().min(0).optional(),
    stock: z
      .number({ required_error: 'المخزون مطلوب', invalid_type_error: 'المخزون يجب أن يكون رقماً' })
      .int('المخزون يجب أن يكون عدداً صحيحاً')
      .min(0, 'المخزون يجب أن يكون أكبر من أو يساوي 0'),
    category: z
      .string({ required_error: 'التصنيف مطلوب' })
      .trim()
      .min(1, 'التصنيف مطلوب'),
    subcategory: z.string().trim().optional(),
    brand: z.string().trim().optional(),
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

// ── Update Product ─────────────────────────────────────
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
    price: z
      .number()
      .min(0, 'السعر يجب أن يكون أكبر من أو يساوي 0')
      .optional(),
    buyingPrice: z.number().min(0).optional(),
    sellingPrice: z.number().min(0).optional(),
    stock: z
      .number()
      .int('المخزون يجب أن يكون عدداً صحيحاً')
      .min(0, 'المخزون يجب أن يكون أكبر من أو يساوي 0')
      .optional(),
    category: z.string().trim().optional(),
    subcategory: z.string().trim().optional(),
    brand: z.string().trim().optional(),
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
