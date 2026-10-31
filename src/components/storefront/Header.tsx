import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  User, 
  Heart, 
  ShoppingCart, 
  Menu, 
  X, 
  ShieldCheck, 
  LogOut, 
  Package, 
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { StoreService } from '../../services/storeService';
import { Product } from '../../types';
import { formatINR } from '../../lib/utils';
import { KeralaStoreLogo } from '../common/KeralaStoreLogo';

interface HeaderProps {
  onNavigate: (page: string, param?: string) => void;
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const { cartCount, setIsCartOpen, wishlist } = useCart();
  const { user, isAdmin, logout, openAuthModal, openOtpModal } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Live search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await StoreService.getProducts({ search: searchQuery, limit: 5 });
      setSearchResults(results);
      setIsSearching(false);
      setShowSearchDropdown(true);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to dismiss dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectProduct = (slug: string) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    onNavigate('product-details', slug);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      onNavigate('shop', `search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-2xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-8">
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-900 hover:text-[#0B4628] focus:outline-none shrink-0"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Brand Logo: TheKeralaStore™ */}
          <div 
            onClick={() => onNavigate('home')} 
            className="cursor-pointer select-none flex items-center justify-center flex-1 lg:flex-none py-1"
          >
            <KeralaStoreLogo size="md" className="h-9 sm:h-11" />
          </div>

          {/* Center Search Bar matching mockup pill shape (Desktop) */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-xl mx-4 relative">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSearchDropdown(true)}
                className="w-full pl-11 pr-4 py-2.5 bg-[#F4F4F6] border border-gray-200/80 rounded-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B4628]/20 focus:border-[#0B4628] transition-all"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-medium"
                >
                  Clear
                </button>
              )}
            </form>

            {/* Live Search Dropdown */}
            {showSearchDropdown && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 overflow-hidden max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <div>
                    <div className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Matching Products
                    </div>
                    {searchResults.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectProduct(p.slug)}
                        className="px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 cursor-pointer transition-colors"
                      >
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="w-10 h-10 object-cover rounded-lg border border-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                          <p className="text-xs text-[#0B4628] font-bold">{formatINR(p.price)}</p>
                        </div>
                      </div>
                    ))}
                    <div className="mt-2 pt-2 border-t border-gray-100 px-4">
                      <button
                        onClick={handleSearchSubmit}
                        className="text-xs font-semibold text-[#0B4628] hover:underline flex items-center gap-1"
                      >
                        View all results for "{searchQuery}" <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No products found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons: User Profile & Cart (Wishlist inside profile menu on mobile) */}
          <div className="flex items-center space-x-2 sm:space-x-5 shrink-0">
            
            {/* User Profile Outline Icon with Dropdown */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="p-1.5 text-gray-900 hover:text-[#0B4628] rounded-full hover:bg-gray-100 transition-colors flex items-center"
                aria-label="User account"
                title="Account & Wishlist"
              >
                <User className="w-6 h-6 text-gray-900" strokeWidth={1.75} />
              </button>

              {/* User Account / Wishlist / Admin Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-[11px] text-gray-400">
                      {user ? 'Signed in as' : 'Account'}
                    </p>
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {user ? user.full_name : 'Guest'}
                    </p>
                    <p className="text-xs text-[#0B4628] font-medium">
                      {user ? (isAdmin ? 'Store Administrator' : 'Kerala Shopper') : 'Login to save wishlist & track orders'}
                    </p>
                  </div>

                  <div className="py-1">
                    {!user && (
                      <button
                        onClick={() => { setShowUserDropdown(false); openAuthModal(); }}
                        className="w-full px-4 py-2.5 text-left text-xs sm:text-sm text-emerald-950 bg-emerald-50 hover:bg-emerald-100 font-extrabold flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <User className="w-4 h-4 text-[#0A5C36]" />
                        Sign In with Google
                      </button>
                    )}

                    {/* Wishlist prominently featured inside Profile Dropdown Menu */}
                    <button
                      onClick={() => { setShowUserDropdown(false); onNavigate('wishlist'); }}
                      className="w-full px-4 py-2.5 text-left text-xs sm:text-sm text-gray-800 hover:bg-gray-50 flex items-center justify-between transition-colors font-medium cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Heart className="w-4 h-4 text-pink-600 fill-pink-50" />
                        <span>My Wishlist</span>
                      </div>
                      <span className="text-[11px] font-bold text-white bg-[#0A5C36] px-2 py-0.5 rounded-full">
                        {wishlist.length}
                      </span>
                    </button>

                    <button
                      onClick={() => { setShowUserDropdown(false); onNavigate('orders'); }}
                      className="w-full px-4 py-2.5 text-left text-xs sm:text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Package className="w-4 h-4 text-gray-400" />
                      <span>Track My Orders</span>
                    </button>

                    {/* Admin Dashboard: ONLY visible to authenticated Store Admins */}
                    {isAdmin && (
                      <button
                        onClick={() => { setShowUserDropdown(false); onNavigate('admin'); }}
                        className="w-full px-4 py-2.5 text-left text-xs sm:text-sm text-[#0B4628] font-bold hover:bg-emerald-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#0B4628]" />
                        <span>Store Admin Dashboard</span>
                      </button>
                    )}
                  </div>

                  {user && (
                    <div className="pt-1 border-t border-gray-100">
                      <button
                        onClick={() => { 
                          setShowUserDropdown(false); 
                          logout(); 
                          onNavigate('home'); 
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-bold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Wishlist Icon (Hidden on mobile - accessible via Profile Dropdown on mobile) */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="hidden md:flex p-1.5 text-gray-900 hover:text-[#0B4628] rounded-full hover:bg-gray-100 relative transition-colors"
              aria-label="Wishlist"
              title="View Wishlist"
            >
              <Heart className="w-6 h-6" strokeWidth={1.75} />
              <span className="absolute -top-1 -right-1 bg-[#0A5C36] text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center shadow-2xs">
                {wishlist.length}
              </span>
            </button>

            {/* Shopping Cart Icon with Green Badge Counter (Mobile & Desktop) */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-1.5 text-gray-900 hover:text-[#0B4628] rounded-full hover:bg-gray-100 relative transition-colors flex items-center"
              aria-label="Shopping Cart"
              title="View Cart"
            >
              <ShoppingCart className="w-6 h-6 text-gray-900" strokeWidth={1.75} />
              <span className="absolute -top-1 -right-1 bg-[#0A5C36] text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center shadow-2xs">
                {cartCount}
              </span>
            </button>

          </div>

        </div>

        {/* Mobile Search Bar matching mockup */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F2F2F4] border border-gray-200/60 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </form>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3.5 space-y-2 animate-in slide-in-from-top-2 duration-150 shadow-lg">
          <div className="pb-2.5 mb-1 border-b border-gray-100 flex items-center justify-between">
            <KeralaStoreLogo size="sm" />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 text-gray-500 hover:text-gray-800"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => { setMobileMenuOpen(false); onNavigate('home'); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
              currentPage === 'home' ? 'bg-emerald-50 text-[#0B4628]' : 'text-gray-700'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); onNavigate('shop'); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
              currentPage === 'shop' ? 'bg-emerald-50 text-[#0B4628]' : 'text-gray-700'
            }`}
          >
            Shop All Products
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); onNavigate('wishlist'); }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-600" />
              <span>My Wishlist</span>
            </div>
            <span className="text-xs font-bold text-white bg-[#0A5C36] px-2 py-0.5 rounded-full">
              {wishlist.length}
            </span>
          </button>
          {!user ? (
            <button
              onClick={() => { setMobileMenuOpen(false); openAuthModal(); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-2"
            >
              <User className="w-4 h-4 text-[#0A5C36]" />
              <span>Sign In / Sign Up</span>
            </button>
          ) : (
            <div className="px-3 py-2 bg-stone-50 rounded-xl flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-700 truncate max-w-[180px]">{user.full_name}</span>
              <button
                onClick={() => { setMobileMenuOpen(false); logout(); onNavigate('home'); }}
                className="text-red-600 font-bold hover:underline"
              >
                Sign Out
              </button>
            </div>
          )}
          <button
            onClick={() => { setMobileMenuOpen(false); onNavigate('orders'); }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Package className="w-4 h-4 text-gray-400" />
            <span>My Orders</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('admin'); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-[#0B4628] bg-emerald-50 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-[#0B4628]" />
              <span>Store Admin Dashboard</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
