// frontend/src/pages/SignupPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

// ── Password Strength Calculator ───────────────────────
function calculatePasswordStrength(password: string): number {
let score = 0;
if (password.length >= 8) score++;
if (/[A-Z]/.test(password)) score++;
if (/[a-z]/.test(password)) score++;
if (/[0-9]/.test(password)) score++;
if (/[^A-Za-z0-9]/.test(password)) score++;
return score; // 0-5
}

function getStrengthColor(score: number): string {
if (score <= 1) return 'bg-red-500';
if (score <= 2) return 'bg-orange-500';
if (score <= 3) return 'bg-yellow-500';
if (score <= 4) return 'bg-lime-500';
return 'bg-green-500';
}

function getStrengthLabel(score: number): string {
if (score <= 1) return 'ضعيفة';
if (score <= 2) return 'متوسطة';
if (score <= 3) return 'جيدة';
if (score <= 4) return 'قوية';
return 'قوية جداً';
}

// ── Schema ─────────────────────────────────────────────
const signupSchema = z
.object({
  name: z.string().min(2, 'الاسم يجب أن يكون 2 أحرف على الأقل').max(50, 'الاسم طويل جداً'),
  email: z.string().email('البريد الإلكتروني غير صحيح').min(1, 'الإيميل مطلوب'),
  password: z
.string()
.min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
.regex(/[A-Z]/, 'يجب أن تحتوي على حرف كبير')
.regex(/[0-9]/, 'يجب أن تحتوي على رقم'),
  confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
})
.refine((data) => data.password === data.confirmPassword, {
  message: 'كلمتا المرور غير متطابقتين',
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
const { register: registerUser, isAuthenticated } = useAuth();
const navigate = useNavigate();
const [showPassword, setShowPassword] = useState(false);
const [showConfirm, setShowConfirm] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState('');

const {
register,
handleSubmit,
watch,
formState: { errors },
} = useForm<SignupFormData>({
resolver: zodResolver(signupSchema),
});

const password = watch('password', '');
const strength = calculatePasswordStrength(password);

const onSubmit = async (data: SignupFormData) => {
setError('');
setIsSubmitting(true);

const result = await registerUser(data.name, data.email, data.password);

setIsSubmitting(false);

if (result.success) {
navigate('/profile', { replace: true });
} else {
setError(result.message || 'حدث خطأ أثناء إنشاء الحساب');
}
};

return (
<div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-8">
<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
className="w-full max-w-md"
>
{/* Logo */}
<div className="text-center mb-8">
<div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-4">
<img src="/images/logo.jpeg" alt="El-Tanany" className="w-full h-full object-cover" />
</div>
<h1 className="font-heading font-bold text-2xl text-white">إنشاء حساب جديد</h1>
<p className="text-zinc-400 text-sm mt-1">Create your account</p>
</div>

{/* Form */}
<form
onSubmit={handleSubmit(onSubmit)}
className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-6 space-y-4"
>
{/* Error Banner */}
{error && (
<div className="p-3 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-400 font-body text-sm text-center">
{error}
</div>
)}

{/* Name */}
<div>
<label className="block text-sm text-zinc-400 mb-1.5">الاسم الكامل</label>
<input
type="text"
{...register('name')}
className="w-full h-12 px-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 outline-none focus:border-amber-400 transition-colors"
placeholder="محمد أحمد"
/>
{errors.name && <p className="text-amber-400 text-xs mt-1">{errors.name.message}</p>}
</div>

{/* Email */}
<div>
<label className="block text-sm text-zinc-400 mb-1.5">البريد الإلكتروني</label>
<input
type="email"
{...register('email')}
className="w-full h-12 px-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 outline-none focus:border-amber-400 transition-colors"
placeholder="you@example.com"
dir="ltr"
/>
{errors.email && <p className="text-amber-400 text-xs mt-1">{errors.email.message}</p>}
</div>

{/* Password */}
<div>
<label className="block text-sm text-zinc-400 mb-1.5">كلمة المرور</label>
<div className="relative">
<input
type={showPassword ? 'text' : 'password'}
{...register('password')}
className="w-full h-12 px-4 pl-12 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 outline-none focus:border-amber-400 transition-colors"
placeholder="••••••••"
dir="ltr"
/>
<button
type="button"
onClick={() => setShowPassword(!showPassword)}
className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
>
{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
</button>
</div>
{errors.password && <p className="text-amber-400 text-xs mt-1">{errors.password.message}</p>}

{/* Password Strength */}
{password.length > 0 && (
<div className="mt-2">
<div className="flex gap-1 h-1.5">
{[1, 2, 3, 4, 5].map((level) => (
<div
key={level}
className={`flex-1 rounded-full transition-colors ${
level <= strength ? getStrengthColor(strength) : 'bg-zinc-700'
}`}
/>
))}
</div>
<p className={`text-xs mt-1 ${getStrengthColor(strength).replace('bg-', 'text-')}`}>
{getStrengthLabel(strength)}
</p>
</div>
)}
</div>

{/* Confirm Password */}
<div>
<label className="block text-sm text-zinc-400 mb-1.5">تأكيد كلمة المرور</label>
<div className="relative">
<input
type={showConfirm ? 'text' : 'password'}
{...register('confirmPassword')}
className="w-full h-12 px-4 pl-12 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 outline-none focus:border-amber-400 transition-colors"
placeholder="••••••••"
dir="ltr"
/>
<button
type="button"
onClick={() => setShowConfirm(!showConfirm)}
className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
>
{showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
</button>
</div>
{errors.confirmPassword && (
<p className="text-amber-400 text-xs mt-1">{errors.confirmPassword.message}</p>
)}
</div>

{/* Submit */}
<button
type="submit"
disabled={isSubmitting}
className="w-full h-12 rounded-xl bg-amber-400 text-zinc-950 font-bold flex items-center justify-center gap-2 hover:bg-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
>
{isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'إنشاء الحساب'}
</button>
</form>

{/* Divider */}
<div className="flex items-center gap-3 my-6">
<div className="flex-1 h-px bg-zinc-800" />
<span className="text-zinc-500 text-sm">أو</span>
<div className="flex-1 h-px bg-zinc-800" />
</div>

{/* Login link */}
<p className="text-center text-zinc-400 text-sm">
لديك حساب بالفعل؟{' '}
<Link to="/login" className="text-amber-400 hover:text-amber-300 transition-colors font-medium">
تسجيل الدخول
</Link>
</p>
</motion.div>
</div>
);
}
