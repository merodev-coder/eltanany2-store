// frontend/src/components/layout/Navbar.tsx
import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, isAuthenticated, isAdmin, isLoading, logout } = useAuth();
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current &&
!userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close user menu on Escape key
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setUserMenuOpen(false);
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const navLinks = [
    { label: 'الرئيسية', href: '/' },
    { label: 'لابتوبات', href: '/laptops' },
    { label: 'إكسسوارات', href: '/accessories' },
    { label: 'تواصل معنا', href: '/contact' },
    { label: 'قائمة الأسعار', href: '/pricelist' },,
  ];

  // Truncate name for display
  const displayName = user?.name
    ? user.name.length > 15
      ? user.name.slice(0, 15) + '...'
      : user.name
    : '';

  return (
    <>
      <nav className="fixed top-0 right-0 z-50 w-full bg-white shadow-sm">
        <div className="flex items-center justify-between h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/images/logo.jpeg" alt="ELTANANY 2" className="h-10 w-10 object-contain rounded" />
            <span className="font-heading font-bold text-lg text-ink">ELTANANY 2</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`font-body text-sm font-medium transition-colors duration-200 hover:text-ignition-start ${
                  location.pathname === link.href ? 'text-ignition-start' : 'text-ink/70'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full hover:bg-steel-light transition-colors duration-200"
              aria-label="بحث"
            >
              <Search className="w-5 h-5 text-ink" />
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-full hover:bg-steel-light transition-colors duration-200"
            >
              <ShoppingCart className="w-5 h-5 text-ink" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold text-white gradient-brand rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth Section */}
            {isLoading ? (
              <Skeleton className="h-8 w-8 rounded-full" />
            ) : isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-steel-light transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-zinc-950 font-bold text-sm">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden lg:block text-sm text-ink font-medium">
                    مرحباً، {displayName}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-ink transition-transform ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-steel-light py-2"
                    >
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-steel-light transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        حسابي
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-steel-light transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        طلباتي
                      </Link>
                      {/* Admin Dashboard Link (only for admin users) */}
                      {isAdmin && (
                        <Link
                          to="/AhmedEltanany/dashboard"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          لوحة التحكم
                        </Link>
                      )}
                      <div className="my-1 border-t border-steel-light" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-steel-light w-full text-right transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        تسجيل الخروج
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-lg border border-ignition-start text-ignition-start hover:bg-ignition-start hover:text-white transition-colors text-sm font-medium"
              >
                تسجيل الدخول
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-full hover:bg-steel-light transition-colors duration-200"
              aria-label="القائمة"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search Expand */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-steel-light bg-white"
            >
              <form onSubmit={handleSearch} className="p-4 max-w-2xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن منتج، ماركة، أو فئة..."
                    className="w-full h-12 pr-12 pl-4 rounded-full bg-steel-light border-0 font-body text-ink placeholder:text-slate focus:ring-2 focus:ring-ignition-start/30 outline-none transition-all duration-200"
                    autoFocus
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate" />
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden border-t border-steel-light bg-white"
            >
              <div className="flex flex-col p-4 gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`px-4 py-3 rounded-lg font-body text-sm font-medium transition-colors ${
                      location.pathname === link.href
                        ? 'bg-ignition-start/10 text-ignition-start'
                        : 'text-ink/70 hover:bg-steel-light'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    to="/AhmedEltanany/dashboard"
                    className="px-4 py-3 rounded-lg font-body text-sm font-medium text-amber-600 hover:bg-amber-50 transition-colors"
                  >
                    لوحة التحكم
                  </Link>
                )}
                {!isAuthenticated && (
                  <Link
                    to="/login"
                    className="px-4 py-3 rounded-lg font-body text-sm font-medium text-ignition-start hover:bg-ignition-start/10 transition-colors"
                  >
                    تسجيل الدخول
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className="h-16" />
    </>
  );
}
