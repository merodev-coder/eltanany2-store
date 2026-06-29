import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Facebook, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-carbon text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/images/logo.jpeg" alt="ELTANANY 2" className="h-12 w-12 rounded object-contain" />
              <span className="font-heading font-bold text-xl">ELTANANY 2</span>
            </div>
            <p className="text-white/60 font-body text-sm leading-relaxed">
              وجهتك الأولى للابتوبات والإكسسوارات في مصر. منتجات أصلية مضمونة بأفضل الأسعار.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/10 hover:bg-ignition-start transition-colors duration-200">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/10 hover:bg-ignition-start transition-colors duration-200">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://wa.me/201000000000" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/10 hover:bg-green-500 transition-colors duration-200">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-bold text-lg mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
              {[
                { label: 'الرئيسية', href: '/' },
                { label: 'لابتوبات', href: '/laptops' },
                { label: 'إكسسوارات', href: '/accessories' },
                { label: 'عن المتجر', href: '/about' },
                { label: 'الأسئلة الشائعة', href: '/faq' },
                { label: 'قائمة الأسعار', href: '/price-list' },
              ].map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-white/60 hover:text-ignition-end transition-colors duration-200 font-body text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-lg mb-4">خدمة العملاء</h4>
            <ul className="space-y-2">
              {[
                { label: 'تواصل معنا', href: '/contact' },
                { label: 'سياسة الإرجاع', href: '/faq' },
                { label: 'الشحن والتوصيل', href: '/faq' },
                { label: 'الضمان', href: '/faq' },
                { label: 'حماية المشتري', href: '/faq' },
              ].map(link => (
                <li key={link.label}>
                  <Link to={link.href} className="text-white/60 hover:text-ignition-end transition-colors duration-200 font-body text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-lg mb-4">تواصل معنا</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-ignition-start flex-shrink-0 mt-0.5" />
                <span className="text-white/60 font-body text-sm">القاهرة، مصر</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-ignition-start flex-shrink-0" />
                <span className="text-white/60 font-body text-sm" dir="ltr">+20 100 000 0000</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-ignition-start flex-shrink-0" />
                <span className="text-white/60 font-body text-sm">info@eltanany2.com</span>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="font-body text-sm text-white/80 mb-2">اشترك للحصول على العروض الحصرية</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="رقم الواتساب"
                  className="flex-1 h-10 px-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 font-body text-sm outline-none focus:border-ignition-start transition-colors"
                />
                <button className="h-10 px-4 rounded-lg gradient-brand text-white font-body text-sm font-medium hover:shadow-glow transition-shadow duration-200">
                  اشترك
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 font-body text-sm">
            © 2026 ELTANANY 2. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-white/40 font-body text-xs">الدفع عند الاستلام متاح</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-5 bg-white/20 rounded" />
              <div className="w-8 h-5 bg-white/20 rounded" />
              <div className="w-8 h-5 bg-white/20 rounded" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
