import { Link, useLocation } from 'react-router-dom';
import { PlusCircle, Package, Truck, ShoppingBag, Settings, BarChart3, FileText } from 'lucide-react';

export type AdminTab = 'orders' | 'add-product' | 'inventory' | 'delivery' | 'analytics' | 'price-list' | 'settings';

const navItems: { id: AdminTab; label: string; icon: any; path: string }[] = [
  { id: 'orders', label: 'إدارة الطلبات', icon: ShoppingBag, path: '/AhmedEltanany/dashboard/orders' },
  { id: 'add-product', label: 'إضافة منتج', icon: PlusCircle, path: '/AhmedEltanany/dashboard/add-product' },
  { id: 'inventory', label: 'الجرد والإحصائيات', icon: Package, path: '/AhmedEltanany/dashboard/inventory' },
  { id: 'analytics', label: 'التحليلات والأرباح', icon: BarChart3, path: '/AhmedEltanany/dashboard/analytics' },
  { id: 'delivery', label: 'خيارات التوصيل', icon: Truck, path: '/AhmedEltanany/dashboard/delivery' },
  { id: 'price-list', label: 'إدارة قائمة الأسعار', icon: FileText, path: '/AhmedEltanany/dashboard/price-list' },
  { id: 'settings', label: 'إعدادات الدفع', icon: Settings, path: '/AhmedEltanany/dashboard/settings' },
];

export default function AdminSidebar() {
  const location = useLocation();
  
  const getActiveTab = (): AdminTab => {
    const activeItem = navItems.find(item => location.pathname === item.path);
    return activeItem?.id || 'orders';
  };

  const activeTab = getActiveTab();

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 bg-white border-s border-steel-light lg:min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-1">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'gradient-brand text-white shadow-glow'
                  : 'text-slate hover:bg-steel-light hover:text-[#18181B]'
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-ink/60'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
