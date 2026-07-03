import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const slides = [
  {
    id: 1,
    tag: '✨ كسر زيرو بالكامل',
    title: 'بحالة الوكالة وبنصف السعر',
    highlighted: 'وبنصف السعر',
    subtitle: 'لابتوبات استيراد كسر زيرو خالية من الخدوش، تم فحصها بأعلى معايير الجودة لتوفر لك الأداء الأقوى وبأفضل قيمة.',
    cta: 'تصفح الأجهزة المتاحة 💻',
    image: '/images/hero-1.jpg',
    link: '/laptops'
  },
  {
    id: 2,
    tag: '🚀 أداء بلا حدود',
    title: 'عمالقة الأداء.. لأصحاب المهام الثقيلة',
    highlighted: 'المهام الثقيلة',
    subtitle: 'أجهزة Workstation ومواصفات خارقة مخصصة للمبرمجين، مصممي الجرافيك، وصنّاع المحتوى. جاهزة للعمل الشاق فوراً.',
    cta: 'تسوق أجهزة العمل الشاق ⚙️',
    image: '/images/hero-2.jpg',
    link: '/laptops'
  },
  {
    id: 3,
    tag: '🎮 قوة خارقة',
    title: 'ارتقِ بمستوى لعبك.. لابتوبات الجيمنج',
    highlighted: 'لابتوبات الجيمنج',
    subtitle: 'أقوى كروت الشاشة ومعالجات الجيل الحديث بأسعار لا تقبل المنافسة. استمتع بأعلى فريمات بأقل تكلفة ممكنة.',
    cta: 'اكتشف وحوش الجيمنج 🕹️',
    image: '/images/hero-3.jpg',
    link: '/laptops'
  }
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);

  const goToSlide = (index: number) => setCurrentSlide(index);

  const highlightTitle = (title: string, highlight: string) => {
    const parts = title.split(highlight);
    return (
      <>
        {parts[0]}
        <span className="text-amber-400">{highlight}</span>
        {parts[1]}
      </>
    );
  };

  return (
    <section className="relative h-[500px] sm:h-[600px] lg:h-[700px] overflow-hidden bg-zinc-950">
      {/* Background Image Container */}
      <div className="absolute inset-0">
        <img
          src={slides[currentSlide].image}
          alt={slides[currentSlide].title}
          className="w-full h-full object-cover transition-all duration-700 ease-in-out"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-zinc-950/90 via-zinc-950/60 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="w-full lg:w-1/2 text-right mr-auto">
          <div className="inline-block px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-sm font-medium mb-4">
            {slides[currentSlide].tag}
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-white mb-4 leading-tight">
            {highlightTitle(slides[currentSlide].title, slides[currentSlide].highlighted)}
          </h1>
          <p className="font-body text-base sm:text-lg text-white/70 mb-8 leading-relaxed max-w-xl">
            {slides[currentSlide].subtitle}
          </p>
          <a
            href={slides[currentSlide].link}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-amber-400 text-zinc-950 font-heading font-bold text-lg hover:bg-amber-300 transition-all duration-300 shadow-lg shadow-amber-400/20"
          >
            {slides[currentSlide].cta}
            <ChevronLeft className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 z-20"
        aria-label="السابق"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 z-20"
        aria-label="التالي"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`h-2 transition-all duration-300 rounded-full ${
              idx === currentSlide ? 'w-8 bg-amber-400' : 'w-2 bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`انتقل للشريحة ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}