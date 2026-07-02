// frontend/src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';
import GuestRoute from '@/components/auth/GuestRoute';

import { lazy, Suspense, type ComponentType } from 'react';

/* ------------------------------------------------------------------ */
/*  Lazy-loaded pages with safe wrappers                               */
/* ------------------------------------------------------------------ */

/** Wrap a lazy component so a failed import shows a graceful error instead of white-screen crash */
function safeLazy<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) {
  return lazy(() =>
    factory().catch((err) => {
      console.error('[App] Failed to load chunk:', err);
      return {
        default: (() => (
          <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
            <div className="text-center">
              <h1 className="text-xl font-bold text-ink mb-2">حدث خطأ</h1>
              <p className="text-slate mb-4">فشل تحميل الصفحة. يرجى تحديث المتصفح.</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 rounded-xl gradient-brand text-white font-bold hover:shadow-glow transition-shadow"
              >
                تحديث
              </button>
            </div>
          </div>
        )) as unknown as T,
      };
    })
  );
}

const HomePage = safeLazy(() => import('@/pages/HomePage'));
const LaptopsPage = safeLazy(() => import('@/pages/LaptopsPage'));
const AccessoriesPage = safeLazy(() => import('@/pages/AccessoriesPage'));
const ProductDetailsPage = safeLazy(() => import('@/pages/ProductDetailsPage'));
const CartPage = safeLazy(() => import('@/pages/CartPage'));
const CheckoutPage = safeLazy(() => import('@/pages/CheckoutPage'));
const OrderConfirmationPage = safeLazy(() => import('@/pages/OrderConfirmationPage'));
const SearchPage = safeLazy(() => import('@/pages/SearchPage'));
const AboutPage = safeLazy(() => import('@/pages/AboutPage'));
const ContactPage = safeLazy(() => import('@/pages/ContactPage'));
const FAQPage = safeLazy(() => import('@/pages/FAQPage'));
const PriceListPage = safeLazy(() => import('@/pages/PriceListPage'));
const NotFoundPage = safeLazy(() => import('@/pages/NotFoundPage'));

// Auth pages
const LoginPage = safeLazy(() => import('@/pages/LoginPage'));
const SignupPage = safeLazy(() => import('@/pages/SignupPage'));
const ProfilePage = safeLazy(() => import('@/pages/ProfilePage'));
const OrdersPage = safeLazy(() => import('@/pages/OrdersPage'));

// Admin pages
const AdminLoginPage = safeLazy(() => import('@/pages/admin/AdminLoginPage'));
const AdminDashboardPage = safeLazy(() => import('@/pages/admin/AdminDashboardPage'));
const OrdersManagementView = safeLazy(() => import('@/pages/admin/OrdersManagementView'));
const AddProductView = safeLazy(() => import('@/pages/admin/AddProductView'));
const InventoryView = safeLazy(() => import('@/pages/admin/InventoryView'));
const AnalyticsDashboard = safeLazy(() => import('@/pages/admin/AnalyticsDashboard'));
const DeliveryOptionsView = safeLazy(() => import('@/pages/admin/DeliveryOptionsView'));
const PriceListManagement = safeLazy(() => import('@/pages/admin/PriceListManagement'));
const SettingsView = safeLazy(() => import('@/pages/admin/SettingsView'));

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <Suspense
            fallback={
              <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-steel-light border-t-ignition-start rounded-full animate-spin" />
              </div>
            }
          >
            <Routes>
              {/* Public routes */}
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/laptops" element={<LaptopsPage />} />
                <Route path="/accessories" element={<AccessoriesPage />} />
                <Route path="/product/:id" element={<ProductDetailsPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/price-list" element={<PriceListPage />} />

                {/* Guest-only routes (redirect to profile if logged in) */}
                <Route
                  path="/login"
                  element={
                    <GuestRoute>
                      <LoginPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <GuestRoute>
                      <SignupPage />
                    </GuestRoute>
                  }
                />

                {/* Protected routes (require authentication) */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Admin routes (outside Layout — no Navbar/Footer) */}
              <Route path="/AhmedEltanany" element={<AdminLoginPage />} />
              <Route
                path="/AhmedEltanany/dashboard"
                element={
                  <AdminProtectedRoute>
                    <AdminDashboardPage />
                  </AdminProtectedRoute>
                }
              >
                <Route path="orders" element={<OrdersManagementView />} />
                <Route path="add-product" element={<AddProductView />} />
                <Route path="inventory" element={<InventoryView />} />
                <Route path="analytics" element={<AnalyticsDashboard />} />
                <Route path="delivery" element={<DeliveryOptionsView />} />
                <Route path="price-list" element={<PriceListManagement />} />
                <Route path="settings" element={<SettingsView />} />
                <Route index element={<OrdersManagementView />} />
              </Route>
            </Routes>
          </Suspense>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
