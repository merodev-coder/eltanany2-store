import { Link } from 'react-router-dom';
import { Target, Eye, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <div className="py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-6">
              <img src="/images/logo.jpeg" alt="ELTANANY 2" className="w-full h-full object-cover" />
            </div>
            <h1 className="font-heading font-black text-3xl sm:text-4xl text-ink mb-4">ELTANANY 2</h1>
            <p className="font-body text-slate max-w-2xl mx-auto leading-relaxed">
              وجهتك الأولى والأفضل للابتوبات والإكسسوارات في مصر. من 2021 ونحن نقدم منتجات أصلية مضمونة بأفضل الأسعار مع خدمة عملاء ممتازة.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: Target, title: 'رسالتنا', text: 'نوفر أحدث التقنيات بأسعار تنافسية لكل المصريين، مع ضمان أصلية المنتجات وخدمة ما بعد البيع.' },
            { icon: Eye, title: 'رؤيتنا', text: 'نكون الوجهة الأولى للتقنية في مصر، المعروفة بالموثوقية والشفافية والخدمة الممتازة.' },
            { icon: Heart, title: 'قيمنا', text: 'الأمانة في التعامل، جودة المنتجات، رضا العملاء، والالتزام بالوعد في كل عملية بيع.' },
          ].map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.1 }}
              className="bg-white rounded-2xl shadow-card p-8 text-center"
            >
              <div className="w-14 h-14 rounded-xl gradient-brand flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-heading font-bold text-xl text-ink mb-3">{item.title}</h3>
              <p className="font-body text-slate leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8 sm:p-12 text-center">
          <h2 className="font-heading font-bold text-2xl text-ink mb-4">ابدأ التسوق الآن</h2>
          <p className="font-body text-slate mb-6">اكتشف تشكيلتنا الكبيرة من اللابتوبات والإكسسوارات</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/laptops" className="px-8 py-3 rounded-xl gradient-brand text-white font-heading font-bold hover:shadow-glow transition-shadow">
              اللابتوبات
            </Link>
            <Link to="/accessories" className="px-8 py-3 rounded-xl bg-steel-light text-ink font-heading font-bold hover:shadow-md transition-shadow">
              الإكسسوارات
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
