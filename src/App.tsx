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
import { AuthModal } from './components/modals/AuthModal';
import { Instagram } from 'lucide-react';

// Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { WishlistPage } from './pages/WishlistPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { TermsPage } from './pages/TermsPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginView } from './components/admin/AdminLoginView';
import { Product, Order } from './types';

const getInitialPage = (): 'home' | 'shop' | 'product-details' | 'checkout' | 'orders' | 'wishlist' | 'admin' | 'policies' | 'terms' => {
  if (typeof window === 'undefined') return 'home';
  const rawPath = window.location.pathname.toLowerCase().trim();
  const path = rawPath.endsWith('/') && rawPath.length > 1 ? rawPath.slice(0, -1) : rawPath;
  const search = window.location.search.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  if (
    path === '/nikhil' || 
    path.startsWith('/nikhil') || 
    search.includes('page=nikhil') || 
    search.includes('admin=1') ||
    hash === '#nikhil'
  ) {
    return 'admin';
  }
  if (path === '/orders' || search.includes('page=orders') || hash === '#orders') {
    return 'orders';
  }
  if (path === '/wishlist' || search.includes('page=wishlist') || hash === '#wishlist') {
    return 'wishlist';
  }
  if (path === '/checkout' || search.includes('page=checkout')) {
    return 'checkout';
  }
  if (path === '/shop' || search.includes('page=shop') || hash === '#shop') {
    return 'shop';
  }
  if (
    path === '/policies' || 
    path === '/policy' || 
    path === '/privacy' || 
    path === '/shipping-policy' || 
    path === '/return-policy' || 
    search.includes('page=policies') || 
    hash === '#policies'
  ) {
    return 'policies';
  }
  if (
    path === '/terms' || 
    path === '/term' || 
    path === '/terms-of-service' || 
    path === '/terms-conditions' || 
    search.includes('page=terms') || 
    search.includes('page=term') || 
    hash === '#terms' || 
    hash === '#term'
  ) {
    return 'terms';
  }
  // Support product details reload/direct load without resetting to home
  if (path.startsWith('/product/') || path.startsWith('/products/') || search.includes('product=')) {
    return 'product-details';
  }
  return 'home';
};

const getInitialProductSlug = (): string => {
  if (typeof window === 'undefined') return '';
  const pathname = window.location.pathname;
  if (pathname.includes('/product/')) {
    const parts = pathname.split('/product/');
    return decodeURIComponent(parts[1]?.split('/')[0]?.split('?')[0]?.split('#')[0] || '');
  }
  if (pathname.includes('/products/')) {
    const parts = pathname.split('/products/');
    return decodeURIComponent(parts[1]?.split('/')[0]?.split('?')[0]?.split('#')[0] || '');
  }
  const params = new URLSearchParams(window.location.search);
  return params.get('product') || params.get('slug') || '';
};

const MainApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'shop' | 'product-details' | 'checkout' | 'orders' | 'wishlist' | 'admin' | 'policies' | 'terms'>(getInitialPage);
  const [selectedProductSlug, setSelectedProductSlug] = useState<string>(getInitialProductSlug);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);

  // Modals
  const [infoModalType, setInfoModalType] = useState<string | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const { user, isAdmin, isAuthModalOpen, closeAuthModal } = useAuth();
  const { isCartOpen, setIsCartOpen } = useCart();

  useEffect(() => {
    // Ensure base history entry exists so pressing back doesn't close the site
    if (!window.history.state) {
      window.history.replaceState({ page: getInitialPage(), slug: getInitialProductSlug() }, '', window.location.href);
    }

    const handleNavOrders = () => handleNavigate('orders');
    window.addEventListener('navigate-orders', handleNavOrders);

    const handlePopState = (e: PopStateEvent) => {
      // If Cart Drawer or Auth Modal is open, closing it on back press prevents exiting site
      if (isCartOpen) {
        setIsCartOpen(false);
        return;
      }
      if (isAuthModalOpen) {
        closeAuthModal();
        return;
      }
      if (infoModalType) {
        setInfoModalType(null);
        return;
      }

      if (e.state && e.state.page) {
        setCurrentPage(e.state.page);
        if (e.state.slug) setSelectedProductSlug(e.state.slug);
        if (e.state.param?.startsWith('category=')) {
          setSelectedCategorySlug(e.state.param.replace('category=', ''));
        }
      } else {
        const p = getInitialPage();
        setCurrentPage(p);
        if (p === 'product-details') {
          setSelectedProductSlug(getInitialProductSlug());
        }
      }
    };
    window.addEventListener('popstate', handlePopState);

    const handleHashChange = () => {
      setCurrentPage(getInitialPage());
    };
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('navigate-orders', handleNavOrders);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [isCartOpen, isAuthModalOpen, infoModalType]);

  const handleNavigate = (page: string, param?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page === 'home') {
      window.history.pushState({ page: 'home' }, '', '/');
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
      window.history.pushState({ page: 'shop' }, '', '/shop' + (param ? `?${param}` : ''));
      setCurrentPage('shop');
    } else if (page === 'product-details' && param) {
      setSelectedProductSlug(param);
      window.history.pushState({ page: 'product-details', slug: param }, '', `/product/${param}`);
      setCurrentPage('product-details');
    } else if (page === 'checkout') {
      window.history.pushState({ page: 'checkout' }, '', '/checkout');
      setCurrentPage('checkout');
    } else if (page === 'orders') {
      window.history.pushState({ page: 'orders' }, '', '/orders');
      setCurrentPage('orders');
    } else if (page === 'wishlist') {
      window.history.pushState({ page: 'wishlist' }, '', '/wishlist');
      setCurrentPage('wishlist');
    } else if (page === 'admin') {
      window.history.pushState({ page: 'admin' }, '', '/nikhil');
      setCurrentPage('admin');
    } else if (page === 'policies') {
      window.history.pushState({ page: 'policies', param }, '', '/policies' + (param ? `?tab=${param}` : ''));
      setCurrentPage('policies');
    } else if (page === 'terms' || page === 'term') {
      window.history.pushState({ page: 'terms' }, '', '/terms');
      setCurrentPage('terms');
    }
  };

  const handleSelectProduct = (product: Product) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedProductSlug(product.slug);
    window.history.pushState({ page: 'product-details', slug: product.slug }, '', `/product/${product.slug}`);
    setCurrentPage('product-details');
  };

  const handleSelectCategoryFromNav = (slug: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedCategorySlug(slug);
    window.history.pushState({ page: 'shop', category: slug }, '', `/shop?category=${slug}`);
    setCurrentPage('shop');
  };

  const handleOrderSuccess = (order: Order) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setRecentOrder(order);
    window.history.pushState({ page: 'orders' }, '', '/orders');
    setCurrentPage('orders');
  };

  // If in admin page, check if authenticated
  if (currentPage === 'admin') {
    if (!isAdmin) {
      return (
        <AdminLoginView
          onBackToStorefront={() => handleNavigate('home')}
          onSuccess={() => {
            // Re-renders with AdminDashboard once authenticated
          }}
        />
      );
    }

    return (
      <>
        <AdminDashboard
          onBackToStorefront={() => handleNavigate('home')}
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

        {currentPage === 'policies' && (
          <PoliciesPage
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'terms' && (
          <TermsPage
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* 5. Footer */}
      <Footer
        onNavigateCategory={handleSelectCategoryFromNav}
        onNavigatePage={handleNavigate}
        onOpenPolicy={(policy) => {
          if (policy === 'track') handleNavigate('orders');
          else if (policy === 'admin') handleNavigate('admin');
          else if (policy === 'terms' || policy === 'term') handleNavigate('terms');
          else if (policy === 'shipping' || policy === 'returns' || policy === 'privacy' || policy === 'policies') handleNavigate('policies', policy);
          else setInfoModalType(policy);
        }}
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

      {/* 9. Customer Google Authentication Modal */}
      <AuthModal />

      {/* 10. Floating Instagram Help & Order Support */}
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

