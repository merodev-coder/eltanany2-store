import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="font-heading font-black text-8xl text-gradient mb-4">404</p>
        <h1 className="font-heading font-bold text-2xl text-ink mb-3">الصفحة مش موجودة</h1>
        <p className="font-body text-slate mb-8">الصفحة اللي بتدور عليها مش موجودة أو اتنقلت لمكان تاني</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white font-heading font-bold hover:shadow-glow transition-shadow"
        >
          <Home className="w-5 h-5" />
          العودة للرئيسية
        </Link>
      </motion.div>
    </div>
  );
}
