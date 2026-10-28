import React from 'react';
import { Heart, ShoppingBag, Star, Check } from 'lucide-react';
import { Product } from '../../types';
import { formatINR } from '../../lib/utils';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const isWishlisted = isInWishlist(product.id);
  const [added, setAdded] = React.useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1, product.variants?.[0]);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative bg-white rounded-2xl border border-gray-100/90 shadow-xs hover:shadow-card hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full bg-stone-50 overflow-hidden flex items-center justify-center p-4">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {product.discount_percentage ? (
            <span className="bg-[#FF3B80] text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
              {product.discount_percentage}% OFF
            </span>
          ) : null}
          {product.is_new_arrival && (
            <span className="bg-[#0A5C36] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              NEW
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors z-10 ${
            isWishlisted 
              ? 'bg-pink-50 text-[#FF3B80] shadow-sm' 
              : 'bg-white/80 text-gray-500 hover:text-[#FF3B80] hover:bg-white'
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#FF3B80]' : ''}`} />
        </button>

        {/* Stock pill if low */}
        {product.stock_quantity <= 10 && product.stock_quantity > 0 && (
          <div className="absolute bottom-2 left-2 text-[10px] font-bold text-amber-700 bg-amber-100/90 backdrop-blur-xs px-2 py-0.5 rounded-full">
            Only {product.stock_quantity} left
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Tag */}
          <span className="text-[11px] font-semibold tracking-wider uppercase text-gray-400 block mb-1">
            {product.category?.name || 'Department'}
          </span>

          {/* Title */}
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-[#0A5C36] transition-colors line-clamp-2 leading-snug mb-2">
            {product.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center space-x-1.5 mb-3">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span className="text-xs font-bold text-gray-800">{product.rating.toFixed(1)}</span>
            <span className="text-[11px] text-gray-400">({product.review_count})</span>
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-base sm:text-lg font-extrabold text-[#0A5C36]">
                {formatINR(product.price)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-xs text-gray-400 line-through">
                  {formatINR(product.original_price)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-500 font-medium">Free Delivery</span>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={handleAddToCart}
            className={`p-2.5 rounded-xl font-bold transition-all shadow-xs active:scale-95 flex items-center justify-center ${
              added
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 hover:bg-[#0A5C36] text-gray-800 hover:text-white'
            }`}
            title="Add to Shopping Cart"
          >
            {added ? <Check className="w-4 h-4 stroke-[3]" /> : <ShoppingBag className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </div>
  );
};

