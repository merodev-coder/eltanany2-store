import { useParams, Link } from 'react-router-dom';
import { CheckCircle, MessageCircle, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();

  const whatsappLink = `https://wa.me/201000000000?text=${encodeURIComponent(`مرحباً، أنا أؤكد طلبي رقم: ${orderId}`)}`;

  return (
    <div className="py-20 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
          className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-14 h-14 text-success" />
        </motion.div>

        <h1 className="font-heading font-black text-3xl text-ink mb-3">تم تأكيد طلبك!</h1>
        <p className="font-body text-slate mb-2">رقم الطلب:</p>
        <p className="font-heading font-bold text-xl text-ignition-start mb-6">{orderId}</p>
        <p className="font-body text-ink/80 mb-8 max-w-md mx-auto">
          هنcontactك قريب لتأكيد الطلب وترتيب التوصيل. لو عندك أي استفسار، تواصل معنا على واتساب.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-500 text-white font-heading font-bold hover:bg-green-600 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            تأكيد عبر واتساب
          </a>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-ink font-heading font-bold shadow-sm hover:shadow-md transition-shadow"
          >
            <Home className="w-5 h-5" />
            العودة للرئيسية
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
