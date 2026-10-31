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
  Calendar,
  Layers,
  ArrowRight
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
  const [isDetailsView, setIsDetailsView] = useState(false);
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
            setIsDetailsView(true);
          }
          setIsLoading(false);
        }
      });
    } else if (recentOrder) {
      setOrders([recentOrder]);
      setSelectedOrder(recentOrder);
      setIsDetailsView(true);
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
      setIsDetailsView(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const found = await StoreService.getOrderByNumber(query);
    if (found) {
      setSelectedOrder(found);
      setIsDetailsView(true);
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
    setIsDetailsView(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setIsDetailsView(false);
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
          pillColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          dotColor: 'bg-emerald-600',
          title: 'Delivered Successfully',
          description: 'Package delivered safely to your doorstep.'
        };
      case 'out_for_delivery':
        return {
          label: 'Out for Delivery',
          pillColor: 'bg-blue-50 text-blue-800 border-blue-300',
          dotColor: 'bg-blue-600 animate-pulse',
          title: 'Out for Delivery Today',
          description: 'Our delivery partner is out to deliver your package today.'
        };
      case 'shipped':
        return {
          label: 'Shipped',
          pillColor: 'bg-indigo-50 text-indigo-800 border-indigo-300',
          dotColor: 'bg-indigo-600',
          title: 'Shipped & In Transit',
          description: 'Package dispatched from Kerala fulfillment hub and in transit.'
        };
      case 'supplier_ordered':
        return {
          label: 'Supplier Packed',
          pillColor: 'bg-purple-50 text-purple-800 border-purple-300',
          dotColor: 'bg-purple-600',
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
    <div className="min-h-screen bg-[#FBFBFA] py-6 sm:py-10 lg:py-14">
      {/* Container: Responsive width that expands gracefully on PC (max-w-6xl) while staying sleek on mobile */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* =================================================================== */}
        {/* VIEW 1: ORDERS LIST (Track My Orders Hero & Orders Listing)         */}
        {/* =================================================================== */}
        {!isDetailsView ? (
          <div className="space-y-6 sm:space-y-8">

            {/* Top Search Bar */}
            <form onSubmit={handleSearchOrder} className="max-w-3xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for products, brands, or enter Order ID (e.g. TKS-2026-...)"
                  value={searchOrderNumber}
                  onChange={(e) => setSearchOrderNumber(e.target.value)}
                  className="w-full pl-12 pr-28 py-3.5 sm:py-4 bg-white text-gray-900 border border-gray-200/90 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0A5C36]/30 shadow-2xs placeholder:text-gray-400 transition-all"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 sm:px-5 py-2 bg-[#0A5C36] hover:bg-[#064024] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Expansive Hero Banner Card: Deep Forest Green (#0B4628) with Crisp White Design & Seamless Foliage Blend */}
            <div className="relative rounded-3xl overflow-hidden shadow-sm border-2 border-[#064024] bg-[#0B4628] text-white min-h-[220px] sm:min-h-[260px] lg:min-h-[280px] flex items-center">
              
              {/* Seamless Right-Aligned Foliage & Clean Unprinted Parcel Package (100% Text-Free Image) */}
              <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[65%] lg:w-[55%] pointer-events-none overflow-hidden flex items-center justify-end">
                <img
                  src="/mockup/kerala-parcel-green-clean.jpg"
                  alt="The Kerala Store Order Delivery"
                  className="w-full h-full object-cover object-right select-none"
                />
                {/* Horizontal Gradient Mask: Seamlessly dissolves image into the solid green background on PC with zero hard cuts */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B4628] via-[#0B4628]/70 sm:via-[#0B4628]/35 to-transparent pointer-events-none" />
                {/* Vertical Edge Softening */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B4628]/50 via-transparent to-[#0B4628]/40 pointer-events-none" />
              </div>

              {/* Left-Side Solid Gradient Backdrop to guarantee 100% crisp white text readability on all screen sizes */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B4628] via-[#0B4628]/95 sm:via-[#0B4628]/85 to-transparent/10 z-0 pointer-events-none" />

              {/* Text Content in Crisp White Design */}
              <div className="relative z-10 p-6 sm:p-8 lg:p-12 max-w-xl sm:max-w-2xl space-y-3 sm:space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/15 backdrop-blur-md text-emerald-100 text-[11px] sm:text-xs font-black uppercase tracking-wider rounded-full border border-white/20 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                  The Kerala Store
                </span>
                
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  Track My Orders
                </h1>
                
                <p className="text-xs sm:text-base text-emerald-100/90 font-medium max-w-lg leading-relaxed">
                  View the real-time status of your orders, courier dispatch details, and doorstep delivery updates across India.
                </p>
              </div>
            </div>

            {/* Empty State when no orders exist */}
            {displayOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-gray-200/90 shadow-2xs max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-gray-400 mx-auto">
                  <Package className="w-8 h-8" />
                </div>
                {user ? (
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">No Orders Found</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      You haven't placed any orders with The Kerala Store yet. Explore our fresh arrivals!
                    </p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">Sign In to View Your Orders</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Sign in with your Google account to track your orders, or enter your Order ID in the search box above.
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
                  {!user && (
                    <button
                      onClick={openAuthModal}
                      className="px-6 py-2.5 rounded-full bg-[#0A5C36] text-white font-bold text-xs sm:text-sm shadow-sm hover:bg-[#064024] cursor-pointer"
                    >
                      Sign In with Google
                    </button>
                  )}
                  <button
                    onClick={() => onNavigate('shop')}
                    className={`px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm cursor-pointer ${
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
              /* ORDERS LIST: Expansive on PC, Clean on Mobile */
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">
                    Your Orders ({displayOrders.length})
                  </h2>
                  <span className="text-xs font-semibold text-gray-500 hidden sm:inline">
                    Click any order to view full tracking and doorstep delivery status
                  </span>
                </div>

                <div className="space-y-4">
                  {displayOrders.map((ord) => {
                    const badge = getStatusBadge(ord.fulfilment_status);
                    const firstItem = ord.items?.[0];
                    const totalItemsCount = ord.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 1;

                    return (
                      <div
                        key={ord.id}
                        onClick={() => handleOpenOrderDetails(ord)}
                        className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs hover:shadow-md hover:border-[#0A5C36]/50 transition-all cursor-pointer p-4 sm:p-6 lg:p-7 space-y-4 group"
                      >
                        {/* Top Row: Thumbnail, Product Info, Price, Chevron */}
                        <div className="flex items-start gap-4 sm:gap-6">
                          {/* Large Responsive Thumbnail */}
                          <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-2xl bg-[#F5F5F3] border border-gray-100 p-1 shrink-0 overflow-hidden group-hover:scale-102 transition-transform">
                            <img
                              src={firstItem?.product_image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=400&q=80'}
                              alt={firstItem?.product_title || 'The Kerala Store Product'}
                              className="w-full h-full object-contain"
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="font-extrabold text-gray-900 text-base sm:text-lg lg:text-xl leading-snug group-hover:text-[#0A5C36] transition-colors line-clamp-2">
                                  {firstItem?.product_title || 'Curated Product'}
                                  {(ord.items?.length || 0) > 1 && (
                                    <span className="text-xs sm:text-sm font-semibold text-gray-500 ml-2">
                                      +{ord.items!.length - 1} more item{(ord.items!.length - 1) > 1 ? 's' : ''}
                                    </span>
                                  )}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                                  Quantity: <strong className="text-gray-800">{totalItemsCount}</strong>
                                </p>
                              </div>

                              <div className="text-right shrink-0 flex items-center gap-2">
                                <span className="font-black text-gray-900 text-lg sm:text-xl lg:text-2xl">
                                  {formatINR(ord.total_amount)}
                                </span>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#0A5C36] group-hover:translate-x-1 transition-all" />
                              </div>
                            </div>

                            {/* Badges Row: Order ID pill and Status pill without text cropping */}
                            <div className="flex items-center gap-2.5 flex-wrap pt-1">
                              {/* Order ID Pill with Copy button */}
                              <button
                                type="button"
                                onClick={(e) => handleCopyOrderId(ord.order_number, e)}
                                title="Click to copy Order ID"
                                className="inline-flex items-center gap-1.5 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-gray-800 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-mono font-semibold border border-gray-200/90 transition-colors"
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
                              <span className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-full border ${badge.pillColor}`}>
                                <span className={`w-2 h-2 rounded-full ${badge.dotColor}`} />
                                <span>{badge.label}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status Update Box: Inside Card */}
                        <div className="bg-[#FAF6F0] rounded-2xl p-4 sm:p-5 border border-[#F0E9DF] flex items-start gap-3.5 sm:gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#F3E8D7] flex items-center justify-center text-[#92400E] shrink-0 mt-0.5">
                            <Package className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <h4 className="font-extrabold text-gray-900 text-xs sm:text-sm lg:text-base">
                              {badge.title}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 leading-snug">
                              {badge.description}
                            </p>
                            <p className="text-[11px] sm:text-xs text-gray-400 pt-0.5">
                              {formatCustomDate(ord.created_at)}
                            </p>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Direct Instagram Delivery Support Banner */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 border border-pink-200/70 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm shadow-2xs">
              <div className="flex items-center gap-3.5 text-gray-700">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm sm:text-base">Need Delivery Assistance?</p>
                  <p className="text-xs sm:text-sm text-gray-500">DM our Kerala team on Instagram <strong>@thekeralastore_</strong></p>
                </div>
              </div>
              <a
                href="https://instagram.com/thekeralastore_"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white rounded-xl text-xs sm:text-sm font-bold shrink-0 shadow-2xs hover:opacity-95 transition-opacity"
              >
                DM @thekeralastore_
              </a>
            </div>

          </div>
        ) : (
          /* =================================================================== */
          /* VIEW 2: UNIFIED ORDER DETAILS & LIVE TRACKING (ALL IN ONE WINDOW)   */
          /* =================================================================== */
          selectedOrder && (
            <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
              
              {/* Back to Orders Navigation Bar */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBackToList}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-stone-50 text-gray-800 border border-gray-200/90 rounded-2xl text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-2xs"
                >
                  <ArrowLeft className="w-4 h-4 text-gray-600" />
                  <span>Back to All Orders</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-mono font-bold text-gray-700 bg-gray-100 px-3.5 py-1.5 rounded-xl border border-gray-200">
                    {selectedOrder.order_number}
                  </span>
                </div>
              </div>

              {/* TOP HERO CONFIRMATION BANNER: Deep Forest Green (#0B4628) with Seamless Foliage & Clean Parcel */}
              <div className="relative rounded-3xl overflow-hidden shadow-md border-2 border-[#064024] bg-[#0B4628] text-white min-h-[260px] sm:min-h-[300px] lg:min-h-[320px] flex flex-col justify-between p-6 sm:p-8 lg:p-12">
                
                {/* Seamless Right-Aligned Foliage & Clean Unprinted Parcel Package (100% Text-Free Image) */}
                <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[65%] lg:w-[55%] pointer-events-none overflow-hidden flex items-center justify-end">
                  <img
                    src="/mockup/kerala-parcel-green-clean.jpg"
                    alt="Order Confirmed - The Kerala Store"
                    className="w-full h-full object-cover object-right select-none"
                  />
                  {/* Seamless blending mask with zero cutting on PC */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0B4628] via-[#0B4628]/70 sm:via-[#0B4628]/35 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B4628]/50 via-transparent to-[#0B4628]/40 pointer-events-none" />
                </div>

                {/* Left Gradient Overlay for Maximum Text Contrast */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B4628] via-[#0B4628]/95 sm:via-[#0B4628]/85 to-transparent/20 z-0 pointer-events-none" />

                {/* Content */}
                <div className="relative z-10 max-w-2xl lg:max-w-3xl space-y-3 sm:space-y-4">
                  {/* Status Pill */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#125835]/90 backdrop-blur-sm text-emerald-200 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-500/30 shadow-2xs">
                    <span className="w-4 h-4 rounded-full bg-[#85E3B3] flex items-center justify-center text-[#0B4628]">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                    <span>Order Confirmed</span>
                  </div>

                  {/* Customer Headline: responsive typography without text clipping */}
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                    Thank You, <br className="sm:hidden" />
                    <span className="uppercase text-emerald-300">{selectedOrder.customer_name || 'Valued Customer'}!</span>
                  </h1>

                  <p className="text-xs sm:text-base text-emerald-100/90 max-w-2xl leading-relaxed">
                    Your order has been placed successfully and is being prepared with utmost care. You can track its live progress below.
                  </p>
                </div>

                {/* Frosted Badges: ORDER ID, PAYMENT METHOD, ORDER PLACED */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-6">
                  {/* Order ID Card */}
                  <div 
                    onClick={() => handleCopyOrderId(selectedOrder.order_number)}
                    className="bg-black/35 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-white/20 flex items-center gap-3 cursor-pointer hover:bg-black/45 transition-colors shadow-2xs"
                    title="Click to copy Order ID"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/15 flex items-center justify-center text-emerald-200 shrink-0">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-emerald-200 block">
                        Order ID (Click to Copy)
                      </span>
                      <span className="text-xs sm:text-sm lg:text-base font-black text-white font-mono break-all block">
                        {selectedOrder.order_number}
                      </span>
                    </div>
                    {copiedOrderId === selectedOrder.order_number ? (
                      <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md">Copied!</span>
                    ) : (
                      <Copy className="w-4 h-4 text-emerald-300/70" />
                    )}
                  </div>

                  {/* Payment Method Card */}
                  <div className="bg-black/35 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-white/20 flex items-center gap-3 shadow-2xs">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/15 flex items-center justify-center text-emerald-200 shrink-0">
                      <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-emerald-200 block">
                        Payment Method
                      </span>
                      <span className="text-xs sm:text-sm lg:text-base font-black text-white truncate block">
                        {selectedOrder.payment_method === 'razorpay' ? 'Paid via Razorpay' : 'Cash on Delivery'}
                      </span>
                    </div>
                  </div>

                  {/* Placed Timestamp Card */}
                  <div className="bg-black/35 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-white/20 flex items-center gap-3 shadow-2xs sm:col-span-2 lg:col-span-1">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/15 flex items-center justify-center text-emerald-200 shrink-0">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-emerald-200 block">
                        Order Placed
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-white block">
                        {formatCustomDate(selectedOrder.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* MAIN CONTENT GRID: 2 Columns on PC (lg:grid-cols-12), 1 Column on Mobile */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                
                {/* ========================================================= */}
                {/* LEFT COLUMN (lg:col-span-7): Live Tracking, Stepper & Items */}
                {/* ========================================================= */}
                <div className="lg:col-span-7 space-y-6">

                  {/* 1. LIVE DELIVERY TRACKING STEPPER CARD */}
                  <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs p-5 sm:p-7 space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-[#0A5C36]">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <h2 className="text-base sm:text-lg font-black text-gray-900">
                            Live Delivery Tracking
                          </h2>
                          <p className="text-xs text-gray-500 font-medium">
                            Real-time order fulfillment &amp; courier milestone updates
                          </p>
                        </div>
                      </div>

                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusBadge(selectedOrder.fulfilment_status).pillColor}`}>
                        {getStatusBadge(selectedOrder.fulfilment_status).label}
                      </span>
                    </div>

                    {/* 5-Step Horizontal Progress Stepper */}
                    <div className="relative pt-2 pb-1">
                      {/* Dotted connecting line behind the steps */}
                      <div className="absolute left-[8%] right-[8%] top-6 sm:top-7 border-t-2 border-dotted border-gray-300 -z-0" />

                      <div className="flex items-start justify-between relative z-10">
                        {[
                          { step: 1, label: 'Order Confirmed', time: formatCustomDate(selectedOrder.created_at) },
                          { step: 2, label: 'Supplier Packed', time: null },
                          { step: 3, label: 'Shipped', time: null },
                          { step: 4, label: 'Out for Delivery', time: null },
                          { step: 5, label: 'Delivered', time: null },
                        ].map(({ step, label, time }) => {
                          const status = getStepStatus(selectedOrder.fulfilment_status, step);
                          return (
                            <div key={step} className="flex flex-col items-center text-center w-1/5 px-0.5">
                              {/* Circle icon */}
                              <div
                                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm mb-2 transition-all shadow-2xs ${
                                  status === 'completed'
                                    ? 'bg-[#0A5C36] text-white ring-4 ring-emerald-50'
                                    : status === 'current'
                                    ? 'bg-[#F59E0B] text-white ring-4 ring-amber-100 font-extrabold'
                                    : 'bg-[#F3F4F6] text-gray-400 border border-gray-200'
                                }`}
                              >
                                {status === 'completed' ? (
                                  <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                                ) : (
                                  step
                                )}
                              </div>

                              {/* Label */}
                              <span className={`text-[10px] sm:text-xs font-bold leading-tight ${
                                status === 'upcoming' ? 'text-gray-400' : 'text-gray-900'
                              }`}>
                                {label}
                              </span>

                              {time && step === 1 && (
                                <span className="text-[8px] sm:text-[10px] text-gray-400 mt-1 block leading-tight">
                                  {time}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* CURRENT STATUS UPDATE CARD */}
                    <div className="bg-[#FAF6F0] rounded-2xl p-4 sm:p-5 border border-[#F0E9DF] flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#F3E8D7] flex items-center justify-center text-[#92400E] shrink-0 mt-0.5">
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <span className="px-2.5 py-0.5 bg-[#F9ECC9] text-[#92400E] text-[10px] font-black uppercase tracking-wider rounded-full inline-block">
                          Current Fulfillment Status
                        </span>
                        <h3 className="font-black text-gray-900 text-sm sm:text-base leading-snug">
                          {selectedOrder.tracking_number 
                            ? `In Transit with ${selectedOrder.tracking_carrier || 'Delhivery Express'}` 
                            : 'Packaging & Courier Dispatch Underway'}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                          {selectedOrder.tracking_number ? (
                            <span>
                              Waybill / AWB Number: <strong className="font-mono text-gray-900">{selectedOrder.tracking_number}</strong>
                            </span>
                          ) : (
                            'Your AWB waybill number and direct courier tracking link will be updated here as soon as our fulfillment team hands over the package to the courier.'
                          )}
                        </p>

                        {/* Direct Courier Website Tracking Link */}
                        {selectedOrder.tracking_number && getCourierTrackingUrl(selectedOrder.tracking_carrier, selectedOrder.tracking_number) && (
                          <div className="pt-2">
                            <a
                              href={getCourierTrackingUrl(selectedOrder.tracking_carrier, selectedOrder.tracking_number)!}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0A5C36] text-white text-xs font-bold rounded-xl shadow-2xs hover:bg-[#064024] transition-colors"
                            >
                              <span>Track Directly on Courier Site</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* 2. ORDERED PRODUCTS CARD */}
                  <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs p-5 sm:p-7 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Layers className="w-5 h-5 text-[#0A5C36]" />
                        <h2 className="text-base sm:text-lg font-black text-gray-900">
                          Ordered Products ({(selectedOrder.items || []).length})
                        </h2>
                      </div>
                      <span className="text-xs font-bold text-gray-500">
                        Total {selectedOrder.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 1} Item(s)
                      </span>
                    </div>

                    <div className="divide-y divide-gray-100 space-y-3">
                      {(selectedOrder.items || []).map((it, idx) => (
                        <div key={idx} className="pt-3 first:pt-0 flex items-center gap-4 sm:gap-5">
                          <img
                            src={it.product_image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=400&q=80'}
                            alt={it.product_title}
                            className="w-18 h-18 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain rounded-2xl bg-stone-50 border border-gray-100 p-1 shrink-0"
                          />

                          <div className="flex-1 min-w-0 space-y-1">
                            <h3 className="font-extrabold text-gray-900 text-xs sm:text-sm lg:text-base leading-snug line-clamp-2">
                              {it.product_title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                              <span>Qty: <strong className="text-gray-800">{it.quantity}</strong></span>
                              <span>•</span>
                              <span className="font-mono text-[11px] text-gray-400">
                                SKU: {it.sku || `TKS-${selectedOrder.id?.slice(0, 4) || '4409'}`}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-black text-gray-900 text-base sm:text-lg lg:text-xl">
                              {formatINR(it.total_price || (it.unit_price * it.quantity))}
                            </span>
                            {it.quantity > 1 && (
                              <p className="text-[10px] text-gray-400">
                                {formatINR(it.unit_price)} each
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* ========================================================= */}
                {/* RIGHT COLUMN (lg:col-span-5): Summary, Destination & Help */}
                {/* ========================================================= */}
                <div className="lg:col-span-5 space-y-6">

                  {/* 1. ORDER SUMMARY & TOTAL CARD */}
                  <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
                    <h3 className="font-black text-gray-900 text-sm sm:text-base">
                      Order Payment Summary
                    </h3>

                    <div className="space-y-2 text-xs sm:text-sm text-gray-600 border-b border-gray-100 pb-3">
                      <div className="flex justify-between">
                        <span>Items Subtotal</span>
                        <span className="font-bold text-gray-900">{formatINR(selectedOrder.total_amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Doorstep Delivery</span>
                        <span className="font-bold text-emerald-700">FREE</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Status</span>
                        <span className="font-bold text-gray-800">
                          {selectedOrder.payment_status === 'completed' || selectedOrder.payment_method === 'razorpay' 
                            ? 'Paid Online' 
                            : 'Cash on Delivery (Pending)'}
                        </span>
                      </div>
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

                  {/* 2. SHIPPING DESTINATION CARD */}
                  <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs overflow-hidden">
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

                    <div className="p-5 space-y-2.5 text-xs sm:text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#0A5C36] shrink-0" />
                        <span className="font-black text-gray-900 uppercase">
                          {selectedOrder.customer_name || 'Customer'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#0A5C36] shrink-0" />
                        <span>Phone: <strong>{selectedOrder.customer_phone || '8330816823'}</strong></span>
                      </div>

                      <div className="flex items-start gap-2 pt-1 border-t border-gray-100">
                        <MapPin className="w-4 h-4 text-[#0A5C36] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-gray-800 font-medium">
                            {selectedOrder.shipping_address?.addressLine1 || 'Doorstep Delivery Address'}
                          </p>
                          {selectedOrder.shipping_address?.addressLine2 && (
                            <p className="text-gray-600">{selectedOrder.shipping_address.addressLine2}</p>
                          )}
                          <p className="text-gray-900 font-bold pt-0.5">
                            {selectedOrder.shipping_address?.city || 'Fuj'}, {selectedOrder.shipping_address?.state || 'Kerala'} - {selectedOrder.shipping_address?.pincode || '657336'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. INSTAGRAM DM SUPPORT CARD */}
                  <a
                    href="https://instagram.com/thekeralastore_"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-pink-50/80 via-purple-50/80 to-indigo-50/80 border border-pink-200/80 rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-3 shadow-2xs hover:border-pink-300 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                        <Instagram className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <h4 className="font-extrabold text-gray-900 text-xs sm:text-sm">
                          Need assistance with this order?
                        </h4>
                        <p className="text-[11px] sm:text-xs text-gray-600 leading-snug">
                          DM us on Instagram <strong className="text-pink-600">@thekeralastore_</strong> with Order ID <strong className="font-mono text-gray-900">{selectedOrder.order_number}</strong>.
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-pink-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </a>

                  {/* 4. 24/7 WHATSAPP CUSTOMER CARE CARD */}
                  <div className="bg-[#FAF4E8] border border-[#EFE3CF] rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#EADCC7] flex items-center justify-center text-gray-800 shrink-0">
                        <Headphones className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 text-xs sm:text-sm">
                          We're Here for You
                        </h4>
                        <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
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

                  {/* 5. 4 BENEFIT BADGES */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 pt-1 text-center">
                    <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3 flex flex-col items-center space-y-1">
                      <div className="w-9 h-9 rounded-full bg-[#EBF7F0] flex items-center justify-center text-[#0A5C36]">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-bold text-gray-800">Wide Range</span>
                    </div>

                    <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3 flex flex-col items-center space-y-1">
                      <div className="w-9 h-9 rounded-full bg-[#EBF7F0] flex items-center justify-center text-[#0A5C36]">
                        <Truck className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-bold text-gray-800">Fast Delivery</span>
                    </div>

                    <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3 flex flex-col items-center space-y-1">
                      <div className="w-9 h-9 rounded-full bg-[#EBF7F0] flex items-center justify-center text-[#0A5C36]">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-bold text-gray-800">Secure Payments</span>
                    </div>

                    <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3 flex flex-col items-center space-y-1">
                      <div className="w-9 h-9 rounded-full bg-[#EBF7F0] flex items-center justify-center text-[#0A5C36]">
                        <Headphones className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-bold text-gray-800">24/7 Support</span>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )
        )}

      </div>
    </div>
  );
};
