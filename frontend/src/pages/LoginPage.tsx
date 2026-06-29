// frontend/src/pages/LoginPage.tsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

// ── Schema ─────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح').min(1, 'البريد الإلكتروني مطلوب'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  if (isAuthenticated) {
    const from = (location.state as any)?.from || '/profile';
    navigate(from, { replace: true });
    return null;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    setIsSubmitting(true);

    const result = await login(data.email, data.password);

    setIsSubmitting(false);

    if (result.success) {
      const from = (location.state as any)?.from || '/profile';
      navigate(from, { replace: true });
    } else {
      setError(result.message || 'حدث خطأ أثناء تسجيل الدخول');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-4">
            <img src="/images/logo.jpeg" alt="El-Tanany" className="w-full h-full object-cover" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-white">أهلاً بعودتك</h1>
          <p className="text-zinc-400 text-sm mt-1">Welcome back</p>
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
            {errors.email && (
              <p className="text-amber-400 text-xs mt-1">{errors.email.message}</p>
            )}
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
            {errors.password && (
              <p className="text-amber-400 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Forgot password link */}
          <div className="text-left">
            <Link to="/forgot-password" className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
              نسيت كلمة المرور؟
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-amber-400 text-zinc-950 font-bold flex items-center justify-center gap-2 hover:bg-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'تسجيل الدخول'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-zinc-500 text-sm">أو</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* Sign up link */}
        <p className="text-center text-zinc-400 text-sm">
          ليس لديك حساب؟{' '}
          <Link to="/signup" className="text-amber-400 hover:text-amber-300 transition-colors font-medium">
            إنشاء حساب
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
