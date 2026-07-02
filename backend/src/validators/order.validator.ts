// backend/src/validators/order.validator.ts
import { z } from 'zod';

// ── Create Order ─────────────────────────────────────────
// When multer processes multipart/form-data, the 'items' field arrives
// as a JSON string (because FormData can't send nested objects natively).
// We accept a string here and let the controller JSON.parse it.
export const createOrderSchema = z.object({
  body: z.object({
    customerName: z.string().min(1, 'اسم العميل مطلوب'),
    customerPhone: z.string().min(1, 'رقم الهاتف مطلوب'),
    customerAddress: z.string().optional(),
    notes: z.string().optional(),
    deliveryType: z.enum(['shipping', 'pickup'], {
      errorMap: () => ({ message: 'نوع التوصيل يجب أن يكون شحن أو استلام من الفرع' }),
    }),
    governorate: z.string().optional(),
    shippingCost: z.coerce.number().min(0).optional().default(0),
    // paymentMethod is optional - required only for shipping
    paymentMethod: z.enum(['vodafone_cash', 'instapay', 'cash_on_delivery']).optional().nullable(),
    // items arrives as a JSON string from FormData
    items: z.string().min(1, 'السلة فارغة'),
    subtotal: z.coerce.number().min(0).optional(),
    // receiptUrl is optional - required only for shipping
    receiptUrl: z.string().nullable().optional(),
  }).superRefine((data, ctx) => {
    // For shipping orders, paymentMethod and receiptUrl are required
    if (data.deliveryType === 'shipping') {
      if (!data.paymentMethod) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'طريقة الدفع مطلوبة للشحن',
          path: ['paymentMethod'],
        });
      }
      if (!data.receiptUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'إيصال الدفع مطلوب للشحن',
          path: ['receiptUrl'],
        });
      }
    }
  }),
});

// ── Update Order Status ──────────────────────────────────
export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(
      ['pending', 'approved', 'confirmed', 'processing', 'shipped', 'delivered', 'rejected', 'cancelled'],
      { errorMap: () => ({ message: 'حالة الطلب غير صالحة' }) }
    ),
  }),
  params: z.object({
    id: z.string().min(1, 'معرف الطلب مطلوب'),
  }),
});

// ── Update Deposit Status ───────────────────────────────
export const updateDepositStatusSchema = z.object({
  body: z.object({
    receiptVerified: z.boolean({
      errorMap: () => ({ message: 'قيمة التحقق يجب أن تكون true أو false' }),
    }),
  }),
  params: z.object({
    id: z.string().min(1, 'معرف الطلب مطلوب'),
  }),
});
