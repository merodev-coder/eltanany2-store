import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in as admin
  useEffect(() => {
    if (isAdmin) {
      navigate('/AhmedEltanany/dashboard', { replace: true });
    }
  }, [isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await adminLogin(email, password);
    if (result.success) {
      navigate('/AhmedEltanany/dashboard');
    } else {
      setError(result.message || 'اسم المستخدم أو كلمة المرور غير صحيحة');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-carbon px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-4">
            <img src="/images/logo.jpeg" alt="ELTANANY 2" className="w-full h-full object-cover" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-white">لوحة التحكم</h1>
          <p className="font-body text-white/60 text-sm mt-1">تسجيل دخول المسؤول</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-error font-body text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block font-body text-sm text-white/70 mb-1.5">البريد الإلكتروني</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-12 pr-10 pl-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 font-body outline-none focus:border-ignition-start transition-colors"
                placeholder="admin@example.com"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block font-body text-sm text-white/70 mb-1.5">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-12 pr-10 pl-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 font-body outline-none focus:border-ignition-start transition-colors"
                placeholder="كلمة المرور"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full h-12 rounded-xl gradient-brand text-white font-heading font-bold flex items-center justify-center gap-2 hover:shadow-glow transition-shadow duration-300 disabled:opacity-50 disabled:hover:shadow-none mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                دخول
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
