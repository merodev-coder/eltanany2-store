import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    q: 'كيف أقدر أطلب من الموقع؟',
    a: 'سهل جداً! اختار المنتج اللي عجبك، ضفه للسلة، املأ بياناتك، واختار طريقة الدفع. هنcontactك في أقرب وقت لتأكيد الطلب.',
  },
  {
    q: 'طريقة الدفع المتاحة إيه؟',
    a: 'الدفع عند الاستلام هو الطريقة المتاحة حالياً. بنستعد لإضافة طرق دفع إلكترونية قريباً.',
  },
  {
    q: 'التوصيل بيوصل في كام يوم؟',
    a: 'التوصيل داخل القاهرة والجيزة بياخد 1-2 يوم عمل. باقي المحافظات من 2-5 أيام عمل حسب المنطقة.',
  },
  {
    q: 'المنتجات أصلية ولا تقليد؟',
    a: 'كل منتجاتنا أصلية 100% ومكفولة من الوكيل المعتمد. لا نتعامل مع المقلدات أبداً.',
  },
  {
    q: 'ممكن أرجع المنتج لو مش عجبني؟',
    a: 'أيوه! عندك 14 يوم لإرجاع أو استبدال المنتج بشرط يكون في حالته الأصلية مع الكامل ملحقاته.',
  },
  {
    q: 'الضمان بيكون لمدة قد إيه؟',
    a: 'الضمان بيكون من الوكيل المعتمد ومدته بتختلف حسب الماركة والمنتج. بتبدأ من سنة لغاية سنتين.',
  },
  {
    q: 'لو عندي مشكلة في المنتج أعمل إيه؟',
    a: 'تواصل معنا على واتساب أو الإيميل وهنساعدك في حل المشكلة. لو المنتج في فترة الضمان هنوصلك بالوكيل المعتمد.',
  },
  {
    q: 'ممكن أغير عنوان التوصيل بعد ما تأكد الطلب؟',
    a: 'أيوه، بس لازم تتواصل معنا في أقرب وقت قبل ما يتم شحن الطلب.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="py-12 sm:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-heading font-black text-3xl text-ink mb-3">الأسئلة الشائعة</h1>
          <p className="font-body text-slate">إجابات على أكثر الأسئلة اللي بتتسأل</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="bg-white rounded-xl shadow-card overflow-hidden">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="flex items-center justify-between w-full p-5 text-right"
                >
                  <span className={`font-heading font-bold text-sm sm:text-base ${isOpen ? 'text-ignition-start' : 'text-ink'}`}>
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-slate flex-shrink-0 mr-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-5 pb-5">
                        <p className="font-body text-sm text-slate leading-relaxed">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
