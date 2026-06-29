import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import ScrollToTop from './ScrollToTop';

export default function Layout() {
  const location = useLocation();
  const isCheckout = location.pathname === '/checkout';
  const isAdmin = location.pathname.startsWith('/AhmedEltanany');

  return (
    <div className="w-full min-h-screen flex flex-col bg-cloud" dir="rtl" lang="ar">
      {!isAdmin && <Navbar />}
      <main className="flex-1">
        <Outlet />
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <WhatsAppButton hideOnCheckout={isCheckout} />}
      {!isAdmin && <ScrollToTop />}
    </div>
  );
}
