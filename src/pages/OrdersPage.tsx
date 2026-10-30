import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { StoreService } from '../services/storeService';
import { useAuth } from '../context/AuthContext';
import { formatINR, formatDateTime, getCourierTrackingUrl } from '../lib/utils';
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
  ArrowRight,
  ShieldCheck,
  UserCheck
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
      return;
    }

    const found = await StoreService.getOrderByNumber(query);
    if (found) {
      setSelectedOrder(found);
      setIsDetailsView(true);
      if (!orders.some((o) => o.id === found.id)) {
        setOrders((prev) => [found, ...prev]);
      }
    } else {
      alert(`No order found matching "${query}". Please check your order ID (e.g. TKS-2026-...) or phone number.`);
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
          color: 'text-emerald-800 bg-emerald-100/90 border-emerald-200',
          dot: 'bg-emerald-600',
          description: 'Delivered safely to doorstep'
        };
      case 'out_for_delivery':
        return {
          label: 'Out for Delivery',
          color: 'text-blue-800 bg-blue-100/90 border-blue-200',
          dot: 'bg-blue-600 animate-pulse',
          description: 'Package arriving today with delivery agent'
        };
      case 'shipped':
        return {
          label: 'Shipped & In Transit',
          color: 'text-indigo-800 bg-indigo-100/90 border-indigo-200',
          dot: 'bg-indigo-600 animate-pulse',
          description: 'On the way via courier dispatch'
        };
      case 'supplier_ordered':
        return {
          label: 'Packed by Supplier',
          color: 'text-purple-800 bg-purple-100/90 border-purple-200',
          dot: 'bg-purple-600',
          description: 'Quality checked & packed in secure packaging'
        };
      case 'pending':
      default:
        return {
          label: 'Order Confirmed',
          color: 'text-amber-800 bg-amber-100/90 border-amber-200',
          dot: 'bg-amber-600',
          description: 'Order confirmed, processing for fulfillment'
        };
    }
  };

  // If user searched or has orders to display
  const displayOrders = orders;

  return (
    <div className="min-h-screen bg-[#FBFBFA] py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* ========================================================== */}
        {/* VIEW 1: FRONT PAGE - ONLY PRODUCT & CURRENT DELIVERY UPDATE */}
        {/* ========================================================== */}
        {!isDetailsView ? (
          <div className="space-y-6">
            
            {/* Header Green Banner with White Texts */}
            <div className="bg-[#0A5C36] text-white rounded-3xl p-6 sm:p-8 text-center shadow-sm border-2 border-[#064024] space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-100 bg-white/15 px-3.5 py-1 rounded-full border border-white/20 inline-block">
                The Kerala Store
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Track My Orders
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-md mx-auto">
                Select your ordered product to view live tracking, courier dispatch, and delivery updates
              </p>

              {/* Order Search */}
              <form onSubmit={handleSearchOrder} className="mt-4 flex gap-2 max-w-md mx-auto">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Enter Order ID (e.g. TKS-2026-...) or Mobile"
                    value={searchOrderNumber}
                    onChange={(e) => setSearchOrderNumber(e.target.value.toUpperCase())}
                    className="w-full pl-9 pr-3 py-2.5 bg-white text-gray-900 border border-transparent rounded-xl text-xs uppercase font-semibold focus:outline-none focus:ring-2 focus:ring-white shadow-2xs placeholder:text-gray-400 placeholder:normal-case"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#064024] hover:bg-black text-white rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer border border-emerald-800"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Empty state if no orders exist */}
            {displayOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-gray-200 shadow-2xs max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-gray-400 mx-auto">
                  <Package className="w-8 h-8" />
                </div>
                {user ? (
                  <div>
                    <h3 className="text-base font-bold text-gray-900">No Orders Yet</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      You haven't placed any orders with The Kerala Store yet. Start exploring our curated Kerala collection!
                    </p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Sign In to View Your Orders</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Sign in with your Google account to automatically track your deliveries and order history, or enter your Order ID above.
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
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
                    Explore Products
                  </button>
                </div>
              </div>
            ) : (
              /* FLIPKART STYLE FRONT PAGE: ONLY PRODUCT & CURRENT DELIVERY UPDATE */
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-500 px-1 font-semibold">
                  <span>Your Ordered Products ({displayOrders.length})</span>
                  <span>Press item to view full order details</span>
                </div>

                {displayOrders.map((ord) => {
                  const badge = getStatusBadge(ord.fulfilment_status);
                  // Render each product ordered inside this order as a clean Flipkart-style row
                  return (
                    <div key={ord.id} className="space-y-2">
                      {(ord.items || []).map((it, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleOpenOrderDetails(ord)}
                          className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:border-[#0A5C36] hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group"
                          title="Click to view full order details & live tracking"
                        >
                          {/* Product Image */}
                          <img
                            src={it.product_image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=400&q=80'}
                            alt={it.product_title}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl border border-gray-100 p-1 bg-stone-50 shrink-0 group-hover:scale-105 transition-transform"
                          />

                          {/* Product Title & Current Delivery Update */}
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <h3 className="font-extrabold text-gray-900 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-[#0A5C36] transition-colors">
                              {it.product_title || 'Dropship Product'}
                            </h3>

                            {/* Current Delivery Update */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                                <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                                <span>{badge.label}</span>
                              </span>

                              {ord.tracking_carrier && (
                                <span className="text-[11px] text-gray-500 font-medium">
                                  via {ord.tracking_carrier}
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-gray-500">
                              {badge.description}
                            </p>
                          </div>

                          {/* Action Arrow */}
                          <div className="flex items-center text-gray-400 group-hover:text-[#0A5C36] group-hover:translate-x-1 transition-all pl-2 shrink-0">
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Direct Instagram Delivery Support Pill */}
            <div className="p-3 bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 border border-pink-200/70 rounded-2xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-gray-700">
                <Instagram className="w-4 h-4 text-pink-600 shrink-0" />
                <span>Need delivery help? DM us on Instagram <strong className="text-gray-900">@thekeralastore_</strong></span>
              </div>
              <a
                href="https://instagram.com/thekeralastore_"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg text-[11px] font-bold shrink-0 shadow-2xs hover:opacity-90"
              >
                DM Support
              </a>
            </div>

          </div>
        ) : (
          /* ========================================================== */
          /* VIEW 2: NEW PAGE WITH ORDER DETAILS (OPENED AFTER PRESSING) */
          /* ========================================================== */
          selectedOrder && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Back to Orders Bar */}
              <div className="flex items-center justify-between pb-1">
                <button
                  type="button"
                  onClick={handleBackToList}
                  className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <ArrowLeft className="w-4 h-4 text-gray-600" />
                  <span>Back to Track Orders</span>
                </button>

                <span className="text-xs font-mono font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200">
                  {selectedOrder.order_number}
                </span>
              </div>

              {/* HERO ORDER DETAILS GREEN BANNER WITH WHITE TEXTS */}
              <div className="bg-[#0A5C36] text-white rounded-3xl p-6 sm:p-7 shadow-sm border-2 border-[#064024] relative overflow-hidden space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-black tracking-wider uppercase text-white border border-white/25">
                        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                        Order Details
                      </span>
                      <span className="text-xs font-mono font-bold bg-white/15 px-2.5 py-1 rounded-full text-white">
                        {selectedOrder.order_number}
                      </span>
                      <span className="text-xs font-bold uppercase bg-white text-[#0A5C36] px-2.5 py-1 rounded-full shadow-2xs">
                        {selectedOrder.payment_method === 'razorpay' ? 'Paid via Razorpay' : 'Cash on Delivery'}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                      {selectedOrder.customer_name ? `Order Confirmed for ${selectedOrder.customer_name}` : 'Order Confirmed'}
                    </h2>
                    
                    <p className="text-xs text-emerald-100 font-medium">
                      Placed on {formatDateTime(selectedOrder.created_at)} • Curated Kerala Doorstep Delivery
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 sm:text-right shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">
                      Total Amount
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-white">
                      {formatINR(selectedOrder.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* CARD 1: ORDER SUMMARY & PRODUCT DETAILS */}
              <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs overflow-hidden">
                {/* Green Banner Header with White Texts */}
                <div className="bg-[#0A5C36] text-white px-6 py-4 flex items-center justify-between border-b border-[#064024]">
                  <div className="flex items-center gap-2.5">
                    <Package className="w-5 h-5 text-emerald-200" />
                    <h3 className="font-extrabold text-sm sm:text-base text-white">
                      Ordered Products ({(selectedOrder.items || []).length})
                    </h3>
                  </div>
                  <span className="text-xs font-black text-white bg-white/20 px-3 py-1 rounded-full border border-white/20">
                    {formatINR(selectedOrder.total_amount)}
                  </span>
                </div>

                {/* Products in this order */}
                <div className="p-6 space-y-3">
                  {(selectedOrder.items || []).map((it, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/70 text-xs"
                    >
                      <img
                        src={it.product_image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=400&q=80'}
                        alt={it.product_title}
                        className="w-16 h-16 object-contain rounded-xl border border-gray-200 p-1 bg-white shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-2">
                          {it.product_title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                          <span>Qty: <strong>{it.quantity}</strong></span>
                          <span>•</span>
                          <span>Price: <strong>{formatINR(it.unit_price)}</strong></span>
                          {it.sku && <span className="font-mono text-[10px]">• SKU: {it.sku}</span>}
                        </div>
                      </div>
                      <span className="font-extrabold text-gray-900 text-xs sm:text-sm">
                        {formatINR(it.total_price || it.unit_price * it.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD 2: LIVE DELIVERY TRACKING & STEPPER */}
              <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs overflow-hidden">
                {/* Green Banner Header with White Texts */}
                <div className="bg-[#0A5C36] text-white px-6 py-4 flex items-center justify-between border-b border-[#064024]">
                  <div className="flex items-center gap-2.5">
                    <Truck className="w-5 h-5 text-emerald-200" />
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-white">Live Delivery Tracking</h3>
                      <span className="text-[11px] text-emerald-100 font-medium hidden sm:inline">
                        {getStatusBadge(selectedOrder.fulfilment_status).description}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-black bg-white text-[#0A5C36] px-3.5 py-1 rounded-full shadow-2xs">
                    {getStatusBadge(selectedOrder.fulfilment_status).label}
                  </span>
                </div>

                <div className="p-6 space-y-6">
                  {/* 5-Step Delivery Stepper */}
                  <div className="grid grid-cols-5 gap-2 text-center pt-2">
                    {[
                      { step: 1, label: 'Order Confirmed' },
                      { step: 2, label: 'Supplier Packed' },
                      { step: 3, label: 'Shipped' },
                      { step: 4, label: 'Out for Delivery' },
                      { step: 5, label: 'Delivered' },
                    ].map(({ step, label }) => {
                      const status = getStepStatus(selectedOrder.fulfilment_status, step);
                      return (
                        <div key={step} className="flex flex-col items-center">
                          <div
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                              status === 'completed'
                                ? 'bg-[#0A5C36] text-white shadow-xs'
                                : status === 'current'
                                ? 'bg-amber-500 text-white animate-pulse shadow-xs ring-4 ring-amber-100'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {status === 'completed' ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              step
                            )}
                          </div>
                          <span className={`text-[10px] sm:text-xs font-semibold leading-tight ${
                            status === 'upcoming' ? 'text-gray-400' : 'text-gray-900'
                          }`}>
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Courier Partner & AWB Live Tracking Card */}
                  {selectedOrder.tracking_number ? (
                    <div className="p-4 bg-emerald-50/90 border-2 border-emerald-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <p className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                          <Truck className="w-4 h-4 text-[#0A5C36]" />
                          Courier Partner: <strong className="text-[#0A5C36]">{selectedOrder.tracking_carrier || 'Delhivery Express'}</strong>
                        </p>
                        <p className="text-emerald-900">
                          Waybill / Tracking No: <strong className="font-mono text-gray-950 text-sm">{selectedOrder.tracking_number}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {getCourierTrackingUrl(selectedOrder.tracking_carrier, selectedOrder.tracking_number) && (
                          <a
                            href={getCourierTrackingUrl(selectedOrder.tracking_carrier, selectedOrder.tracking_number)!}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 bg-[#0A5C36] hover:bg-[#064024] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                          >
                            <span>Track on Courier Website</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <span className="text-[11px] font-bold text-[#0A5C36] bg-white px-3 py-1.5 rounded-xl border border-emerald-300">
                          Live In-Transit
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs flex items-center gap-3 text-gray-600">
                      <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900">
                          Packaging &amp; Courier Dispatch Underway
                        </p>
                        <p className="text-gray-500 text-[11px] mt-0.5">
                          Your AWB waybill number and direct courier tracking link will be updated here as soon as our fulfillment team hands over the package to the courier.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 3: SHIPPING DESTINATION */}
              <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs overflow-hidden">
                {/* Green Banner Header with White Texts */}
                <div className="bg-[#0A5C36] text-white px-6 py-4 flex items-center justify-between border-b border-[#064024]">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-5 h-5 text-emerald-200" />
                    <h3 className="font-extrabold text-sm sm:text-base text-white">Shipping Destination</h3>
                  </div>
                  <span className="text-xs text-white bg-white/20 px-3 py-1 rounded-full border border-white/20 font-bold">
                    Doorstep Delivery
                  </span>
                </div>

                <div className="p-6 space-y-1.5 text-xs">
                  <p className="font-bold text-gray-900 text-sm">{selectedOrder.customer_name}</p>
                  <p className="text-gray-600">Phone: <strong className="text-gray-900">{selectedOrder.customer_phone}</strong></p>
                  <p className="text-gray-600">{selectedOrder.shipping_address?.addressLine1}</p>
                  {selectedOrder.shipping_address?.addressLine2 && (
                    <p className="text-gray-600">{selectedOrder.shipping_address.addressLine2}</p>
                  )}
                  <p className="text-gray-900 font-semibold">
                    {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} - {selectedOrder.shipping_address?.pincode}
                  </p>
                </div>
              </div>

              {/* CARD 4: INSTAGRAM DELIVERY HELP */}
              <div className="p-4 bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 border border-pink-200/70 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-gray-900 flex items-center gap-1.5">
                    <Instagram className="w-4 h-4 text-pink-600" />
                    Need assistance with this order?
                  </p>
                  <p className="text-gray-600 text-[11px]">
                    DM us on Instagram <strong className="text-pink-600">@thekeralastore_</strong> with Order ID <strong>{selectedOrder.order_number}</strong>.
                  </p>
                </div>

                <a
                  href="https://instagram.com/thekeralastore_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-90 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-opacity shrink-0"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>DM @thekeralastore_</span>
                </a>
              </div>

            </div>
          )
        )}

      </div>
    </div>
  );
};
