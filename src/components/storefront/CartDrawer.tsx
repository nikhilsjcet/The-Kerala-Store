import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, Tag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatINR } from '../../lib/utils';

interface CartDrawerProps {
  onCheckout: () => void;
  onContinueShopping: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout, onContinueShopping }) => {
  const { user, openAuthModal } = useAuth();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    shippingFee,
    discountCode,
    discountAmount,
    discountMessage,
    applyDiscount,
    removeDiscount,
    total,
    cartCount,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [applying, setApplying] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    setApplying(true);
    await applyDiscount(inputCoupon);
    setApplying(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer Container: Full width on phone, max-w-md on desktop */}
      <div className="fixed inset-y-0 right-0 max-w-full flex w-full sm:max-w-md pointer-events-auto">
        <div className="w-full bg-white shadow-2xl flex flex-col h-full border-l-2 border-gray-900">
          
          {/* Drawer Header - Bold & Clean */}
          <div className="p-4 sm:p-5 border-b-2 border-gray-900 flex items-center justify-between bg-stone-50 shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-[#0A5C36]">
                <ShoppingBag className="w-5 h-5 text-[#0A5C36]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-gray-900 leading-tight">
                  Shopping Cart
                </h2>
                <span className="text-xs font-bold text-gray-500">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-gray-700 hover:text-black rounded-xl hover:bg-stone-200 transition-colors cursor-pointer"
              aria-label="Close Cart"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Clean Delivery Badge */}
          <div className="bg-[#EBF5EE] py-2 px-4 border-b border-[#D4EAD9] flex items-center justify-center gap-2 text-xs font-bold text-[#0A5C36] shrink-0">
            <Truck className="w-4 h-4 text-[#0A5C36] shrink-0" />
            <span>Free Doorstep Delivery across India</span>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center text-gray-400 mb-3 border-2 border-gray-200">
                  <ShoppingBag className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-base font-extrabold text-gray-900">Your bag is empty</h3>
                <p className="text-xs text-gray-500 mt-1 mb-5 max-w-xs">
                  Discover curated Kerala lifestyle products and hot deals.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onContinueShopping();
                  }}
                  className="px-6 py-3 rounded-2xl bg-[#0A5C36] hover:bg-[#064024] text-white font-black text-xs shadow-md transition-all cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const itemPrice = item.variant?.price || item.product.price;
                const itemKey = `${item.product.id}-${item.variant?.id || 'base'}`;
                return (
                  <div
                    key={itemKey}
                    className="p-3 bg-white rounded-2xl border-2 border-gray-200 shadow-2xs hover:border-gray-300 transition-all flex gap-3"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl bg-stone-50 border border-gray-200 p-1 shrink-0"
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1 leading-snug">
                            {item.product.title}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id, item.variant?.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1 shrink-0"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {item.variant && (
                          <span className="text-[11px] text-gray-500 font-semibold block truncate">
                            {item.variant.name}
                          </span>
                        )}
                        <span className="text-xs sm:text-sm font-black text-[#0A5C36] block mt-0.5">
                          {formatINR(itemPrice)}
                        </span>
                      </div>

                      {/* Stepper & Line Total */}
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-100">
                        <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden bg-stone-50">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant?.id)}
                            className="w-7 h-7 flex items-center justify-center text-gray-700 hover:bg-stone-200 transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3 stroke-[3]" />
                          </button>
                          <span className="px-2 text-xs font-black text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant?.id)}
                            className="w-7 h-7 flex items-center justify-center text-gray-700 hover:bg-stone-200 transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3 stroke-[3]" />
                          </button>
                        </div>

                        <span className="text-xs sm:text-sm font-black text-gray-900">
                          {formatINR(itemPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Cart Footer - Bolder & High Contrast */}
          {cart.length > 0 && (
            <div className="p-4 border-t-2 border-gray-900 bg-stone-50 space-y-3 shrink-0">
              
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Coupon (e.g. KERALA10)"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                    className="w-full pl-8 pr-3 py-2 bg-white border-2 border-gray-300 rounded-xl text-xs uppercase font-bold text-gray-900 focus:outline-none focus:border-[#0A5C36]"
                  />
                  <Tag className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  type="submit"
                  disabled={applying || !inputCoupon.trim()}
                  className="px-4 py-2 bg-gray-900 hover:bg-black disabled:opacity-50 text-white rounded-xl text-xs font-black transition-colors cursor-pointer shrink-0"
                >
                  Apply
                </button>
              </form>

              {discountMessage && (
                <p className={`text-[11px] font-bold ${discountAmount > 0 ? 'text-emerald-700' : 'text-red-500'}`}>
                  {discountMessage}
                </p>
              )}

              {discountCode && (
                <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border-2 border-emerald-300 font-bold">
                  <span>Applied: {discountCode}</span>
                  <button onClick={removeDiscount} className="text-xs text-red-600 hover:underline cursor-pointer">
                    Remove
                  </button>
                </div>
              )}

              {/* Price Details - Clean Breakdown */}
              <div className="space-y-1.5 pt-1 text-xs">
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">{formatINR(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount</span>
                    <span>-{formatINR(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Delivery</span>
                  <span>{shippingFee === 0 ? <strong className="text-[#0A5C36] font-black">FREE</strong> : formatINR(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-base sm:text-lg font-black text-gray-900 pt-2 border-t-2 border-gray-200">
                  <span>Total Amount</span>
                  <span className="text-[#0A5C36]">{formatINR(total)}</span>
                </div>
              </div>

              {/* High-Impact Checkout Button */}
              <button
                onClick={() => {
                  if (!user) {
                    setIsCartOpen(false);
                    openAuthModal();
                    return;
                  }
                  setIsCartOpen(false);
                  onCheckout();
                }}
                className="w-full py-3.5 sm:py-4 rounded-2xl bg-[#0A5C36] hover:bg-[#064024] active:scale-98 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                <span>{user ? `Checkout • ${formatINR(total)}` : 'Sign In to Checkout'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onContinueShopping();
                }}
                className="w-full text-center text-xs font-bold text-gray-500 hover:text-gray-900 py-1 transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
