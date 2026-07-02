// backend/src/validators/settings.validator.ts
import { z } from 'zod';

// ── Admin: GET /payment ────────────────────────────────────────────────────
// GET has no body, but the route is wrapped for consistent attach point.
export const getPaymentSettingsSchema = z.object({});

// ── Admin: POST /payment ───────────────────────────────────────────────────
// Explicit field mapping — only these two fields are accepted, no passthrough.
export const updatePaymentSettingsSchema = z.object({
  body: z.object({
    vodafoneCashNumber: z
      .string()
      .max(20, 'رقم Vodafone Cash طويل جداً')
      .regex(/^$|^[\d+\-() ]{0,20}$/, 'أدخل رقم هاتف صالح')
      .optional(),
    instaPayAccount: z
      .string()
      .max(50, 'حساب InstaPay طويل جداً')
      .regex(/^$|^.{3,50}$/, 'أدخل حساب InstaPay صالح (3–50 حرف)')
      .optional(),
  }),
});

// ── Admin: POST /price-list ───────────────────────────────────────────────
export const updatePriceListSchema = z.object({
  body: z.object({
    url: z.string().url('أدخل رابط صالح').max(500, 'الرابط طويل جداً'),
    fileName: z.string().min(1, 'اسم الملف مطلوب').max(200, 'اسم الملف طويل جداً'),
  }),
});
