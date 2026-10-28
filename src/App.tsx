import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { AnnouncementBar } from './components/storefront/AnnouncementBar';
import { Header } from './components/storefront/Header';
import { CategoryNav } from './components/storefront/CategoryNav';
import { CartDrawer } from './components/storefront/CartDrawer';
import { Footer } from './components/storefront/Footer';
import { InfoModal } from './components/modals/InfoModal';
import { SupabaseModal } from './components/modals/SupabaseModal';
import { OtpLoginModal } from './components/modals/OtpLoginModal';
import { AuthModal } from './components/modals/AuthModal';
import { Instagram } from 'lucide-react';

// Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { WishlistPage } from './pages/WishlistPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Product, Order } from './types';

const MainApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'shop' | 'product-details' | 'checkout' | 'orders' | 'wishlist' | 'admin'>('home');
  const [selectedProductSlug, setSelectedProductSlug] = useState<string>('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);

  // Modals
  const [infoModalType, setInfoModalType] = useState<string | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const { isAdmin } = useAuth();

  useEffect(() => {
    const handleNavOrders = () => handleNavigate('orders');
    window.addEventListener('navigate-orders', handleNavOrders);
    return () => window.removeEventListener('navigate-orders', handleNavOrders);
  }, []);

  const handleNavigate = (page: string, param?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page === 'home') {
      setCurrentPage('home');
    } else if (page === 'shop') {
      if (param?.startsWith('category=')) {
        setSelectedCategorySlug(param.replace('category=', ''));
      } else if (param?.startsWith('search=')) {
        setActiveSearchQuery(decodeURIComponent(param.replace('search=', '')));
      } else if (param?.startsWith('filter=')) {
        setActiveFilter(param.replace('filter=', ''));
      } else {
        setSelectedCategorySlug('all');
        setActiveSearchQuery('');
        setActiveFilter('');
      }
      setCurrentPage('shop');
    } else if (page === 'product-details' && param) {
      setSelectedProductSlug(param);
      setCurrentPage('product-details');
    } else if (page === 'checkout') {
      setCurrentPage('checkout');
    } else if (page === 'orders') {
      setCurrentPage('orders');
    } else if (page === 'wishlist') {
      setCurrentPage('wishlist');
    } else if (page === 'admin') {
      setCurrentPage('admin');
    }
  };

  const handleSelectProduct = (product: Product) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedProductSlug(product.slug);
    setCurrentPage('product-details');
  };

  const handleSelectCategoryFromNav = (slug: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedCategorySlug(slug);
    setCurrentPage('shop');
  };

  const handleOrderSuccess = (order: Order) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setRecentOrder(order);
    setCurrentPage('orders');
  };

  // If in admin page, render the full admin dashboard
  if (currentPage === 'admin') {
    return (
      <>
        <AdminDashboard
          onBackToStorefront={() => setCurrentPage('home')}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        />
        <SupabaseModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] overflow-x-hidden w-full">
      
      {/* 1. Announcement Bar */}
      <AnnouncementBar 
        onOpenInfoModal={(type) => type === 'track' ? handleNavigate('orders') : setInfoModalType(type)} 
        onNavigateOrders={() => handleNavigate('orders')}
      />

      {/* 2. Main Storefront Header */}
      <Header
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />

      {/* 3. Category Horizontal Navigation */}
      <CategoryNav
        onSelectCategory={handleSelectCategoryFromNav}
        activeCategorySlug={currentPage === 'shop' ? selectedCategorySlug : undefined}
      />

      {/* 4. Main Page View Router */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
            onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          />
        )}

        {currentPage === 'shop' && (
          <ShopPage
            initialCategorySlug={selectedCategorySlug}
            initialSearchQuery={activeSearchQuery}
            initialFilter={activeFilter}
            onSelectProduct={handleSelectProduct}
            onSelectCategory={handleSelectCategoryFromNav}
          />
        )}

        {currentPage === 'product-details' && (
          <ProductDetailsPage
            slug={selectedProductSlug}
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPage === 'checkout' && (
          <CheckoutPage
            onNavigate={handleNavigate}
            onOrderSuccess={handleOrderSuccess}
          />
        )}

        {currentPage === 'orders' && (
          <OrdersPage
            onNavigate={handleNavigate}
            recentOrder={recentOrder}
          />
        )}

        {currentPage === 'wishlist' && (
          <WishlistPage
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}
      </main>

      {/* 5. Footer */}
      <Footer
        onNavigateCategory={handleSelectCategoryFromNav}
        onOpenPolicy={(policy) => policy === 'track' ? handleNavigate('orders') : setInfoModalType(policy)}
      />

      {/* 6. Slide-Over Cart Drawer */}
      <CartDrawer
        onCheckout={() => handleNavigate('checkout')}
        onContinueShopping={() => handleNavigate('shop')}
      />

      {/* 7. Information & Policy Modal */}
      <InfoModal
        type={infoModalType}
        onClose={() => setInfoModalType(null)}
      />

      {/* 8. Supabase Connection Manager Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      {/* 9. Customer Google & Email Auth Modal (Brevo SMTP) */}
      <AuthModal />

      {/* 10. Mobile OTP Login Modal */}
      <OtpLoginModal />

      {/* 11. Floating Instagram Help & Order Support */}
      <aside aria-label="Support and help" className="fixed bottom-6 right-6 z-40">
        <a
          href="https://instagram.com/thekeralastore_"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2.5 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 cursor-pointer"
          title="Direct Message The Kerala Store Support on Instagram (@thekeralastore_)"
        >
          <Instagram className="w-5 h-5 text-white" />
          <span className="text-xs font-bold hidden sm:inline-block">Instagram Support</span>
        </a>
      </aside>

    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

