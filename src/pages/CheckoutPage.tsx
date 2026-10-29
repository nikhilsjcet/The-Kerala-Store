import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { StoreService } from '../services/storeService';
import { formatINR } from '../lib/utils';
import { ShippingAddress, Order } from '../types';
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Banknote, 
  CheckCircle2, 
  ArrowLeft, 
  Lock, 
  AlertCircle,
  Tag,
  Copy,
  Check,
  UserCheck
} from 'lucide-react';

interface CheckoutPageProps {
  onNavigate: (page: string, param?: string) => void;
  onOrderSuccess: (order: Order) => void;
}

const INDIAN_STATES = [
  'Kerala', 'Karnataka', 'Tamil Nadu', 'Maharashtra', 'Delhi', 'Andhra Pradesh', 
  'Telangana', 'Gujarat', 'West Bengal', 'Uttar Pradesh', 'Rajasthan', 'Madhya Pradesh', 
  'Punjab', 'Haryana', 'Bihar', 'Odisha', 'Assam', 'Goa', 'Jharkhand', 'Chhattisgarh', 
  'Himachal Pradesh', 'Uttarakhand', 'Jammu and Kashmir', 'Puducherry', 'Chandigarh'
];

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate, onOrderSuccess }) => {
  const { cart, subtotal, shippingFee, discountAmount, discountCode, total, clearCart } = useCart();
  const { user, openAuthModal } = useAuth();

  const [formData, setFormData] = useState<ShippingAddress>({
    fullName: user?.full_name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: 'Kerala',
    pincode: '',
    country: 'India',
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Require login before checkout if user is a guest
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-[#0A5C36] flex items-center justify-center mb-4 shadow-sm border border-emerald-100">
          <UserCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Sign In Required to Checkout</h2>
        <p className="text-xs text-gray-500 mb-6 max-w-sm">
          Please sign in or create an account with The Kerala Store to place your order and receive delivery updates.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={openAuthModal}
            className="px-6 py-3 bg-[#0A5C36] hover:bg-[#074326] text-white rounded-2xl font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Sign In / Sign Up
          </button>
          <button
            onClick={() => onNavigate('shop')}
            className="px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
        <p className="text-xs text-gray-500 mb-6">Add items to your cart before proceeding to checkout.</p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-2.5 bg-[#0A5C36] text-white rounded-full font-bold text-xs"
        >
          Browse Products
        </button>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.addressLine1.trim() || !formData.pincode.trim()) {
      setErrorMessage('Please fill in all required shipping address fields.');
      return;
    }

    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      setErrorMessage('Please enter a valid 10-digit mobile number for delivery updates.');
      return;
    }

    if (!/^\d{6}$/.test(formData.pincode.replace(/\D/g, ''))) {
      setErrorMessage('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Server-side price recalculation simulation
      const verifiedSubtotal = cart.reduce((sum, item) => {
        const price = item.variant?.price || item.product.price;
        return sum + price * item.quantity;
      }, 0);

      const verifiedShipping = verifiedSubtotal >= 999 ? 0 : 99;
      let verifiedDiscount = 0;
      if (discountCode) {
        const valRes = await StoreService.validateDiscount(discountCode, verifiedSubtotal);
        if (valRes.valid) verifiedDiscount = valRes.discountAmount;
      }
      const verifiedTotal = Math.max(0, verifiedSubtotal - verifiedDiscount + verifiedShipping);

      // Order Items
      const orderItems = cart.map((item) => ({
        product_id: item.product.id,
        product_title: item.product.title,
        product_image: item.product.images[0],
        sku: item.variant?.sku || item.product.sku,
        variant_name: item.variant?.name,
        unit_price: item.variant?.price || item.product.price,
        quantity: item.quantity,
        total_price: (item.variant?.price || item.product.price) * item.quantity,
      }));

      // Helper to finalize order in Supabase / StoreService
      const createFinalOrder = async (paidId?: string) => {
        const newOrder = await StoreService.createOrder({
          customer_name: formData.fullName,
          customer_email: formData.email,
          customer_phone: formData.phone,
          shipping_address: formData,
          items: orderItems,
          subtotal: verifiedSubtotal,
          discount_amount: verifiedDiscount,
          discount_code: discountCode,
          shipping_fee: verifiedShipping,
          total_amount: verifiedTotal,
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'cod' ? 'pending' : 'completed',
          payment_id: paidId || (paymentMethod === 'cod' ? undefined : `rzp_sim_${Date.now()}`),
          notes: `Order placed via TheKeralaStore storefront. State: ${formData.state}`,
        });

        clearCart();
        setIsSubmitting(false);
        onOrderSuccess(newOrder);
      };

      // Real Razorpay Checkout flow if configured, else simulation
      if (paymentMethod === 'razorpay') {
        const configuredKey = localStorage.getItem('tks_razorpay_key_id') || import.meta.env.VITE_RAZORPAY_KEY_ID || '';
        const isRealKey = configuredKey && (configuredKey.startsWith('rzp_test_') || configuredKey.startsWith('rzp_live_')) && !configuredKey.includes('demo');

        if (isRealKey && typeof (window as any).Razorpay === 'function') {
          const options = {
            key: configuredKey,
            amount: Math.round(verifiedTotal * 100), // in paise (1 INR = 100 paise)
            currency: 'INR',
            name: 'The Kerala Store',
            description: `Payment for ${orderItems.length} item(s)`,
            prefill: {
              name: formData.fullName,
              email: formData.email,
              contact: formData.phone,
            },
            theme: {
              color: '#0A5C36',
            },
            handler: async function (response: any) {
              try {
                await createFinalOrder(response.razorpay_payment_id);
              } catch (err: any) {
                setErrorMessage(err?.message || 'Failed to complete order after payment.');
                setIsSubmitting(false);
              }
            },
            modal: {
              ondismiss: function () {
                setIsSubmitting(false);
              },
            },
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.on('payment.failed', function (resp: any) {
            setErrorMessage(`Payment failed: ${resp.error?.description || 'Transaction declined'}`);
            setIsSubmitting(false);
          });
          rzp.open();
          return;
        }

        // Fallback simulation mode if key is demo
        await createFinalOrder(`rzp_sim_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`);
        return;
      }

      // COD payment
      await createFinalOrder();
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err?.message || 'Failed to process your order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Back */}
        <button
          onClick={() => onNavigate('shop')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Shopping</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-8">
          Secure Doorstep Checkout
        </h1>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column (8 cols): Delivery Address & Payment Method */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Customer & Shipping Details */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-2xs space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
                <Truck className="w-5 h-5 text-[#0A5C36]" />
                <h2 className="text-base font-bold text-gray-900">1. Delivery Address (India)</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number (+91) *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">House / Flat / Street Address *</label>
                <input
                  type="text"
                  name="addressLine1"
                  required
                  placeholder="Flat No, Building Name, Street"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">City / Town *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="e.g. Kottayam"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">State *</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">6-Digit PIN Code *</label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    maxLength={6}
                    placeholder="e.g. 682042"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method Selection */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-2xs space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
                <CreditCard className="w-5 h-5 text-[#0A5C36]" />
                <h2 className="text-base font-bold text-gray-900">2. Select Payment Method</h2>
              </div>

              <div className="space-y-3">
                {/* Cash On Delivery */}
                <label
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#0A5C36] bg-emerald-50/50 shadow-2xs'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-[#0A5C36]"
                    />
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        <Banknote className="w-4 h-4 text-emerald-700" /> Cash on Delivery (COD)
                      </p>
                      <p className="text-[11px] text-gray-500">Pay cash or UPI upon delivery to your doorstep.</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    No Extra Fee
                  </span>
                </label>

                {/* Razorpay Online Payment */}
                <label
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'border-[#0A5C36] bg-emerald-50/50 shadow-2xs'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="accent-[#0A5C36]"
                    />
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-blue-700" /> Razorpay Online (UPI / Cards / NetBanking)
                      </p>
                      <p className="text-[11px] text-gray-500">Instant UPI (GPay, PhonePe, Paytm), RuPay, Visa, Mastercard.</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                    Instant &amp; Fast
                  </span>
                </label>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

          </div>

          {/* Right Column (5 cols): Order Summary */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-2xs space-y-6 sticky top-28">
            <h3 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
              Order Summary ({cart.length} items)
            </h3>

            {/* Cart Preview Items */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cart.map((item) => {
                const itemPrice = item.variant?.price || item.product.price;
                return (
                  <div key={`${item.product.id}-${item.variant?.id}`} className="flex gap-3 text-xs">
                    <img
                      src={item.product.images[0]}
                      alt=""
                      className="w-12 h-12 object-contain bg-stone-50 rounded-lg border border-gray-100 p-1 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{item.product.title}</p>
                      <p className="text-gray-500 text-[11px]">
                        Qty: {item.quantity} {item.variant ? `(${item.variant.name})` : ''}
                      </p>
                    </div>
                    <span className="font-bold text-gray-900">
                      {formatINR(itemPrice * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 pt-4 border-t border-gray-100 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">{formatINR(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount ({discountCode})</span>
                  <span>-{formatINR(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>{shippingFee === 0 ? <strong className="text-[#0A5C36]">FREE</strong> : formatINR(shippingFee)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-gray-900 pt-3 border-t border-gray-200">
                <span>Final Total (INR)</span>
                <span className="text-[#0A5C36] text-xl">{formatINR(total)}</span>
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-[#0A5C36] hover:bg-[#064024] active:scale-98 disabled:opacity-50 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmitting ? 'Confirming Order...' : `Place Order • ${formatINR(total)}`}</span>
            </button>

            <div className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Bank-grade 256-bit encrypted checkout</span>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
};

