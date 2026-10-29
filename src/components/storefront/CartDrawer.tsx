import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, Tag, Check, LogIn } from 'lucide-react';
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
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-stone-50">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-[#0A5C36]" />
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Shopping Cart ({cartCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Guaranteed Banner */}
          <div className="bg-[#EBF5EE] p-3 px-5 border-b border-[#D4EAD9]">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-[#0A5C36] font-bold">
                <Truck className="w-4 h-4 text-[#0A5C36]" />
                <span>Free Doorstep Delivery on this order</span>
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Free
              </span>
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-gray-800">Your cart is empty</h3>
                <p className="text-xs text-gray-500 mt-1 mb-6">
                  Browse our hot deals and add useful products to your bag.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onContinueShopping();
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#0A5C36] text-white font-bold text-xs shadow-sm hover:bg-[#064024] transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const itemPrice = item.variant?.price || item.product.price;
                return (
                  <div
                    key={`${item.product.id}-${item.variant?.id || 'base'}`}
                    className="flex gap-3 pb-4 border-b border-gray-100 last:border-b-0"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-18 h-18 sm:w-20 sm:h-20 object-contain rounded-xl bg-stone-50 border border-gray-100 p-1 shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-1">
                            {item.product.title}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id, item.variant?.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {item.variant && (
                          <span className="text-[11px] text-gray-500 font-medium block">
                            Variant: {item.variant.name}
                          </span>
                        )}
                        <span className="text-xs sm:text-sm font-bold text-[#0A5C36] block mt-0.5">
                          {formatINR(itemPrice)}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant?.id)}
                            className="p-1 px-2 text-gray-600 hover:bg-gray-200 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant?.id)}
                            className="p-1 px-2 text-gray-600 hover:bg-gray-200 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs text-gray-400 font-medium ml-auto">
                          Total: {formatINR(itemPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Cart Footer & Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-stone-50 space-y-3">
              
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Coupon (e.g. KERALA10)"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs uppercase font-medium focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
                  />
                  <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  type="submit"
                  disabled={applying || !inputCoupon.trim()}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Apply
                </button>
              </form>

              {discountMessage && (
                <p className={`text-[11px] font-medium ${discountAmount > 0 ? 'text-emerald-700' : 'text-red-500'}`}>
                  {discountMessage}
                </p>
              )}

              {discountCode && (
                <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <span className="font-semibold">Applied: {discountCode}</span>
                  <button onClick={removeDiscount} className="text-xs text-red-500 hover:underline">
                    Remove
                  </button>
                </div>
              )}

              {/* Price Details */}
              <div className="space-y-1.5 pt-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatINR(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount</span>
                    <span>-{formatINR(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? <strong className="text-[#0A5C36]">FREE</strong> : formatINR(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-extrabold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total (INR)</span>
                  <span className="text-[#0A5C36]">{formatINR(total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
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
                className="w-full py-3.5 rounded-2xl bg-[#0A5C36] hover:bg-[#064024] active:scale-98 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>{user ? 'Proceed to Checkout' : 'Sign In to Checkout'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onContinueShopping();
                }}
                className="w-full text-center text-xs font-semibold text-gray-500 hover:text-gray-800 py-1"
              >
                Or Continue Browsing
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

