// backend/src/validators/governorate.validator.ts
import { z } from 'zod';

// ── Create Governorate ─────────────────────────────────
export const createGovernorateSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'اسم المحافظة مطلوب'),
    shippingFee: z.number().min(0, 'تكلفة الشحن يجب أن تكون موجبة'),
    active: z.boolean().optional(),
    cities: z.array(z.string()).optional(),
    carrierId: z.string().optional(),
  }),
});

// ── Update Governorate ─────────────────────────────────
export const updateGovernorateSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    shippingFee: z.number().min(0).optional(),
    active: z.boolean().optional(),
    cities: z.array(z.string()).optional(),
    carrierId: z.string().optional(),
  }),
});
