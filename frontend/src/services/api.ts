// services/api.ts
// API service wrappers for storefront, admin, and homepage data.
import axiosClient from '@/api/apiClient';

// ── Public Product API ────────────────────────────────────
export const getAllLaptops = async () => {
  const res = await axiosClient.get('/public/products?category=laptop&limit=50');
  return res.data.data?.products || [];
};

export const getAllAccessories = async () => {
  const res = await axiosClient.get('/public/products?category=accessory&limit=50');
  return res.data.data?.products || [];
};

export const getFeaturedLaptops = async () => {
  const res = await axiosClient.get('/public/products?category=laptop&limit=20&isFeatured=true');
  return res.data.data?.products || [];
};

export const filterLaptops = async (options?: any) => {
  const params = new URLSearchParams();
  params.append('category', 'laptop');
  params.append('limit', '50');
  if (options) {
    if (options.brands && options.brands.length > 0) {
      params.append('brand', options.brands.join(','));
    }
    if (options.priceRange) {
      params.append('minPrice', options.priceRange[0].toString());
      params.append('maxPrice', options.priceRange[1].toString());
    }
    if (options.search) {
      params.append('search', options.search);
    }
  }
  const res = await axiosClient.get(`/public/products?${params.toString()}`);
  return res.data.data?.products || [];
};

export const filterAccessories = async (options?: any) => {
  const params = new URLSearchParams();
  params.append('category', 'accessory');
  params.append('limit', '50');
  if (options) {
    if (typeof options === 'string') {
      params.append('subcategory', options);
    } else {
      if (options.subcategory) {
        params.append('subcategory', options.subcategory);
      }
      if (options.search) {
        params.append('search', options.search);
      }
    }
  }
  const res = await axiosClient.get(`/public/products?${params.toString()}`);
  return res.data.data?.products || [];
};

export const getFilterOptions = async () => ({
  brands: ['Dell', 'HP', 'Lenovo', 'Apple', 'ASUS'] as string[],
  priceRanges: [] as string[],
  ramOptions: ['8GB', '16GB', '32GB'] as string[],
  storageOptions: ['256GB SSD', '512GB SSD', '1TB SSD'] as string[],
});

export const getProductById = async (id: string) => {
  const res = await axiosClient.get(`/public/products/${id}`);
  return res.data.data?.product;
};

export const getRelatedProducts = async (_id: string) => {
  const res = await axiosClient.get('/public/products?limit=8');
  return res.data.data?.products?.slice(0, 4) || [];
};

export const searchProducts = async (query: string) => {
  if (!query) return [];
  const res = await axiosClient.get(`/public/products?limit=50&search=${encodeURIComponent(query)}`);
  return res.data.data?.products || [];
};

// ── Homepage static data ────────────────────────────────
export const getHeroSlides = async () => [
  {
    id: 'slide-1',
    title: 'أفضل اللابتوبات بأقل الأسعار',
    subtitle: 'تشكيلة متنوعة من أحدث الموديلات بضمان أفضل سعر في مصر',
    cta: 'تسوق الآن',
    link: '/laptops',
    image: '/images/hero-1.jpg',
  },
  {
    id: 'slide-2',
    title: 'إكسسوارات احترافية',
    subtitle: 'ماوس وكيبورد وسماعات من أكبر الماركات العالمية',
    cta: 'اكتشف المزيد',
    link: '/accessories',
    image: '/images/hero-2.jpg',
  },
  {
    id: 'slide-3',
    title: 'شحن سريع لجميع المحافظات',
    subtitle: 'توصيل أمن وسريع مع ضمان توصيل ناجح 100%',
    cta: 'اطلب الآن',
    link: '/laptops',
    image: '/images/hero-3.jpg',
  },
  {
    id: 'slide-4',
    title: 'عروض خاصة الموسم',
    subtitle: 'خصومات حصرية على أفضل المنتجات لفترة محدودة',
    cta: 'شوف العروض',
    link: '/laptops',
    image: '/images/hero-4.jpg',
  },
];

export const getCategoryCards = async () => [
  { id: 'gaming', name: 'ألعاب', icon: 'gaming', image: '/images/cat-gaming.jpg' },
  { id: 'business', name: 'أعمال', icon: 'business', image: '/images/cat-business.jpg' },
  { id: 'mouse', name: 'ماوس واكسسوارات', icon: 'mouse', image: '/images/cat-accessories.jpg' },
  { id: 'headset', name: 'سماعات وصوت', icon: 'headset', image: '/images/cat-audio.jpg' },
];

