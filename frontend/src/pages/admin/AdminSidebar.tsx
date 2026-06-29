import { LayoutDashboard, PlusCircle, Package, Truck, FileText, ShoppingBag } from 'lucide-react';

export type AdminTab = 'overview' | 'orders' | 'add-product' | 'inventory' | 'delivery' | 'price-list';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

const navItems: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'لوحة التحكم', icon: LayoutDashboard },
  { id: 'orders', label: 'إدارة الطلبات', icon: ShoppingBag },
  { id: 'add-product', label: 'إضافة منتج', icon: PlusCircle },
  { id: 'inventory', label: 'الجرد والإحصائيات', icon: Package },
  { id: 'delivery', label: 'خيارات التوصيل', icon: Truck },
  { id: 'price-list', label: 'قائمة الأسعار', icon: FileText },
];

export default function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  return (
    <aside className="w-full lg:w-64 flex-shrink-0 bg-white border-l border-steel-light lg:min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-1">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'gradient-brand text-white shadow-glow'
                  : 'text-slate hover:bg-steel-light hover:text-[#18181B]'
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-ink/60'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
