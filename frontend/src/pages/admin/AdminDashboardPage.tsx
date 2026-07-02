import { Link, Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/pages/admin/AdminSidebar';

export default function AdminDashboardPage() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/AhmedEltanany';
  };

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
                onClick={handleLogout}
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
        <AdminSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 bg-[#FAFAFA] min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
