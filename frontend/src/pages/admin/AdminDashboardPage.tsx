import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar, { type AdminTab } from '@/pages/admin/AdminSidebar';
import SalesOverviewView from '@/pages/admin/SalesOverviewView';
import AddProductView from '@/pages/admin/AddProductView';
import InventoryView from '@/pages/admin/InventoryView';
import DeliveryOptionsView from '@/pages/admin/DeliveryOptionsView';
import PriceListManagement from '@/pages/admin/PriceListManagement';
import OrdersManagementView from '@/pages/admin/OrdersManagementView';

export default function AdminDashboardPage() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  return (
    <div className="min-h-screen bg-[#FAFAFA]" dir="rtl">
      <header className="bg-carbon text-white sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/images/logo.jpeg" alt="" className="h-8 w-8 rounded object-cover" />
              <span className="font-heading font-bold">لوحة التحكم</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/" className="font-body text-sm text-white/60 hover:text-white transition-colors">
                المتجر
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-sm font-body text-white/60 hover:text-error transition-colors"
              >
                <LogOut className="w-4 h-4" />
                خروج
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {activeTab === 'overview' && <SalesOverviewView />}
          {activeTab === 'add-product' && <AddProductView />}
          {activeTab === 'orders' && <OrdersManagementView />}
          {activeTab === 'inventory' && <InventoryView />}
          {activeTab === 'delivery' && <DeliveryOptionsView />}
          {activeTab === 'price-list' && (
            <div className="bg-white shadow-sm rounded-card p-6">
              <PriceListManagement />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
