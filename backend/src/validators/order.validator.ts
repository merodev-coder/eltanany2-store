import { z } from 'zod';

// ── Create Order ───────────────────────────────────────
export const createOrderSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          name: z.string().min(1, 'اسم المنتج مطلوب'),
          price: z.number().min(0, 'السعر يجب أن يكون موجباً'),
          qty: z.number().int().min(1, 'الكمية يجب أن تكون على الأقل 1'),
          imageUrl: z.string().min(1, 'صورة المنتج مطلوبة'),
          color: z.string().optional(),
        })
      )
      .min(1, 'الطلب يجب أن يحتوي على منتج واحد على الأقل'),
    customerName: z.string().min(1, 'اسم العميل مطلوب'),
    customerPhone: z.string().min(1, 'رقم هاتف العميل مطلوب'),
    governorate: z.string().min(1, 'المحافظة مطلوبة'),
    city: z.string().min(1, 'المدينة مطلوبة'),
    address: z.string().min(1, 'العنوان مطلوب'),
    landmark: z.string().optional(),
    deliveryMethod: z.enum(['home', 'pickup'], {
      invalid_type_error: 'طريقة التوصيل غير صالحة',
    }),
    paymentMethod: z.enum(['cod'], {
      invalid_type_error: 'طريقة الدفع غير صالحة',
    }),
    shippingCost: z.number().min(0, 'تكلفة الشحن يجب أن تكون موجبة'),
    depositAmount: z.number().min(0, 'العربون يجب أن يكون موجباً'),
    totalAmount: z.number().min(0, 'الإجمالي يجب أن يكون موجباً'),
    depositSlipUrl: z.string().optional(),
    notes: z.string().max(500, 'ملاحظات الطلب يجب أن لا تتجاوز 500 حرف').optional(),
  }),
});

// ── Update Order Status (admin) ──────────────────────
export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(
      ['pending', 'approved', 'confirmed', 'processing', 'shipped', 'delivered', 'rejected', 'cancelled'],
      { invalid_type_error: 'حالة الطلب غير صالحة' }
    ),
  }),
});

// ── Update Deposit Status (admin) ────────────────────
export const updateDepositStatusSchema = z.object({
  body: z.object({
    depositStatus: z.enum(
      ['pending', 'confirmed', 'rejected', 'not_required'],
      { invalid_type_error: 'حالة العربون غير صالحة' }
    ),
  }),
});