export const getWhyCards = async () => [
  {
    id: 'why-1',
    title: 'ضمان شامل',
    description: 'جميع منتجاتنا تأتي بضمان رسمي يصل إلى سنتين مع خدمة ما بعد البيع.',
    icon: 'shield',
  },
  {
    id: 'why-2',
    title: 'أفضل الأسعار',
    description: 'نضمن لك أفضل سعر في السوق مع توفير مستمر مقارنة بالمنافسين.',
    icon: 'tag',
  },
  {
    id: 'why-3',
    title: 'شحن سريع',
    description: 'توصيل خلال 2-5 أيام عمل لجميع المحافظات مع تتبع الطلب.',
    icon: 'truck',
  },
  {
    id: 'why-4',
    title: 'دعم فني متخصص',
    description: 'فريق دعم فني متخصص جاهز لمساعدتك في أي استفسار أو مشكلة.',
    icon: 'headphones',
  },
  {
    id: 'why-5',
    title: 'إرجاع سهل',
    description: 'سياسة إرجاع مرنة خلال 14 يوم في حالة وجود أي عيب مصنعي.',
    icon: 'refresh',
  },
];

export const getStats = async () => [
  { id: 'stat-1', value: '1200', suffix: '+', label: 'عميل سعيد' },
  { id: 'stat-2', value: '50', suffix: '+', label: 'منتج متاح' },
  { id: 'stat-3', value: '99', suffix: '%', label: 'رضا العملاء' },
  { id: 'stat-4', value: '24', suffix: 'س', label: 'دعم فني' },
];

export const getTestimonials = async () => [
  {
    id: 't-1',
    name: 'أحمد محمد',
    text: 'تجربة رائعة في التسوق، الجهاز وصل بنفس اليوم وكان بالضبط كما في الوصف. شكراً لفريق El-Tanany على الاحترافية!',
    rating: 5,
  },
  {
    id: 't-2',
    name: 'سارة إبراهيم',
    text: 'الأسعار فعلاً مش ممكن مقارنة مع أي مكان تاني. الجودة ممتازة والشحن كان سريع جداً.',
    rating: 5,
  },
  {
    id: 't-3',
    name: 'محمد علي',
    text: 'اشتريت لابتوب للجامعة وكان أفضل قرار. الجهاز سريع وجودته ممتازة. شكراً خاص للدعم الفني!',
    rating: 4,
  },
];

// ── Admin product ──────────────────────────────────────
export const addProduct = async (data: any) => {
  const res = await axiosClient.post('/admin/products', data);
  return res.data;
};

// ── Admin analytics ─────────────────────────────────────
export const getMonthlyAnalytics = async () => {
  const res = await axiosClient.get('/admin/analytics/monthly');
  return res.data.data;
};

export const getOverviewStats = async () => {
  const res = await axiosClient.get('/admin/analytics/overview');
  return res.data.data;
};

// ── Newsletter subscription ───────────────────────────
export const subscribeToNewsletter = async (contact: string) => {
  const res = await axiosClient.post('/public/newsletter/subscribe', { contact });
  return res.data;
};

// ── Governorates ────────────────────────────────────────
export const getGovernorates = async () => {
  const res = await axiosClient.get('/public/governorates');
  return res.data.data?.governorates || [];
};

// ── Admin settings ────────────────────────────────────
export const getPublicSettings = async () => {
  const res = await axiosClient.get('/public/settings');
  return res.data.data || { vodafoneCashNumber: '', instaPayAccount: '' };
};

export const updateAdminSettings = async (data: { vodafoneCashNumber?: string; instaPayAccount?: string }) => {
  const res = await axiosClient.post('/admin/settings/payment', data);
  return res.data;
};

// ── Orders ───────────────────────────────────────────
export const createOrder = async (data: any) => {
  const res = await axiosClient.post('/users/orders', data);
  return res.data;
};

export const getMyOrders = async () => {
  const res = await axiosClient.get('/users/orders/my');
  return res.data.data?.orders || [];
};

// ── Receipt upload (deposit) ─────────────────────────
// Receipts are now uploaded via UploadThing directly in the frontend
// The URL is then passed to the order creation endpoint
export const attachReceiptToOrder = async (receiptUrl: string, orderId: string) => {
  const res = await axiosClient.post('/users/receipt/upload', {
    receiptUrl,
    orderId,
  });
  return res.data;
};

export const getDepositReceipt = async (orderId: string) => {
  const res = await axiosClient.get(`/users/receipt/${orderId}`);
  return res.data;
};

// ── Orders (admin) ─────────────────────────────────────
export const getOrders = async () => {
  const res = await axiosClient.get('/admin/orders');
  return res.data.data?.orders || [];
};

// ── Monthly inventory ───────────────────────────────────
export const getMonthlyInventoryList = async () => {
  const res = await axiosClient.get('/admin/analytics/monthly-inventory');
  return res.data.data?.snapshots || [];
};
