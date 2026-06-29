import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactPage() {
  return (
    <div className="py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-heading font-black text-3xl text-ink mb-3">تواصل معنا</h1>
          <p className="font-body text-slate">فريقنا جاهز يساعدك في أي وقت</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {[
              { icon: MapPin, title: 'العنوان', text: 'القاهرة، مصر' },
              { icon: Phone, title: 'الموبايل', text: '+20 100 000 0000', dir: 'ltr' as const },
              { icon: Mail, title: 'الإيميل', text: 'info@eltanany2.com' },
              { icon: Clock, title: 'ساعات العمل', text: 'السبت - الخميس: 10 ص - 10 م' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl shadow-card p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-ignition-start/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-ignition-start" />
                </div>
                <div>
                  <p className="font-heading font-bold text-sm text-ink mb-0.5">{item.title}</p>
                  <p className={`font-body text-sm text-slate ${item.dir || ''}`}>{item.text}</p>
                </div>
              </div>
            ))}

            <a
              href="https://wa.me/201000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-14 rounded-xl bg-green-500 text-white font-heading font-bold hover:bg-green-600 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              تواصل عبر واتساب
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-card p-6 sm:p-8"
          >
            <h2 className="font-heading font-bold text-lg text-ink mb-5">أرسل رسالة</h2>
            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
              <div>
                <label className="block font-body text-sm text-ink mb-1.5">الاسم</label>
                <input type="text" className="w-full h-12 px-4 rounded-xl bg-steel-light border-0 font-body text-ink outline-none focus:ring-2 focus:ring-ignition-start/30" placeholder="اسمك" />
              </div>
              <div>
                <label className="block font-body text-sm text-ink mb-1.5">الإيميل أو الموبايل</label>
                <input type="text" className="w-full h-12 px-4 rounded-xl bg-steel-light border-0 font-body text-ink outline-none focus:ring-2 focus:ring-ignition-start/30" placeholder="example@email.com" />
              </div>
              <div>
                <label className="block font-body text-sm text-ink mb-1.5">الرسالة</label>
                <textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-steel-light border-0 font-body text-ink outline-none focus:ring-2 focus:ring-ignition-start/30 resize-none" placeholder="اكتب رسالتك هنا..." />
              </div>
              <button className="w-full h-12 rounded-xl gradient-brand text-white font-heading font-bold hover:shadow-glow transition-shadow">
                إرسال
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
