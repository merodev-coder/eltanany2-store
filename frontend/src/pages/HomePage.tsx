import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Star, Shield, Tag, Truck, Headphones, RefreshCw, Gamepad, Briefcase, Mouse, } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/ui-custom/ProductCard';
import { getHeroSlides, getFeaturedLaptops, getCategoryCards, getWhyCards, getStats, getTestimonials } from '@/services/mockApi';
import type { Product, HeroSlide, WhyCard, StatItem, Testimonial } from '@/types';

const categoryIcons: Record<string, typeof Gamepad> = {
  gaming: Gamepad,
  business: Briefcase,
  mouse: Mouse,
  headset: Headphones,
};

const whyIcons: Record<string, typeof Shield> = {
  shield: Shield,
  tag: Tag,
  truck: Truck,
  headphones: Headphones,
  refresh: RefreshCw,
};

export default function HomePage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string; image: string }[]>([]);
  const [whyCards, setWhyCards] = useState<WhyCard[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeWhyCard, setActiveWhyCard] = useState<number | null>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const load = async () => {
      const [s, f, c, w, st, t] = await Promise.all([
        getHeroSlides(),
        getFeaturedLaptops(),
        getCategoryCards(),
        getWhyCards(),
        getStats(),
        getTestimonials(),
      ]);
      setSlides(s);
      setFeatured(f);
      setCategories(c);
      setWhyCards(w);
      setStats(st);
      setTestimonials(t);
    };
    load();
  }, []);

  const startAutoPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5500);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length > 0) startAutoPlay();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [slides, startAutoPlay]);

  useEffect(() => {
    const t = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(t);
  }, [testimonials]);

  const goToSlide = (idx: number) => {
    setCurrentSlide(idx);
    startAutoPlay();
  };

  const nextSlide = () => goToSlide((currentSlide + 1) % slides.length);
  const prevSlide = () => goToSlide((currentSlide - 1 + slides.length) % slides.length);

  return (
    <div>
      <section className="relative h-[500px] sm:h-[600px] lg:h-[700px] overflow-hidden">
        <AnimatePresence mode="wait">
          {slides[currentSlide] && (
            <motion.div
              key={slides[currentSlide].id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0">
                <img
                  src={slides[currentSlide].image}
                  alt={slides[currentSlide].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-carbon/80 via-carbon/30 to-transparent" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-4 max-w-3xl">
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="font-heading font-black text-3xl sm:text-4xl lg:text-6xl text-white mb-4"
                  >
                    {slides[currentSlide].title}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.35 }}
                    className="font-body text-lg sm:text-xl text-white/80 mb-8"
                  >
                    {slides[currentSlide].subtitle}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <Link
                      to={slides[currentSlide].link}
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-xl gradient-brand text-white font-heading font-bold text-lg hover:shadow-glow transition-shadow duration-300"
                    >
                      {slides[currentSlide].cta}
                      <ChevronLeft className="w-5 h-5" />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={nextSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200"
          aria-label="التالي"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={prevSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200"
          aria-label="السابق"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-8 bg-ignition-start' : 'w-2 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`انتقل للشريحة ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      <section className="bg-carbon py-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-white/60 font-body text-sm mb-6">الماركات الموثوقة</p>
          <div className="flex animate-marquee whitespace-nowrap">
            {[...Array(2)].map((_, setIdx) => (
              <div key={setIdx} className="flex items-center gap-16 ml-16">
                {['ASUS', 'Lenovo', 'HP', 'MSI', 'Dell', 'Apple', 'Logitech', 'Razer', 'SteelSeries', 'HyperX', 'JBL', 'Corsair'].map(brand => (
                  <span key={`${setIdx}-${brand}`} className="font-heading font-bold text-xl text-white/40 hover:text-ignition-end transition-colors duration-300 cursor-default">
                    {brand}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl text-ink mb-2">لابتوبات مميزة</h2>
              <p className="font-body text-slate">اخترنا لك أفضل الاختيارات</p>
            </div>
            <Link
              to="/laptops"
              className="flex items-center gap-1 text-ignition-start font-body font-medium hover:text-ignition-end transition-colors duration-200"
            >
              شوف الكل
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.slice(0, 8).map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-ink mb-2">تسوق حسب الفئة</h2>
            <p className="font-body text-slate">اختار اللي يناسبك بسرعة</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat, idx) => {
              const IconComp = categoryIcons[cat.icon] || Gamepad;
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: idx * 0.1 }}
                >
                  <Link
                    to={cat.id === 'gaming' || cat.id === 'business' ? '/laptops' : '/accessories'}
                    className="group relative block rounded-2xl overflow-hidden aspect-[4/3]"
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-carbon/80 via-carbon/20 to-transparent" />
                    <div className="absolute bottom-4 right-4 left-4 flex items-end justify-between">
                      <div>
                        <IconComp className="w-6 h-6 text-ignition-end mb-2" />
                        <h3 className="font-heading font-bold text-white text-lg">{cat.name}</h3>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-ignition-start transition-colors duration-200">
                        <ChevronLeft className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-ink mb-2">إحصائياتنا</h2>
            <p className="font-body text-slate">أرقام تتكلم عن جودة خدمتنا</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.1 }}
                className="text-center p-6 bg-white rounded-2xl shadow-card"
              >
                <p className="font-heading font-black text-3xl sm:text-4xl text-gradient mb-1">
                  {stat.value}{stat.suffix}
                </p>
                <p className="font-body text-sm text-slate">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-ink mb-2">لماذا تختار ELTANANY؟</h2>
            <p className="font-body text-slate">مميزات تجعلنا الخيار الأمثل</p>
          </div>
          <div className="hidden lg:flex gap-2 h-80">
            {whyCards.map((card, idx) => {
              const IconComp = whyIcons[card.icon] || Shield;
              const isActive = activeWhyCard === idx;
              return (
                <motion.div
                  key={card.id}
                  onMouseEnter={() => setActiveWhyCard(idx)}
                  onMouseLeave={() => setActiveWhyCard(null)}
                  animate={{ flex: isActive ? 3 : 1 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative rounded-2xl overflow-hidden cursor-pointer ${
                    isActive ? 'gradient-brand' : 'bg-steel-light'
                  }`}
                >
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <IconComp className={`w-8 h-8 mb-3 ${isActive ? 'text-white' : 'text-ignition-start'}`} />
                    <h3 className={`font-heading font-bold text-lg mb-2 ${isActive ? 'text-white' : 'text-ink'}`}>
                      {card.title}
                    </h3>
                    <AnimatePresence>
                      {isActive && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="font-body text-sm text-white/90"
                        >
                          {card.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {whyCards.map((card) => {
              const IconComp = whyIcons[card.icon] || Shield;
              return (
                <div key={card.id} className="p-5 rounded-2xl bg-steel-light">
                  <IconComp className="w-7 h-7 text-ignition-start mb-3" />
                  <h3 className="font-heading font-bold text-base text-ink mb-2">{card.title}</h3>
                  <p className="font-body text-sm text-slate">{card.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-ink mb-2">آراء عملائنا</h2>
            <p className="font-body text-slate">شوف اللي قالوه عن تجربتهم</p>
          </div>
          {testimonials.length > 0 && (
            <div className="max-w-2xl mx-auto text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-2xl shadow-card p-8"
                >
                  <div className="flex justify-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < testimonials[currentTestimonial].rating ? 'text-ignition-end' : 'text-steel-light'}`}
                        fill={i < testimonials[currentTestimonial].rating ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  <p className="font-body text-lg text-ink mb-4 leading-relaxed">
                    "{testimonials[currentTestimonial].text}"
                  </p>
                  <p className="font-heading font-bold text-ink">
                    {testimonials[currentTestimonial].name}
                  </p>
                </motion.div>
              </AnimatePresence>
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentTestimonial(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentTestimonial ? 'w-6 bg-ignition-start' : 'w-2 bg-steel-dark/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-carbon">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white mb-3">اشترك في نشرتنا الإخبارية</h2>
          <p className="font-body text-white/60 mb-6">وصلك أحدث العروض والمنتجات أول بأول</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="text"
              placeholder="رقم الواتساب أو الإيميل"
              className="flex-1 h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 font-body outline-none focus:border-ignition-start transition-colors"
            />
            <button className="h-12 px-6 rounded-xl gradient-brand text-white font-heading font-bold hover:shadow-glow transition-shadow duration-300">
              اشترك
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
