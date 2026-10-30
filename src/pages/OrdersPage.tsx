import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { StoreService } from '../services/storeService';
import { useAuth } from '../context/AuthContext';
import { formatINR, getCourierTrackingUrl } from '../lib/utils';
import { 
  Package, 
  Search, 
  CheckCircle2, 
  Clock, 
  Truck, 
  MapPin, 
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Instagram,
  FileText,
  Copy,
  Check,
  ShieldCheck,
  Headphones,
  Sparkles,
  Wallet,
  Phone,
  User,
  MessageCircle,
  Calendar
} from 'lucide-react';

interface OrdersPageProps {
  onNavigate: (page: string, param?: string) => void;
  recentOrder?: Order | null;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ onNavigate, recentOrder }) => {
  const { user, openAuthModal } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchOrderNumber, setSearchOrderNumber] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'details' | 'tracking'>('list');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    if (user) {
      StoreService.getCustomerOrders(user.id, user.email).then((data) => {
        if (isMounted) {
          setOrders(data);
          if (recentOrder) {
            setSelectedOrder(recentOrder);
            setViewMode('details');
          }
          setIsLoading(false);
        }
      });
    } else if (recentOrder) {
      setOrders([recentOrder]);
      setSelectedOrder(recentOrder);
      setViewMode('details');
      setIsLoading(false);
    } else {
      // Unauthenticated customer: do NOT show other people's orders!
      setOrders([]);
      setIsLoading(false);
    }

    return () => { isMounted = false; };
  }, [user, recentOrder]);

  const handleCopyOrderId = (orderNumber: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(orderNumber);
      setCopiedOrderId(orderNumber);
      setTimeout(() => setCopiedOrderId(null), 2500);
    }
  };

  const formatCustomDate = (dateString?: string) => {
    if (!dateString) return '30 Oct 2026, 10:00 PM';
    try {
      const d = new Date(dateString);
      const day = d.getDate();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[d.getMonth()];
      const year = d.getFullYear();
      let hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${day} ${month} ${year} at ${hours}:${minutes} ${ampm}`;
    } catch {
      return dateString;
    }
  };

  const handleSearchOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchOrderNumber.trim();
    if (!query) return;

    // Check local list first by order number, partial number, or phone
    const cleanDigits = query.replace(/\D/g, '');
    const localMatch = orders.find(
      (o) =>
        o.order_number.toLowerCase() === query.toLowerCase() ||
        o.order_number.toLowerCase().includes(query.toLowerCase()) ||
        (cleanDigits.length >= 5 && o.customer_phone?.replace(/\D/g, '').includes(cleanDigits)) ||
        o.customer_email?.toLowerCase() === query.toLowerCase()
    );

    if (localMatch) {
      setSelectedOrder(localMatch);
      setViewMode('details');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const found = await StoreService.getOrderByNumber(query);
    if (found) {
      setSelectedOrder(found);
      setViewMode('details');
      if (!orders.some((o) => o.id === found.id)) {
        setOrders((prev) => [found, ...prev]);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert(`No order found matching "${query}". Please check your Order ID (e.g. TKS-2026-...) or phone number.`);
    }
  };

  const handleOpenOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setViewMode('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStepStatus = (status: Order['fulfilment_status'], step: number) => {
    const statusMap: Record<string, number> = {
      pending: 1,
      processing: 2,
      supplier_ordered: 2,
      shipped: 3,
      out_for_delivery: 4,
      delivered: 5,
    };
    const current = statusMap[status] || 1;
    if (current > step) return 'completed';
    if (current === step) return 'current';
    return 'upcoming';
  };

  const getStatusBadge = (status: Order['fulfilment_status']) => {
    switch (status) {
      case 'delivered':
        return {
          label: 'Delivered',
          pillColor: 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]',
          dotColor: 'bg-[#059669]',
          title: 'Delivered Successfully',
          description: 'Package delivered safely to your doorstep.'
        };
      case 'out_for_delivery':
        return {
          label: 'Out for Delivery',
          pillColor: 'bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE]',
          dotColor: 'bg-[#2563EB]',
          title: 'Out for Delivery Today',
          description: 'Our delivery agent is en route with your package.'
        };
      case 'shipped':
        return {
          label: 'Shipped',
          pillColor: 'bg-[#E0E7FF] text-[#3730A3] border-[#C7D2FE]',
          dotColor: 'bg-[#4F46E5]',
          title: 'Shipped & In Transit',
          description: 'Dispatched from Kerala hub and in transit to your city.'
        };
      case 'supplier_ordered':
        return {
          label: 'Supplier Packed',
          pillColor: 'bg-[#F3E8FF] text-[#6B21A8] border-[#E9D5FF]',
          dotColor: 'bg-[#9333EA]',
          title: 'Packed by Supplier',
          description: 'Verified, packed with care, and awaiting courier handover.'
        };
      case 'pending':
      default:
        return {
          label: 'Order Confirmed',
          pillColor: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
          dotColor: 'bg-[#D97706]',
          title: 'Your order has been confirmed',
          description: 'We are processing your order for shipment.'
        };
    }
  };

  const displayOrders = orders;

  return (
    <div className="min-h-screen bg-[#FBFBFA] py-6 sm:py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* =================================================================== */}
        {/* VIEW 1: ORDERS LIST (Screenshot 3: Track My Orders Hero & List)    */}
        {/* =================================================================== */}
        {viewMode === 'list' && (
          <div className="space-y-6">

            {/* Top Search Bar */}
            <form onSubmit={handleSearchOrder} className="relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for products, brands and more..."
                  value={searchOrderNumber}
                  onChange={(e) => setSearchOrderNumber(e.target.value)}
                  className="w-full pl-11 pr-24 py-3.5 bg-white text-gray-900 border border-gray-200/90 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0A5C36]/30 shadow-2xs placeholder:text-gray-400"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                {searchOrderNumber.trim() && (
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#0A5C36] hover:bg-[#064024] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Search
                  </button>
                )}
              </div>
            </form>

            {/* Hero Banner Card: Track My Orders with Parcel Artwork */}
            <div className="bg-gradient-to-r from-[#F9F7F2] via-[#F4EFE6] to-[#ECE5D8] rounded-3xl p-6 sm:p-7 border border-[#E5DDD0] relative overflow-hidden shadow-2xs">
              <div className="relative z-10 max-w-[62%] sm:max-w-[68%] space-y-2">
                <span className="inline-block px-3 py-1 bg-[#E2F3E9] text-[#0A5C36] text-[11px] font-black uppercase tracking-wider rounded-full border border-[#C6E7D2]">
                  The Kerala Store
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight leading-tight">
                  Track My Orders
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 leading-snug">
                  View the latest status of your orders and delivery updates.
                </p>
              </div>

              {/* Cardboard Box with Green Leaves Graphic */}
              <div className="absolute right-0 bottom-0 top-0 w-[42%] sm:w-[38%] flex items-end justify-end pointer-events-none">
                <img
                  src="/mockup/orders-parcel-box.png"
                  alt="TheKeralaStore Parcel Delivery"
                  className="h-[105%] sm:h-[115%] object-contain object-bottom-right drop-shadow-sm select-none"
                  onError={(e) => {
                    // Fallback to hero box if crop fails
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>

            {/* Empty State if No Orders Found */}
            {displayOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 sm:p-10 text-center border border-gray-200/90 shadow-2xs space-y-4">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-gray-400 mx-auto">
                  <Package className="w-8 h-8" />
                </div>
                {user ? (
                  <div>
                    <h3 className="text-base font-bold text-gray-900">No Orders Placed Yet</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                      You haven't placed any orders with The Kerala Store yet. Discover our curated collections!
                    </p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Sign In to View Your Orders</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                      Sign in with your Google account to automatically track your deliveries and order history, or search your Order ID above.
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
                  {!user && (
                    <button
                      onClick={openAuthModal}
                      className="px-6 py-2.5 rounded-full bg-[#0A5C36] text-white font-bold text-xs shadow-sm hover:bg-[#064024] cursor-pointer"
                    >
                      Sign In with Google
                    </button>
                  )}
                  <button
                    onClick={() => onNavigate('shop')}
                    className={`px-6 py-2.5 rounded-full font-bold text-xs cursor-pointer ${
                      user 
                        ? 'bg-[#0A5C36] text-white shadow-sm hover:bg-[#064024]' 
                        : 'bg-stone-100 text-stone-800 hover:bg-stone-200'
                    }`}
                  >
                    Start Shopping
                  </button>
                </div>
              </div>
            ) : (
              /* ORDERS LIST: Exact Match to Screenshot 3 */
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-gray-500 px-1 font-semibold">
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                    Your Orders ({displayOrders.length})
                  </h2>
                </div>

                {displayOrders.map((ord) => {
                  const badge = getStatusBadge(ord.fulfilment_status);
                  const firstItem = ord.items?.[0];
                  const totalItemsCount = ord.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 1;

                  return (
                    <div
                      key={ord.id}
                      onClick={() => handleOpenOrderDetails(ord)}
                      className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs hover:shadow-md hover:border-[#0A5C36]/50 transition-all cursor-pointer p-4 sm:p-5 space-y-4 group"
                    >
                      {/* Product Header Row */}
                      <div className="flex items-start gap-3.5 sm:gap-4">
                        {/* Product Image */}
                        <img
                          src={firstItem?.product_image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=400&q=80'}
                          alt={firstItem?.product_title || 'Kerala Store Product'}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-2xl bg-[#F5F5F3] border border-gray-100 p-1 shrink-0 group-hover:scale-102 transition-transform"
                        />

                        {/* Title, Qty, Order ID Pill & Status */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-black text-gray-900 text-base sm:text-lg leading-snug group-hover:text-[#0A5C36] transition-colors line-clamp-1">
                              {firstItem?.product_title || 'Curated Product'}
                              {(ord.items?.length || 0) > 1 && (
                                <span className="text-xs font-semibold text-gray-500 ml-1.5">
                                  +{ord.items!.length - 1} more
                                </span>
                              )}
                            </h3>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="font-extrabold text-gray-900 text-base sm:text-lg">
                                {formatINR(ord.total_amount)}
                              </span>
                              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#0A5C36] group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </div>

                          <div className="text-xs text-gray-500 font-medium">
                            Qty: {totalItemsCount}
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Copyable Order ID Pill */}
                            <button
                              type="button"
                              onClick={(e) => handleCopyOrderId(ord.order_number, e)}
                              title="Click to copy Order ID"
                              className="inline-flex items-center gap-1.5 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-gray-700 px-3 py-1 rounded-xl text-[11px] sm:text-xs font-semibold border border-gray-200/80 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5 text-gray-500" />
                              <span>Order ID: {ord.order_number}</span>
                              {copiedOrderId === ord.order_number ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-gray-400 hover:text-gray-700" />
                              )}
                            </button>

                            {/* Status Badge Pill */}
                            <span className={`inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full border ${badge.pillColor}`}>
                              <span className={`w-2 h-2 rounded-full ${badge.dotColor}`} />
                              <span>{badge.label}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Status Update Box inside Card */}
                      <div className="bg-[#FAF6F0] rounded-2xl p-3.5 sm:p-4 border border-[#F0E9DF] flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#F3E8D7] flex items-center justify-center text-[#92400E] shrink-0 mt-0.5">
                          <Package className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <h4 className="font-extrabold text-gray-900 text-xs sm:text-sm">
                            {badge.title}
                          </h4>
                          <p className="text-[11px] sm:text-xs text-gray-600 leading-snug">
                            {badge.description}
                          </p>
                          <p className="text-[10px] sm:text-[11px] text-gray-400 pt-0.5">
                            {formatCustomDate(ord.created_at)}
                          </p>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            {/* Direct Instagram Delivery Support Banner */}
            <div className="p-4 bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 border border-pink-200/70 rounded-3xl flex items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white shrink-0">
                  <Instagram className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-xs sm:text-sm">Need Help With Your Order?</p>
                  <p className="text-[11px] text-gray-500">DM us directly on Instagram <strong>@thekeralastore_</strong></p>
                </div>
              </div>
              <a
                href="https://instagram.com/thekeralastore_"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold shrink-0 shadow-2xs hover:opacity-90 transition-opacity"
              >
                DM Support
              </a>
            </div>

          </div>
        )}

        {/* =================================================================== */}
        {/* VIEW 2: ORDER CONFIRMATION / DETAILS (Screenshot 1: Green Hero)    */}
        {/* =================================================================== */}
        {viewMode === 'details' && selectedOrder && (
          <div className="space-y-5 animate-in fade-in duration-200">
            
            {/* Top Navigation Back Button */}
            <div className="flex items-center justify-between pb-1">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-stone-50 text-gray-800 border border-gray-200/90 rounded-2xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4 text-gray-600" />
                <span>Back to Orders</span>
              </button>

              <span className="text-xs font-mono font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200">
                {selectedOrder.order_number}
              </span>
            </div>

            {/* FOREST GREEN HERO CARD: Exact match to Screenshot 1 */}
            <div className="bg-[#0B4628] text-white rounded-3xl p-5 sm:p-7 shadow-md border-2 border-[#073820] relative overflow-hidden space-y-4">
              
              {/* Background parcel box artwork */}
              <div className="absolute right-0 top-0 bottom-0 w-[45%] sm:w-[40%] pointer-events-none flex items-center justify-end">
                <img
                  src="/mockup/order-confirmed-box.png"
                  alt="Order Confirmed Parcel Box"
                  className="h-full object-contain object-right opacity-90 select-none"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              {/* Status Pill & Header */}
              <div className="relative z-10 max-w-[70%] sm:max-w-[75%] space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#105633] text-emerald-200 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider border border-emerald-500/30">
                  <span className="w-4 h-4 rounded-full bg-[#85E3B3] flex items-center justify-center text-[#0B4628]">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                  <span>Order Confirmed</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Thank You,<br />
                  <span className="uppercase">{selectedOrder.customer_name || 'Valued Customer'}!</span>
                </h1>

                <p className="text-xs sm:text-sm text-emerald-100/90 leading-snug">
                  Your order has been placed successfully and is being prepared with care.
                </p>
              </div>

              {/* Two Frosted Badges: ORDER ID & PAYMENT METHOD */}
              <div className="relative z-10 grid grid-cols-2 gap-2.5 pt-1">
                {/* Order ID Card */}
                <div 
                  onClick={() => handleCopyOrderId(selectedOrder.order_number)}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 flex items-center gap-2.5 cursor-pointer hover:bg-white/15 transition-colors"
                  title="Click to copy Order ID"
                >
                  <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-emerald-200 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 block">
                      Order ID
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white font-mono truncate block">
                      {selectedOrder.order_number}
                    </span>
                  </div>
                </div>

                {/* Payment Method Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-emerald-200 shrink-0">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 block">
                      Payment Method
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white truncate block">
                      {selectedOrder.payment_method === 'razorpay' ? 'Paid via Razorpay' : 'Cash on Delivery'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Placed On Timestamp */}
              <div className="relative z-10 flex items-center gap-2.5 pt-1 text-emerald-100/80 text-[11px] sm:text-xs">
                <Calendar className="w-4 h-4 text-emerald-300 shrink-0" />
                <div>
                  <p className="font-semibold text-white">Placed on {formatCustomDate(selectedOrder.created_at)}</p>
                  <p className="text-[10px] text-emerald-200/90">Curated Kerala Doorstep Delivery</p>
                </div>
              </div>

            </div>

            {/* ORDERED PRODUCTS CARD: Exact match to Screenshot 1 */}
            <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#0A5C36]" />
                  <h2 className="text-base sm:text-lg font-black text-gray-900">
                    Ordered Products ({(selectedOrder.items || []).length})
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setViewMode('tracking')}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-[#EDF7F2] hover:bg-[#E2F3E9] text-[#0A5C36] font-bold text-xs rounded-full transition-colors cursor-pointer"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3 divide-y divide-gray-100">
                {(selectedOrder.items || []).map((it, idx) => (
                  <div key={idx} className="pt-3 first:pt-0 flex items-center gap-3.5 sm:gap-4">
                    <img
                      src={it.product_image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=400&q=80'}
                      alt={it.product_title}
                      className="w-16 h-16 sm:w-18 sm:h-18 object-contain rounded-2xl bg-stone-50 border border-gray-100 p-1 shrink-0"
                    />

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <h3 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-1">
                        {it.product_title}
                      </h3>
                      <p className="text-[11px] text-gray-400 font-mono">
                        SKU: {it.sku || `TKS-${selectedOrder.id?.slice(0, 4) || '4409'}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {it.quantity}
                      </p>
                    </div>

                    <div className="font-black text-gray-900 text-base sm:text-lg shrink-0">
                      {formatINR(it.unit_price || it.total_price || 0)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Amount Green Pill Card */}
              <div className="p-4 bg-[#EDF7F2] border border-[#D5EFE1] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0A5C36] shadow-2xs">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-600 font-bold block">
                      Total Amount
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-[#0A5C36]">
                      {formatINR(selectedOrder.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 BENEFIT FEATURES: Wide Range, Fast Delivery, Secure Payments, 24/7 Support */}
            <div className="grid grid-cols-4 gap-2 pt-1 text-center">
              <div className="flex flex-col items-center space-y-1.5 p-2">
                <div className="w-11 h-11 rounded-full bg-[#EBF7F0] flex items-center justify-center text-[#0A5C36]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-gray-700 leading-tight">
                  Wide Range of Products
                </span>
              </div>

              <div className="flex flex-col items-center space-y-1.5 p-2">
                <div className="w-11 h-11 rounded-full bg-[#EBF7F0] flex items-center justify-center text-[#0A5C36]">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-gray-700 leading-tight">
                  Fast &amp; Reliable Delivery
                </span>
              </div>

              <div className="flex flex-col items-center space-y-1.5 p-2">
                <div className="w-11 h-11 rounded-full bg-[#EBF7F0] flex items-center justify-center text-[#0A5C36]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-gray-700 leading-tight">
                  Secure Payments
                </span>
              </div>

              <div className="flex flex-col items-center space-y-1.5 p-2">
                <div className="w-11 h-11 rounded-full bg-[#EBF7F0] flex items-center justify-center text-[#0A5C36]">
                  <Headphones className="w-5 h-5" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-gray-700 leading-tight">
                  24/7 Support
                </span>
              </div>
            </div>

            {/* DARK GREEN TRACK YOUR ORDER ACTION BUTTON */}
            <button
              type="button"
              onClick={() => {
                setViewMode('tracking');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full py-4 px-6 bg-[#0B4628] hover:bg-[#07351D] text-white rounded-full font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Truck className="w-5 h-5" />
              <span>Track Your Order &rarr;</span>
            </button>

          </div>
        )}

        {/* =================================================================== */}
        {/* VIEW 3: LIVE DELIVERY TRACKING (Screenshot 2: Stepper, Map & DM)  */}
        {/* =================================================================== */}
        {viewMode === 'tracking' && selectedOrder && (
          <div className="space-y-5 animate-in fade-in duration-200">
            
            {/* Top Header Bar: ← Live Delivery Tracking + Order Confirmed Pill */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setViewMode('details')}
                  className="p-2 bg-white hover:bg-stone-50 text-gray-700 rounded-xl border border-gray-200/90 transition-colors shadow-2xs cursor-pointer"
                  title="Back to Order Details"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#0A5C36]" />
                  <h1 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                    Live Delivery Tracking
                  </h1>
                </div>
              </div>

              <span className="px-3.5 py-1 bg-[#E2F3E9] text-[#0A5C36] font-extrabold text-xs rounded-full border border-[#C6E7D2]">
                {getStatusBadge(selectedOrder.fulfilment_status).label}
              </span>
            </div>

            {/* 5-STEP HORIZONTAL TRACKER CARD: Exact match to Screenshot 2 */}
            <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
              <div className="relative flex items-center justify-between">
                
                {/* Dotted connecting line */}
                <div className="absolute left-[8%] right-[8%] top-5 border-t-2 border-dotted border-gray-300 -z-0" />

                {[
                  { step: 1, label: 'Order Confirmed', time: formatCustomDate(selectedOrder.created_at) },
                  { step: 2, label: 'Supplier Packed', time: null },
                  { step: 3, label: 'Shipped', time: null },
                  { step: 4, label: 'Out for Delivery', time: null },
                  { step: 5, label: 'Delivered', time: null },
                ].map(({ step, label, time }) => {
                  const status = getStepStatus(selectedOrder.fulfilment_status, step);
                  return (
                    <div key={step} className="flex flex-col items-center relative z-10 w-1/5 text-center px-0.5">
                      {/* Step Circle */}
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all shadow-2xs ${
                          status === 'completed'
                            ? 'bg-[#0A5C36] text-white ring-4 ring-emerald-50'
                            : status === 'current'
                            ? 'bg-[#F59E0B] text-white ring-4 ring-amber-100 font-extrabold'
                            : 'bg-[#F3F4F6] text-gray-400 border border-gray-200'
                        }`}
                      >
                        {status === 'completed' ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          step
                        )}
                      </div>

                      {/* Step Label */}
                      <span className={`text-[10px] sm:text-xs font-bold leading-tight ${
                        status === 'upcoming' ? 'text-gray-400' : 'text-gray-900'
                      }`}>
                        {label}
                      </span>

                      {/* Timestamp under first step */}
                      {time && step === 1 && (
                        <span className="text-[8px] sm:text-[9px] text-gray-400 mt-1 block leading-tight">
                          {time}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CURRENT STATUS CARD: Packaging & Courier Dispatch Underway */}
            <div className="bg-[#FAF6F0] rounded-3xl p-5 border border-[#F0E9DF] relative overflow-hidden space-y-2">
              
              {/* Artwork on right side */}
              <div className="absolute right-0 top-0 bottom-0 w-[28%] pointer-events-none flex items-center justify-end">
                <img
                  src="/mockup/tracking-status-dispatch.png"
                  alt="Packaging Dispatch"
                  className="h-full object-contain object-right opacity-80 select-none"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              <div className="relative z-10 max-w-[78%] space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#F3E8D7] flex items-center justify-center text-[#92400E] shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <span className="px-2.5 py-0.5 bg-[#F9ECC9] text-[#92400E] text-[10px] font-black uppercase tracking-wider rounded-full">
                    Current Status
                  </span>
                </div>

                <h3 className="font-black text-gray-900 text-sm sm:text-base leading-snug">
                  {selectedOrder.tracking_number 
                    ? `In Transit via ${selectedOrder.tracking_carrier || 'Delhivery Express'}` 
                    : 'Packaging & Courier Dispatch Underway'}
                </h3>

                <p className="text-xs text-gray-600 leading-relaxed">
                  {selectedOrder.tracking_number ? (
                    <span>
                      Waybill / AWB: <strong className="font-mono text-gray-900">{selectedOrder.tracking_number}</strong>
                    </span>
                  ) : (
                    'Your AWB waybill number and direct courier tracking link will be updated here as soon as our fulfillment team hands over the package to the courier.'
                  )}
                </p>

                {selectedOrder.tracking_number && getCourierTrackingUrl(selectedOrder.tracking_carrier, selectedOrder.tracking_number) && (
                  <div className="pt-1">
                    <a
                      href={getCourierTrackingUrl(selectedOrder.tracking_carrier, selectedOrder.tracking_number)!}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0A5C36] text-white text-xs font-bold rounded-xl shadow-2xs hover:bg-[#064024] transition-colors"
                    >
                      <span>Track on Courier Site</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* SHIPPING DESTINATION CARD: Forest Green Header + Route Map */}
            <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs overflow-hidden">
              {/* Header */}
              <div className="bg-[#0B4628] text-white px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-300" />
                  <h3 className="font-extrabold text-sm sm:text-base text-white">
                    Shipping Destination
                  </h3>
                </div>

                <span className="px-3 py-0.5 bg-white/20 text-white text-[11px] font-bold rounded-full border border-white/25">
                  Doorstep Delivery
                </span>
              </div>

              {/* Body with Map route illustration */}
              <div className="p-5 relative flex items-center justify-between">
                <div className="space-y-2 text-xs text-gray-700 relative z-10 max-w-[65%]">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="font-black text-gray-900 text-sm uppercase">
                      {selectedOrder.customer_name || 'Customer'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>Phone: <strong>{selectedOrder.customer_phone || '8330816823'}</strong></span>
                  </div>

                  <div className="flex items-start gap-2 pt-0.5">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-600 font-medium">{selectedOrder.shipping_address?.addressLine1 || 'Doorstep Delivery'}</p>
                      {selectedOrder.shipping_address?.addressLine2 && (
                        <p className="text-gray-600">{selectedOrder.shipping_address.addressLine2}</p>
                      )}
                      <p className="text-gray-900 font-bold">
                        {selectedOrder.shipping_address?.city || 'Fuj'}, {selectedOrder.shipping_address?.state || 'Kerala'} - {selectedOrder.shipping_address?.pincode || '657336'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Route Map Visual */}
                <div className="absolute right-3 top-2 bottom-2 w-[34%] pointer-events-none flex items-center justify-end">
                  <img
                    src="/mockup/tracking-map-route.png"
                    alt="Delivery Route Map"
                    className="h-full object-contain object-right opacity-90 select-none"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </div>

            {/* INSTAGRAM DM ASSISTANCE CARD: Exact match to Screenshot 2 */}
            <a
              href="https://instagram.com/thekeralastore_"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-pink-50/80 via-purple-50/80 to-indigo-50/80 border border-pink-200/80 rounded-3xl p-4 flex items-center justify-between gap-3 shadow-2xs hover:border-pink-300 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Instagram className="w-5 h-5" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <h4 className="font-extrabold text-gray-900 text-xs sm:text-sm">
                    Need assistance with this order?
                  </h4>
                  <p className="text-[11px] text-gray-600 leading-snug truncate">
                    DM us on Instagram <strong className="text-pink-600">@thekeralastore_</strong> with Order ID <strong className="font-mono text-gray-900">{selectedOrder.order_number}</strong>.
                  </p>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-pink-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </a>

            {/* 24/7 SUPPORT CARD: WhatsApp Contact Support */}
            <div className="bg-[#FAF4E8] border border-[#EFE3CF] rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-3 relative overflow-hidden shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EADCC7] flex items-center justify-center text-gray-800 shrink-0">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 text-xs sm:text-sm">
                    We're Here for You
                  </h4>
                  <p className="text-[11px] text-gray-500 font-medium">
                    24/7 Customer Support
                  </p>
                </div>
              </div>

              <a
                href={`https://wa.me/918330816823?text=${encodeURIComponent(`Hello The Kerala Store, I need assistance with Order #${selectedOrder.order_number}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white text-[#0A5C36] border-2 border-[#0A5C36] hover:bg-[#0A5C36] hover:text-white rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-2xs transition-all shrink-0"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Contact Support &gt;</span>
              </a>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
