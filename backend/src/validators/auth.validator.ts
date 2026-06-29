// backend/src/validators/auth.validator.ts
import { z } from 'zod';

// ── User Registration ──────────────────────────────────
export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'الاسم مطلوب',
        invalid_type_error: 'الاسم يجب أن يكون نصاً',
      })
      .trim()
      .min(2, 'الاسم يجب أن يكون 2 أحرف على الأقل')
      .max(50, 'الاسم يجب أن لا يتجاوز 50 حرف'),
    email: z
      .string({ required_error: 'البريد الإلكتروني مطلوب' })
      .email('البريد الإلكتروني غير صالح')
      .trim()
      .toLowerCase(),
    password: z
      .string({ required_error: 'كلمة المرور مطلوبة' })
      .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      .regex(/[A-Z]/, 'يجب أن تحتوي كلمة المرور على حرف كبير على الأقل')
      .regex(/[0-9]/, 'يجب أن تحتوي كلمة المرور على رقم على الأقل'),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^\+?[1-9]\d{1,14}$/.test(val),
        'رقم الهاتف غير صالح (E.164)'
      ),
  }),
});

// ── User Login ─────────────────────────────────────────
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'البريد الإلكتروني مطلوب' })
      .email('البريد الإلكتروني غير صالح'),
    password: z
      .string({ required_error: 'كلمة المرور مطلوبة' })
      .min(1, 'كلمة المرور مطلوبة'),
  }),
});

// ── Password Reset OTP Request ───────────────────────
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'البريد الإلكتروني مطلوب' })
      .email('البريد الإلكتروني غير صالح'),
  }),
});

// ── Reset Password with OTP ──────────────────────────
export const resetPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'البريد الإلكتروني مطلوب' })
      .email('البريد الإلكتروني غير صالح'),
    otp: z
      .string({ required_error: 'رمز OTP مطلوب' })
      .length(6, 'رمز OTP يجب أن يكون 6 أرقام')
      .regex(/^\d{6}$/, 'رمز OTP يجب أن يتكون من 6 أرقام'),
    newPassword: z
      .string({ required_error: 'كلمة المرور الجديدة مطلوبة' })
      .min(8, 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل'),
  }),
});

// ── Change Password (when logged in) ───────────────────
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z
      .string({ required_error: 'كلمة المرور الحالية مطلوبة' })
      .min(1, 'كلمة المرور الحالية مطلوبة'),
    newPassword: z
      .string({ required_error: 'كلمة المرور الجديدة مطلوبة' })
      .min(8, 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل'),
  }),
});

// ── Admin Login ────────────────────────────────────────
export const adminLoginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'البريد الإلكتروني مطلوب' })
      .email('البريد الإلكتروني غير صالح'),
    password: z
      .string({ required_error: 'كلمة المرور مطلوبة' })
      .min(1, 'كلمة المرور مطلوبة'),
  }),
});
