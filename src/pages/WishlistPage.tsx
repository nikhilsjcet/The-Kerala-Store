import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { StoreService } from '../services/storeService';
import { Product } from '../types';
import { ProductCard } from '../components/storefront/ProductCard';
import { Heart, ShoppingBag, ArrowLeft } from 'lucide-react';

interface WishlistPageProps {
  onNavigate: (page: string, param?: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onNavigate, onSelectProduct }) => {
  const { wishlist } = useCart();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    StoreService.getProducts().then((all) => {
      if (isMounted) {
        setWishlistProducts(all.filter((p) => wishlist.includes(p.id)));
        setIsLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [wishlist]);

  return (
    <div className="min-h-screen bg-[#FBFBFA] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-200 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <Heart className="w-6 h-6 text-[#FF3B80] fill-[#FF3B80]" />
              <span>My Wishlist ({wishlist.length})</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Your saved dropshipping items for fast checkout
            </p>
          </div>

          <button
            onClick={() => onNavigate('shop')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </button>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 max-w-md mx-auto shadow-2xs">
            <div className="w-16 h-16 rounded-full bg-pink-50 text-[#FF3B80] flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Your wishlist is empty</h3>
            <p className="text-xs text-gray-500 mt-1 mb-6">
              Explore our trending gadgets and click the heart icon on any product to save it here.
            </p>
            <button
              onClick={() => onNavigate('shop')}
              className="px-6 py-2.5 rounded-full bg-[#0A5C36] text-white font-bold text-xs shadow-sm hover:bg-[#064024]"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {wishlistProducts.map((p) => (
              <ProductCard key={p.id} product={p} onSelect={onSelectProduct} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

