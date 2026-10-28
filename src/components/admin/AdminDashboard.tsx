import React, { useState, useEffect } from 'react';
import { 
  StoreService 
} from '../../services/storeService';
import { 
  Product, 
  Category, 
  Order, 
  Supplier, 
  DiscountCode, 
  FulfilmentStatus 
} from '../../types';
import { formatINR, formatDateTime, getCourierTrackingUrl } from '../../lib/utils';
import { isSupabaseConfigured } from '../../lib/supabase';
import { ProductModal } from './ProductModal';
import { MeeshoImporterModal } from './MeeshoImporterModal';
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  ShoppingBag, 
  Truck, 
  Boxes, 
  Tag, 
  Settings, 
  Code, 
  LogOut, 
  ArrowLeft, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Download, 
  Upload, 
  ExternalLink,
  ShieldCheck,
  Search,
  Database,
  TrendingUp,
  CreditCard,
  CheckCircle,
  Copy,
  Sparkles,
  Users,
  Phone,
  MapPin,
  MessageCircle,
  Calculator,
  HelpCircle,
  Check,
  Instagram,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

function getOrderDeliveryUpdateMessage(
  order: Order,
  status: FulfilmentStatus,
  carrier?: string,
  tracking?: string
): string {
  const customerName = order.customer_name || 'Valued Customer';
  const orderNum = order.order_number;
  const itemsText = (order.items || []).map((it) => `${it.product_title} (Qty: ${it.quantity})`).join(', ');
  const city = order.shipping_address?.city || 'Kerala, India';

  switch (status) {
    case 'pending':
      return `🛍️ *The Kerala Store - Order Confirmed!*
Hello ${customerName}, thank you for shopping with The Kerala Store!

📦 *Order ID:* ${orderNum}
📋 *Items:* ${itemsText}
💰 *Total Amount:* ${formatINR(order.total_amount)} (${order.payment_method.toUpperCase()})
📍 *Shipping To:* ${city}

We are preparing your items for courier dispatch. For any queries, reply here or message us on Instagram: @thekeralastore_!`;

    case 'supplier_ordered':
      return `📦 *The Kerala Store - Order Processing!*
Hello ${customerName}, your order *#${orderNum}* has been verified and confirmed with our fulfillment supplier.

Your items are currently undergoing quality inspection & packaging. We will send you the live courier tracking number as soon as it is dispatched!

Support: @thekeralastore_`;

    case 'shipped':
      const trackUrl = getCourierTrackingUrl(carrier, tracking);
      return `🚚 *The Kerala Store - Dispatched & In-Transit!*
Hello ${customerName}, exciting news! Your order *#${orderNum}* has been shipped!

🏢 *Courier Partner:* ${carrier || 'Express Courier'}
🔢 *Tracking AWB:* ${tracking || 'Assigned'}
${trackUrl ? `🌐 *Track Shipment Live:* ${trackUrl}\n` : ''}
Estimated delivery in 2-4 business days. For help, contact us on Instagram: @thekeralastore_.`;

    case 'out_for_delivery':
      return `🛵 *The Kerala Store - Out for Delivery Today!*
Hello ${customerName}, your package *#${orderNum}* is out for delivery today with our courier executive!

${order.payment_method === 'cod' ? `💵 *COD Amount to Pay:* ${formatINR(order.total_amount)}\n` : '✅ *Payment:* Paid Online\n'}
Please ensure someone is available at your address to receive the delivery. Enjoy your purchase!

Support: @thekeralastore_`;

    case 'delivered':
      return `🎉 *The Kerala Store - Delivered!*
Hello ${customerName}, your order *#${orderNum}* has been delivered!

We hope you love your products. Please share your review or tag us on Instagram: *@thekeralastore_*.

Thank you for shopping with The Kerala Store! 🌴`;

    case 'cancelled':
      return `❌ *The Kerala Store - Order Cancelled*
Hello ${customerName}, your order *#${orderNum}* has been cancelled. Please message us at @thekeralastore_ if you need any assistance.`;

    default:
      return `Hello ${customerName}, this is The Kerala Store regarding your order *#${orderNum}*.`;
  }
}

interface AdminOrderCardProps {
  order: Order;
  onUpdate: (
    orderId: string, 
    newStatus: FulfilmentStatus, 
    trackingNum?: string, 
    carrier?: string,
    supplierRef?: string
  ) => Promise<void>;
  onCopyAddress: (order: Order) => void;
}

const AdminOrderCard: React.FC<AdminOrderCardProps> = ({ order, onUpdate, onCopyAddress }) => {
  const [status, setStatus] = useState<FulfilmentStatus>(order.fulfilment_status);
  const [carrier, setCarrier] = useState(order.tracking_carrier || 'Delhivery');
  const [customCarrier, setCustomCarrier] = useState(
    ['Delhivery', 'Shadowfax', 'XpressBees', 'DTDC', 'BlueDart', 'Ecom Express', 'India Post'].includes(order.tracking_carrier || '')
      ? ''
      : order.tracking_carrier || ''
  );
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
  const [supplierRef, setSupplierRef] = useState(order.supplier_order_ref || '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedAlert, setCopiedAlert] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setStatus(order.fulfilment_status);
    const standard = ['Delhivery', 'Shadowfax', 'XpressBees', 'DTDC', 'BlueDart', 'Ecom Express', 'India Post'];
    if (order.tracking_carrier && !standard.includes(order.tracking_carrier)) {
      setCarrier('Other');
      setCustomCarrier(order.tracking_carrier);
    } else {
      setCarrier(order.tracking_carrier || 'Delhivery');
      setCustomCarrier('');
    }
    setTrackingNumber(order.tracking_number || '');
    setSupplierRef(order.supplier_order_ref || '');
  }, [order]);

  const effectiveCarrier = carrier === 'Other' ? customCarrier.trim() || 'Other' : carrier;

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdate(order.id, status, trackingNumber.trim(), effectiveCarrier, supplierRef.trim());
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCopy = () => {
    onCopyAddress(order);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const trackingUrl = getCourierTrackingUrl(effectiveCarrier, trackingNumber);
  const addr = order.shipping_address || ({} as any);

  return (
    <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs overflow-hidden transition-all hover:border-gray-300">
      {/* Top Header */}
      <div className="p-4 sm:p-5 bg-stone-50/70 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono font-extrabold text-gray-900 text-sm sm:text-base">{order.order_number}</span>
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
            order.payment_method === 'cod' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {order.payment_method.toUpperCase()}
          </span>
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
            order.fulfilment_status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
            order.fulfilment_status === 'shipped' ? 'bg-blue-100 text-blue-800' :
            order.fulfilment_status === 'supplier_ordered' ? 'bg-purple-100 text-purple-800' :
            order.fulfilment_status === 'out_for_delivery' ? 'bg-indigo-100 text-indigo-800' :
            'bg-gray-100 text-gray-700'
          }`}>
            Status: {order.fulfilment_status.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">
            {formatDateTime(order.created_at)}
          </span>
          <div className="text-right">
            <span className="text-base sm:text-lg font-black text-[#0A5C36]">
              {formatINR(order.total_amount)}
            </span>
          </div>
        </div>
      </div>

      {/* Flipkart-Style Front Summary: Customer & Ordered Product(s) */}
      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Customer Information (Left 5 cols) */}
        <div className="md:col-span-5 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-gray-900 text-sm">
            <Users className="w-4 h-4 text-[#0A5C36] shrink-0" />
            <span>{order.customer_name || addr.fullName || 'Customer'}</span>
          </div>
          <p className="text-gray-600 flex items-center gap-1.5 font-medium">
            <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>{order.customer_phone || addr.phone || 'No phone'}</span>
          </p>
          <p className="text-gray-500 flex items-center gap-1.5 text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{addr.city || 'Kottayam'}, {addr.state || 'Kerala'} - {addr.pincode || '686001'}</span>
          </p>
        </div>

        {/* Ordered Product(s) Summary (Right 7 cols) */}
        <div className="md:col-span-7 space-y-2">
          {(order.items || []).slice(0, 2).map((it, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2.5 bg-stone-50 rounded-2xl border border-stone-200/60 text-xs">
              <img
                src={it.product_image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=400&q=80'}
                alt=""
                className="w-11 h-11 object-contain rounded-xl border border-gray-200 p-0.5 bg-white shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate text-xs">{it.product_title}</p>
                <p className="text-gray-500 text-[11px]">Qty: {it.quantity} • {formatINR(it.unit_price)} each</p>
              </div>
              <span className="font-extrabold text-gray-900 text-xs">
                {formatINR(it.total_price || it.unit_price * it.quantity)}
              </span>
            </div>
          ))}
          {(order.items || []).length > 2 && (
            <p className="text-[11px] text-gray-500 pl-1 font-semibold">
              +{(order.items || []).length - 2} more item(s) in this order
            </p>
          )}
        </div>
      </div>

      {/* Accordion Action Bar */}
      <div className="px-4 py-3 bg-stone-50/60 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          {trackingNumber ? (
            <span className="text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-medium flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#0A5C36]" />
              <span>{effectiveCarrier}: <strong className="font-mono">{trackingNumber}</strong></span>
            </span>
          ) : (
            <span className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-medium flex items-center gap-1.5">
              <span>Awaiting Meesho Fulfillment</span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
        >
          <span>{isExpanded ? 'Hide Details' : 'Show More Details & Tracking'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
        </button>
      </div>

      {/* EXPANDED SECTION: Detailed Address for Meesho & Tracking Updater */}
      {isExpanded && (
        <div className="p-5 sm:p-6 border-t border-gray-200 bg-white space-y-5 animate-in fade-in duration-150">
          
          {/* Customer Address (Meesho Format) */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-bold text-gray-900 flex items-center gap-1.5 text-xs">
                <MapPin className="w-4 h-4 text-[#0A5C36]" /> Full Shipping Destination Address
              </h4>
              <div className="flex items-center gap-1.5">
                <a
                  href="https://instagram.com/thekeralastore_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-2xs transition-all"
                  title="Support on Instagram @thekeralastore_"
                >
                  <Instagram className="w-3 h-3" /> Insta Support
                </a>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-[#0A5C36] hover:bg-[#064024] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Copy formatted address to paste into Meesho checkout"
                >
                  {copiedAddress ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-amber-300" /> Copied for Meesho!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy for Meesho Checkout
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="font-medium text-gray-700 space-y-0.5 pt-1">
              <p className="font-bold text-gray-900 text-sm">{order.customer_name || addr.fullName}</p>
              <p className="text-gray-600">Phone: <strong className="text-gray-900">{order.customer_phone || addr.phone}</strong></p>
              {order.customer_email && <p className="text-gray-500 text-[11px]">{order.customer_email}</p>}
              <p className="text-gray-700">{addr.addressLine1 || 'No street address specified'}</p>
              {addr.addressLine2 && <p className="text-gray-700">{addr.addressLine2}</p>}
              {addr.landmark && <p className="text-gray-500 text-[11px]">Landmark: {addr.landmark}</p>}
              <p className="font-semibold text-gray-900">
                {addr.city || 'Kottayam'}, {addr.state || 'Kerala'} - {addr.pincode || '686001'}
              </p>
            </div>
          </div>

          {/* Meesho Dropship Fulfillment Controls */}
          <div className="bg-emerald-50/60 p-4 sm:p-5 rounded-2xl border border-emerald-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#0A5C36]" /> Meesho Fulfillment &amp; Live Tracking Updater
              </span>
              {trackingUrl && (
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-[#0A5C36] hover:underline flex items-center gap-1"
                >
                  <span>Test Courier Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Status */}
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                  Fulfillment Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as FulfilmentStatus)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
                >
                  <option value="pending">⏳ Pending (Not on Meesho)</option>
                  <option value="supplier_ordered">📦 Ordered on Meesho</option>
                  <option value="shipped">🚚 Shipped &amp; In-Transit</option>
                  <option value="out_for_delivery">🛵 Out for Delivery</option>
                  <option value="delivered">✅ Delivered</option>
                  <option value="cancelled">❌ Cancelled</option>
                </select>
              </div>

              {/* Supplier Order Ref */}
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                  Meesho Order ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. MEESHO-839219"
                  value={supplierRef}
                  onChange={(e) => setSupplierRef(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl font-mono text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
                />
              </div>

              {/* Courier Carrier */}
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                  Courier Partner
                </label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
                >
                  <option value="Delhivery">Delhivery</option>
                  <option value="Shadowfax">Shadowfax</option>
                  <option value="XpressBees">XpressBees</option>
                  <option value="DTDC">DTDC</option>
                  <option value="BlueDart">Blue Dart Express</option>
                  <option value="Ecom Express">Ecom Express</option>
                  <option value="India Post">India Post (Speed Post)</option>
                  <option value="Other">Other / Custom</option>
                </select>
                {carrier === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter carrier name"
                    value={customCarrier}
                    onChange={(e) => setCustomCarrier(e.target.value)}
                    className="w-full mt-1.5 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl text-gray-900"
                  />
                )}
              </div>

              {/* AWB Tracking Number */}
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                  AWB / Tracking Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. DEL109283742"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl font-mono text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
                />
              </div>
            </div>

            {/* Action buttons: Auto Delivery Update & Save to Supabase */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-emerald-100">
              <p className="text-[11px] text-gray-500">
                {trackingNumber ? (
                  <span>Customer can track with AWB: <strong className="font-mono text-gray-800">{trackingNumber}</strong></span>
                ) : (
                  <span>Enter AWB number when Meesho dispatches your item.</span>
                )}
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const msg = getOrderDeliveryUpdateMessage(order, status, effectiveCarrier, trackingNumber);
                    navigator.clipboard.writeText(msg);
                    setCopiedAlert(true);
                    setTimeout(() => setCopiedAlert(false), 2000);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-gray-800 transition-colors cursor-pointer"
                  title="Copy customer delivery update text for Instagram DM, Email, or SMS"
                >
                  {copiedAlert ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Alert Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Delivery Alert</span>
                    </>
                  )}
                </button>

                <a
                  href="https://instagram.com/thekeralastore_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-xs transition-colors"
                  title="Direct message on Instagram @thekeralastore_"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Insta Support</span>
                </a>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                    savedSuccess
                      ? 'bg-emerald-700 text-white'
                      : 'bg-[#0A5C36] hover:bg-[#064024] text-white disabled:opacity-50'
                  }`}
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Saved &amp; Live!
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" /> {isSaving ? 'Saving...' : 'Save Tracking'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


interface AdminDashboardProps {
  onBackToStorefront: () => void;
  onOpenSupabaseModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  onBackToStorefront,
  onOpenSupabaseModal 
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'categories' | 'orders' | 'customers' | 'meesho' | 'suppliers' | 'inventory' | 'discounts' | 'settings'
  >('overview');

  const [analytics, setAnalytics] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);

  const [searchProduct, setSearchProduct] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchOrder, setSearchOrder] = useState('');
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isMeeshoImporterOpen, setIsMeeshoImporterOpen] = useState(false);

  // Meesho Dropship Calculator State
  const [meeshoCost, setMeeshoCost] = useState(299);
  const [sellingPrice, setSellingPrice] = useState(699);

  // New Category State
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');

  // New Discount State
  const [newDiscCode, setNewDiscCode] = useState('');
  const [newDiscValue, setNewDiscValue] = useState(10);
  const [newDiscType, setNewDiscType] = useState<'percentage' | 'fixed'>('percentage');

  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Razorpay Gateway State
  const [razorpayKeyId, setRazorpayKeyId] = useState(() => localStorage.getItem('tks_razorpay_key_id') || import.meta.env.VITE_RAZORPAY_KEY_ID || '');
  const [razorpaySecret, setRazorpaySecret] = useState(() => localStorage.getItem('tks_razorpay_key_secret') || '');
  const [savedRzp, setSavedRzp] = useState(false);

  // Derive unique customers from orders
  const customers = React.useMemo(() => {
    const map = new Map<string, {
      id: string;
      name: string;
      phone: string;
      email: string;
      address?: any;
      orderCount: number;
      totalSpent: number;
      lastOrderDate: string;
      orderNumbers: string[];
    }>();

    orders.forEach((o) => {
      const key = (o.customer_phone || o.customer_email || o.customer_name || o.id).trim().toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.orderCount += 1;
        existing.totalSpent += (o.total_amount || 0);
        if (!existing.orderNumbers.includes(o.order_number)) {
          existing.orderNumbers.push(o.order_number);
        }
        if (new Date(o.created_at) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = o.created_at;
          if (o.shipping_address) existing.address = o.shipping_address;
        }
      } else {
        map.set(key, {
          id: key,
          name: o.customer_name || 'Customer',
          phone: o.customer_phone || '',
          email: o.customer_email || '',
          address: o.shipping_address,
          orderCount: 1,
          totalSpent: o.total_amount || 0,
          lastOrderDate: o.created_at,
          orderNumbers: [o.order_number],
        });
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime()
    );
  }, [orders]);

  const filteredCustomers = React.useMemo(() => {
    const q = searchCustomer.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.address?.city && c.address.city.toLowerCase().includes(q)) ||
        (c.address?.pincode && c.address.pincode.includes(q))
    );
  }, [customers, searchCustomer]);

  const filteredOrders = React.useMemo(() => {
    const q = searchOrder.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q) ||
        (o.supplier_order_ref && o.supplier_order_ref.toLowerCase().includes(q)) ||
        (o.tracking_number && o.tracking_number.toLowerCase().includes(q))
    );
  }, [orders, searchOrder]);

  const handleCopyAddressForMeesho = (ord: Order) => {
    const addr = ord.shipping_address || ({} as any);
    const text = `Name: ${ord.customer_name || addr.fullName || ''}
Phone: ${ord.customer_phone || addr.phone || ''}
House / Flat / Floor / Building: ${addr.addressLine1 || ''}
Road / Area / Colony / Landmark: ${addr.addressLine2 || addr.landmark || ''}
City: ${addr.city || 'Kottayam'}
State: ${addr.state || 'Kerala'}
Pincode: ${addr.pincode || ''}`;

    navigator.clipboard.writeText(text);
    showNotification(`Copied address for ${ord.customer_name}! Ready to paste in Meesho.`);
  };

  const loadAllAdminData = async () => {
    try {
      const [prodsRes, catsRes, ordsRes, supsRes, discsRes] = await Promise.allSettled([
        StoreService.getAllAdminProducts(),
        StoreService.getAllCategories(),
        StoreService.getOrders(),
        StoreService.getSuppliers(),
        StoreService.getDiscounts(),
      ]);

      if (prodsRes.status === 'fulfilled') setProducts(prodsRes.value);
      if (catsRes.status === 'fulfilled') setCategories(catsRes.value);
      if (ordsRes.status === 'fulfilled') setOrders(ordsRes.value);
      if (supsRes.status === 'fulfilled') setSuppliers(supsRes.value);
      if (discsRes.status === 'fulfilled') setDiscounts(discsRes.value);

      try {
        const an = await StoreService.getAnalytics();
        setAnalytics(an);
      } catch (anErr) {
        console.warn('Could not load analytics:', anErr);
      }
    } catch (e) {
      console.error('Error loading admin data:', e);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const showNotification = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3500);
  };

  // Product Actions
  const handleTogglePublish = async (prod: Product) => {
    const nextStatus = prod.status === 'published' ? 'draft' : 'published';
    await StoreService.saveProduct({ ...prod, status: nextStatus });
    showNotification(`Product "${prod.title}" is now ${nextStatus}.`);
    loadAllAdminData();
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await StoreService.deleteProduct(id);
      showNotification('Product deleted successfully.');
      loadAllAdminData();
    }
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      const saved = await StoreService.saveProduct(productData);
      showNotification(`Product "${saved.title}" saved and published successfully!`);
      await loadAllAdminData();
    } catch (err: any) {
      console.error('Error saving product:', err);
      showNotification(`Error saving product: ${err?.message || 'Unknown error'}`);
    }
  };

  // Order Fulfillment Updates
  const handleUpdateOrderStatus = async (
    orderId: string, 
    newStatus: FulfilmentStatus, 
    trackingNum?: string, 
    carrier?: string,
    supplierRef?: string
  ) => {
    try {
      await StoreService.updateOrderStatus(orderId, {
        fulfilment_status: newStatus,
        tracking_number: trackingNum,
        tracking_carrier: carrier,
        supplier_order_ref: supplierRef,
      });
      showNotification(`Order updated! Customer can now track with status "${newStatus}".`);
      await loadAllAdminData();
    } catch (err: any) {
      console.error('Error updating order:', err);
      showNotification(`Error updating order: ${err?.message || 'Unknown error'}`);
    }
  };

  // Export Catalog as JSON
  const handleExportCatalog = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `thekeralastore_catalog_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Category Add
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await StoreService.saveCategory({
      name: newCatName.trim(),
      slug: newCatSlug.trim() || newCatName.toLowerCase().replace(/\s+/g, '-'),
    });
    setNewCatName('');
    setNewCatSlug('');
    showNotification('Category created!');
    await loadAllAdminData();
  };

  // Discount Add
  const handleAddDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscCode.trim()) return;
    await StoreService.saveDiscount({
      code: newDiscCode.trim().toUpperCase(),
      value: newDiscValue,
      discount_type: newDiscType,
      min_order_amount: 500,
      is_active: true,
    });
    setNewDiscCode('');
    showNotification('Discount code created!');
    loadAllAdminData();
  };

  const isConnected = isSupabaseConfigured();

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      
      {/* Top Admin Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBackToStorefront}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Storefront</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-1.5">
              <span>TheKeralaStore</span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-gray-900 text-white px-2 py-0.5 rounded-md">
                Admin
              </span>
            </h1>
          </div>
        </div>

        {/* Supabase status button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenSupabaseModal}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border transition-all ${
              isConnected
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isConnected ? 'Supabase: Connected' : 'Supabase: Local Sandbox'}</span>
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {message && (
        <div className="fixed top-16 right-6 z-50 bg-[#0A5C36] text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          <span>{message}</span>
        </div>
      )}

      {/* Main Admin Content Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Admin Left Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 p-4 space-y-1.5 shrink-0 hidden md:block">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
              activeTab === 'overview' ? 'bg-[#0A5C36] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Overview &amp; Metrics
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
              activeTab === 'products' ? 'bg-[#0A5C36] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Package className="w-4 h-4" /> Products ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
              activeTab === 'categories' ? 'bg-[#0A5C36] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FolderTree className="w-4 h-4" /> Categories ({categories.length})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
              activeTab === 'orders' ? 'bg-[#0A5C36] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4" /> Customer Orders
            </div>
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
              activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
              activeTab === 'customers' ? 'bg-[#0A5C36] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4" /> Customers
            </div>
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
              activeTab === 'customers' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {customers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('meesho')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
              activeTab === 'meesho' ? 'bg-[#0A5C36] text-white shadow-xs' : 'text-amber-800 bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> Meesho Dropship Hub
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white px-1.5 py-0.5 rounded">
              Guide
            </span>
          </button>

          <button
            onClick={() => setActiveTab('suppliers')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
              activeTab === 'suppliers' ? 'bg-[#0A5C36] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Truck className="w-4 h-4" /> Suppliers ({suppliers.length})
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
              activeTab === 'inventory' ? 'bg-[#0A5C36] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Boxes className="w-4 h-4" /> Inventory Alerts
          </button>

          <button
            onClick={() => setActiveTab('discounts')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
              activeTab === 'discounts' ? 'bg-[#0A5C36] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Tag className="w-4 h-4" /> Discount Codes ({discounts.length})
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
              activeTab === 'settings' ? 'bg-[#0A5C36] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Settings className="w-4 h-4" /> Settings &amp; Gateway
          </button>
        </aside>

        {/* Main Panel Content */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && analytics && (
            <div className="space-y-8 max-w-6xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                    Store Performance &amp; Dropshipping Margins
                  </h2>
                  <p className="text-xs text-gray-500">
                    Real-time transaction stats calculated securely on the server
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedProductForModal(null); setIsProductModalOpen(true); }}
                  className="px-4 py-2.5 bg-[#0A5C36] hover:bg-[#064024] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Gross Revenue
                  </span>
                  <div className="text-2xl font-black text-gray-900">
                    {formatINR(analytics.totalRevenue)}
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-2 inline-block">
                    {analytics.totalOrders} total orders
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Estimated Net Profit
                  </span>
                  <div className="text-2xl font-black text-[#0A5C36]">
                    {formatINR(analytics.estimatedProfit)}
                  </div>
                  <span className="text-[11px] font-semibold text-gray-500 mt-2 inline-block">
                    Revenue minus supplier wholesale cost
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Live Published Catalog
                  </span>
                  <div className="text-2xl font-black text-gray-900">
                    {analytics.publishedProducts} <span className="text-xs text-gray-400 font-normal">/ {analytics.totalProducts}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md mt-2 inline-block">
                    Instant storefront sync
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Pending Supplier Orders
                  </span>
                  <div className="text-2xl font-black text-amber-600">
                    {analytics.pendingOrders}
                  </div>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md mt-2 inline-block">
                    Awaiting dispatch
                  </span>
                </div>

              </div>

              {/* Recent Orders Overview */}
              <div className="bg-white rounded-3xl border border-gray-200 shadow-2xs p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900">Recent Customer Transactions</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-[#0A5C36] hover:underline"
                  >
                    View All Orders
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider font-semibold">
                        <th className="pb-3">Order #</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Payment</th>
                        <th className="pb-3">Fulfillment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o.id} className="hover:bg-gray-50">
                          <td className="py-3 font-bold text-gray-900">{o.order_number}</td>
                          <td className="py-3 text-gray-600">{o.customer_name}</td>
                          <td className="py-3 font-bold text-[#0A5C36]">{formatINR(o.total_amount)}</td>
                          <td className="py-3 uppercase font-semibold text-gray-500">{o.payment_method}</td>
                          <td className="py-3">
                            <span className="capitalize font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                              {o.fulfilment_status.replace(/_/g, ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                    Product Catalog Management
                  </h2>
                  <p className="text-xs text-gray-500">
                    Add, edit pricing, manage variants, and update dropship supplier wholesale costs
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsMeeshoImporterOpen(true)}
                    className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-100" />
                    <span>Import from Meesho</span>
                  </button>
                  <button
                    onClick={handleExportCatalog}
                    className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" /> Export JSON
                  </button>
                  <button
                    onClick={() => { setSelectedProductForModal(null); setIsProductModalOpen(true); }}
                    className="px-4 py-2 bg-[#0A5C36] hover:bg-[#064024] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Add Product
                  </button>
                </div>
              </div>

              {/* Product Table */}
              <div className="bg-white rounded-3xl border border-gray-200 shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by title, SKU, or department..."
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    className="flex-1 text-xs bg-transparent focus:outline-none"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-stone-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                        <th className="py-3 px-4">Item</th>
                        <th className="py-3 px-4">Department</th>
                        <th className="py-3 px-4">Selling (₹)</th>
                        <th className="py-3 px-4">Wholesale Cost (₹)</th>
                        <th className="py-3 px-4">Stock</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products
                        .filter((p) => p.title.toLowerCase().includes(searchProduct.toLowerCase()) || p.sku.toLowerCase().includes(searchProduct.toLowerCase()))
                        .map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-3 px-4 flex items-center gap-3">
                              <img
                                src={p.images[0]}
                                alt=""
                                className="w-10 h-10 object-contain rounded-lg border border-gray-200 bg-white p-0.5 shrink-0"
                              />
                              <div className="min-w-0 max-w-xs">
                                <p className="font-bold text-gray-900 truncate">{p.title}</p>
                                <p className="text-[10px] text-gray-400 font-mono">SKU: {p.sku}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-600">{p.category?.name || 'General'}</td>
                            <td className="py-3 px-4 font-bold text-[#0A5C36]">{formatINR(p.price)}</td>
                            <td className="py-3 px-4 font-medium text-amber-900">
                              {p.supplier_cost ? formatINR(p.supplier_cost) : '—'}
                            </td>
                            <td className="py-3 px-4 font-semibold text-gray-700">{p.stock_quantity}</td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleTogglePublish(p)}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  p.status === 'published'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-gray-200 text-gray-700'
                                }`}
                              >
                                {p.status}
                              </button>
                            </td>
                            <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                              <button
                                onClick={() => { setSelectedProductForModal(p); setIsProductModalOpen(true); }}
                                className="p-1.5 text-gray-500 hover:text-[#0A5C36] rounded-lg hover:bg-gray-100"
                                title="Edit Product"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Categories</h2>
                <p className="text-xs text-gray-500">
                  Organize store departments synced with the circular and navbar navigation
                </p>
              </div>

              {/* Add Category Form */}
              <form onSubmit={handleAddCategory} className="bg-white p-5 rounded-2xl border border-gray-200 flex gap-3">
                <input
                  type="text"
                  placeholder="New Category Name (e.g. Smart Home)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0A5C36] text-white text-xs font-bold rounded-xl"
                >
                  Create Category
                </button>
              </form>

              {/* Category List */}
              <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-2xs">
                {categories.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-500">
                    No categories found. Create a new category above or refresh.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {categories.map((c) => {
                      const count = products.filter(
                        (p) =>
                          p.category_id === c.id ||
                          p.category?.slug === c.slug ||
                          (Array.isArray(p.category) && (p.category[0] as any)?.slug === c.slug) ||
                          p.category_id === c.slug
                      ).length;
                      return (
                        <div key={c.id} className="p-4 flex items-center justify-between text-xs hover:bg-gray-50/50 transition-colors">
                          <div className="space-y-0.5">
                            <p className="font-bold text-gray-900 text-sm">{c.name}</p>
                            <p className="text-[11px] text-gray-400 font-mono">slug: {c.slug}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full text-[11px] font-semibold">
                              {count} {count === 1 ? 'product' : 'products'}
                            </span>
                            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold text-[11px]">
                              Active
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS & DROPSHIP FULFILLMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                    Customer Orders &amp; Dropship Dispatch ({orders.length})
                  </h2>
                  <p className="text-xs text-gray-500">
                    Copy customer addresses for Meesho, enter courier waybills, and update live tracking
                  </p>
                </div>

                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Search order ID, name, phone, AWB..."
                    value={searchOrder}
                    onChange={(e) => setSearchOrder(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Orders List */}
              <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                  <div className="bg-white p-12 text-center rounded-3xl border border-gray-200 text-xs text-gray-500">
                    {orders.length === 0
                      ? 'No orders placed yet. Test your store by adding a product to cart and checking out on the storefront!'
                      : `No orders matching "${searchOrder}".`}
                  </div>
                ) : (
                  filteredOrders.map((ord) => (
                    <AdminOrderCard
                      key={ord.id}
                      order={ord}
                      onUpdate={handleUpdateOrderStatus}
                      onCopyAddress={handleCopyAddressForMeesho}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB: STORE CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                    Store Customers ({customers.length})
                  </h2>
                  <p className="text-xs text-gray-500">
                    All customer profiles, order history, and delivery destinations captured during checkout
                  </p>
                </div>

                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Search name, phone, city..."
                    value={searchCustomer}
                    onChange={(e) => setSearchCustomer(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Metric Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Customers</span>
                  <p className="text-xl font-extrabold text-gray-900 mt-1">{customers.length}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Orders</span>
                  <p className="text-xl font-extrabold text-gray-900 mt-1">{orders.length}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Revenue</span>
                  <p className="text-xl font-extrabold text-[#0A5C36] mt-1">
                    {formatINR(orders.reduce((sum, o) => sum + (o.total_amount || 0), 0))}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Avg Value / Customer</span>
                  <p className="text-xl font-extrabold text-gray-900 mt-1">
                    {formatINR(customers.length > 0 ? Math.round(orders.reduce((sum, o) => sum + (o.total_amount || 0), 0) / customers.length) : 0)}
                  </p>
                </div>
              </div>

              {/* Customers List */}
              <div className="space-y-3">
                {filteredCustomers.length === 0 ? (
                  <div className="bg-white p-12 text-center rounded-3xl border border-gray-200 text-xs text-gray-500">
                    No customers found matching "{searchCustomer}". When customers place orders on your store, their details appear here automatically!
                  </div>
                ) : (
                  filteredCustomers.map((cust) => {
                    const cleanPhone = (cust.phone || '').replace(/\D/g, '');
                    const waUrl = cleanPhone
                      ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hello ${cust.name}, thank you for shopping with The Kerala Store!`)}`
                      : null;
                    return (
                      <div key={cust.id} className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#0A5C36] font-black text-sm flex items-center justify-center shrink-0">
                            {cust.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-extrabold text-gray-900 text-sm">{cust.name}</h3>
                              <span className="text-[10px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                                {cust.orderCount} {cust.orderCount === 1 ? 'order' : 'orders'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 flex items-center gap-2">
                              <span>📞 {cust.phone || 'No phone'}</span>
                              {cust.email && <span>• ✉️ {cust.email}</span>}
                            </p>
                            {cust.address && (
                              <p className="text-[11px] text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span>
                                  {cust.address.addressLine1}, {cust.address.city}, {cust.address.state} - {cust.address.pincode}
                                </span>
                              </p>
                            )}
                            <p className="text-[10px] text-gray-400">
                              Latest Order: {formatDateTime(cust.lastOrderDate)} ({cust.orderNumbers.join(', ')})
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                          <div className="text-left md:text-right">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Spent</span>
                            <span className="text-base font-extrabold text-[#0A5C36]">
                              {formatINR(cust.totalSpent)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href="https://instagram.com/thekeralastore_"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                              title="Official Instagram Support"
                            >
                              <Instagram className="w-3.5 h-3.5" /> Insta Support
                            </a>
                            {cust.address && (
                              <button
                                type="button"
                                onClick={() => {
                                  const formatted = `Customer: ${cust.name}
Phone: ${cust.phone}
Address: ${cust.address.addressLine1} ${cust.address.addressLine2 || ''}
City: ${cust.address.city}
State: ${cust.address.state}
Pincode: ${cust.address.pincode}`;
                                  navigator.clipboard.writeText(formatted);
                                  showNotification(`Copied address for ${cust.name}!`);
                                }}
                                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-gray-800 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5" /> Copy Address
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 5: SUPPLIERS */}
          {activeTab === 'suppliers' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                  Dropshipping Suppliers
                </h2>
                <p className="text-xs text-gray-500">
                  Manage external wholesale partners and dispatch lead times
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {suppliers.map((s) => (
                  <div key={s.id} className="bg-white p-5 rounded-3xl border border-gray-200 space-y-2">
                    <h3 className="font-bold text-gray-900 text-sm">{s.name}</h3>
                    <p className="text-xs text-gray-500">Contact: {s.contact_name || s.email}</p>
                    <p className="text-xs text-gray-600">Lead time: <strong>{s.lead_time_days} days</strong></p>
                    {s.website && (
                      <a href={s.website} target="_blank" rel="noreferrer" className="text-xs text-[#0A5C36] font-semibold flex items-center gap-1 hover:underline">
                        <span>Supplier Portal</span> <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Inventory Monitor</h2>
                <p className="text-xs text-gray-500">
                  Real-time stock alerts for high demand SKUs
                </p>
              </div>

              <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                {products.map((p) => (
                  <div key={p.id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-gray-900">{p.title}</p>
                      <p className="text-[11px] text-gray-400 font-mono">SKU: {p.sku}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`font-bold px-2.5 py-1 rounded-full text-xs ${
                        p.stock_quantity <= 10 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {p.stock_quantity} units
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: DISCOUNTS */}
          {activeTab === 'discounts' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Coupon &amp; Discount Codes</h2>
                <p className="text-xs text-gray-500">
                  Active storefront promotional coupons verified on checkout
                </p>
              </div>

              <form onSubmit={handleAddDiscount} className="bg-white p-5 rounded-2xl border border-gray-200 flex gap-3">
                <input
                  type="text"
                  placeholder="CODE (e.g. FESTIVE20)"
                  value={newDiscCode}
                  onChange={(e) => setNewDiscCode(e.target.value.toUpperCase())}
                  className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl uppercase font-mono"
                  required
                />
                <input
                  type="number"
                  placeholder="Value (% or ₹)"
                  value={newDiscValue}
                  onChange={(e) => setNewDiscValue(Number(e.target.value))}
                  className="w-24 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                  required
                />
                <select
                  value={newDiscType}
                  onChange={(e) => setNewDiscType(e.target.value as any)}
                  className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-bold"
                >
                  <option value="percentage">% Percent</option>
                  <option value="fixed">₹ Flat INR</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0A5C36] text-white text-xs font-bold rounded-xl"
                >
                  Add Code
                </button>
              </form>

              <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                {discounts.map((d) => (
                  <div key={d.id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-gray-900 font-mono text-sm">{d.code}</p>
                      <p className="text-[11px] text-gray-500">
                        {d.discount_type === 'percentage' ? `${d.value}% discount` : `Flat ₹${d.value} discount`}
                      </p>
                    </div>
                    <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: MEESHO DROPSHIPPING HUB */}
          {activeTab === 'meesho' && (
            <div className="space-y-8 max-w-5xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded-md">
                    Dropship Guide &amp; Tools
                  </span>
                  <span className="text-xs text-gray-400">• Replaces Framer Template</span>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mt-1">
                  Meesho Dropshipping Hub
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  How to source wholesale items from Meesho, sell them at a markup on The Kerala Store, and manually dispatch orders
                </p>
              </div>

              {/* Note explaining Framer API */}
              <div className="p-5 bg-blue-50 border border-blue-200 rounded-3xl text-xs text-blue-900 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-sm">
                  <HelpCircle className="w-4 h-4 text-blue-600" /> What was "Framer API Docs"?
                </p>
                <p className="text-blue-800 leading-relaxed">
                  Framer is an external no-code website design tool (framer.com). The previous template included boilerplate documentation showing how an external Framer site could connect to Supabase.
                  Because <strong>The Kerala Store</strong> is your complete, self-contained e-commerce store with its own high-converting storefront and admin panel, <strong>you do not need Framer</strong>.
                  This hub provides the exact Meesho dropshipping tools and workflow you need!
                </p>
              </div>

              {/* 4-Step Dropshipping Workflow */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">
                  Your 4-Step Meesho Dropship Workflow
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-2xs space-y-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#0A5C36] font-black flex items-center justify-center text-xs">
                      1
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm">Find Items on Meesho</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Search Meesho for top-rated, trending products with free delivery (e.g., ₹199 - ₹399 wholesale price).
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-2xs space-y-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#0A5C36] font-black flex items-center justify-center text-xs">
                      2
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm">List with Marked-up Price</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Add the product in the <strong>Products</strong> tab. Mark up the price to ₹599 - ₹899. Save and publish to your store.
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-2xs space-y-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#0A5C36] font-black flex items-center justify-center text-xs">
                      3
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm">Order on Meesho</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      In <strong>Orders</strong>, click <strong>"Copy for Meesho"</strong>. Go to Meesho, select "Reselling? Yes", paste customer's address, and place order.
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-2xs space-y-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#0A5C36] font-black flex items-center justify-center text-xs">
                      4
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm">Update AWB &amp; Tracking</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      When Meesho ships the order, copy their Courier &amp; AWB number. Paste it in <strong>Orders</strong>. Customer gets live tracking on "Track Order"!
                    </p>
                  </div>
                </div>
              </div>

              {/* Launch Meesho Importer Action Card */}
              <div className="bg-gradient-to-r from-[#0A5C36] via-[#0B6B3F] to-[#064024] p-6 rounded-3xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-gray-900 px-2 py-0.5 rounded-md">
                      Smart Tool
                    </span>
                    <span className="text-xs text-emerald-200">1-Click Auto Scraper &amp; Pricing</span>
                  </div>
                  <h3 className="text-lg font-extrabold tracking-tight">
                    Smart Meesho Product Importer
                  </h3>
                  <p className="text-xs text-emerald-100/90 max-w-xl leading-relaxed">
                    Paste any Meesho product link or code. It automatically extracts high-res photos, calculates your marked-up retail price, and publishes directly to your store!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMeeshoImporterOpen(true)}
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-gray-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-gray-950" />
                  <span>Launch Importer</span>
                </button>
              </div>

              {/* Interactive Profit Margin Calculator */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/90 shadow-2xs space-y-6">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-[#0A5C36]" />
                  <h3 className="text-base font-extrabold text-gray-900">
                    Interactive Profit Margin &amp; Markup Calculator
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Meesho Wholesale Cost (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                      <input
                        type="number"
                        value={meeshoCost}
                        onChange={(e) => setMeeshoCost(Math.max(0, Number(e.target.value)))}
                        className="w-full pl-7 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
                      />
                    </div>
                    <span className="text-[11px] text-gray-400 mt-1 block">What you pay on Meesho</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      TheKeralaStore Selling Price (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                      <input
                        type="number"
                        value={sellingPrice}
                        onChange={(e) => setSellingPrice(Math.max(0, Number(e.target.value)))}
                        className="w-full pl-7 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
                      />
                    </div>
                    <span className="text-[11px] text-gray-400 mt-1 block">What customer pays you</span>
                  </div>

                  {/* Calculated Result Card */}
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex flex-col justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Your Net Profit</span>
                    <div className="text-2xl font-black text-[#0A5C36] mt-0.5">
                      {formatINR(Math.max(0, sellingPrice - meeshoCost))}
                    </div>
                    <span className="text-xs font-bold text-emerald-700 mt-1">
                      Margin: {sellingPrice > 0 ? Math.round(((sellingPrice - meeshoCost) / sellingPrice) * 100) : 0}% 
                      ({meeshoCost > 0 ? (sellingPrice / meeshoCost).toFixed(1) : 0}x markup)
                    </span>
                  </div>
                </div>

                {/* Recommended Markup Presets */}
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-xs font-bold text-gray-700 block mb-2">Recommended Pricing Rules for Meesho:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setSellingPrice(Math.round(meeshoCost * 2))}
                      className="p-3 bg-stone-50 hover:bg-emerald-50 hover:border-emerald-300 border border-stone-200 rounded-xl text-left transition-colors"
                    >
                      <span className="font-bold text-gray-900 text-xs block">2.0x Standard Markup</span>
                      <span className="text-[11px] text-gray-500">Sell at ₹{Math.round(meeshoCost * 2)} (50% Margin)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSellingPrice(Math.round(meeshoCost * 2.5))}
                      className="p-3 bg-stone-50 hover:bg-emerald-50 hover:border-emerald-300 border border-stone-200 rounded-xl text-left transition-colors"
                    >
                      <span className="font-bold text-gray-900 text-xs block">2.5x Sweet Spot (Recommended)</span>
                      <span className="text-[11px] text-gray-500">Sell at ₹{Math.round(meeshoCost * 2.5)} (60% Margin)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSellingPrice(Math.round(meeshoCost * 3))}
                      className="p-3 bg-stone-50 hover:bg-emerald-50 hover:border-emerald-300 border border-stone-200 rounded-xl text-left transition-colors"
                    >
                      <span className="font-bold text-gray-900 text-xs block">3.0x Premium Gadgets</span>
                      <span className="text-[11px] text-gray-500">Sell at ₹{Math.round(meeshoCost * 3)} (67% Margin)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Portals */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-2xs space-y-3">
                <h3 className="text-sm font-extrabold text-gray-900">Direct Dropshipping Portals</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <a
                    href="https://www.meesho.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-2xl flex items-center justify-between font-bold text-pink-900 transition-colors"
                  >
                    <span>Meesho Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href="https://www.delhivery.com/tracking"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-2xl flex items-center justify-between font-bold text-gray-900 transition-colors"
                  >
                    <span>Delhivery Tracking</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href="https://tracker.shadowfax.in/"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-2xl flex items-center justify-between font-bold text-gray-900 transition-colors"
                  >
                    <span>Shadowfax Tracking</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href="https://www.xpressbees.com/track"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-2xl flex items-center justify-between font-bold text-gray-900 transition-colors"
                  >
                    <span>XpressBees Tracking</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: SETTINGS & GATEWAY */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Settings &amp; Credentials</h2>
                <p className="text-xs text-gray-500">Configure database, payments, and system reset</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Supabase Connection</h3>
                    <p className="text-xs text-gray-500">PostgreSQL database, Storage &amp; Row Level Security</p>
                  </div>
                  <button
                    onClick={onOpenSupabaseModal}
                    className="px-4 py-2 bg-[#0A5C36] text-white text-xs font-bold rounded-xl"
                  >
                    Configure Supabase
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Razorpay Payment Gateway</h3>
                    <p className="text-xs text-gray-500">
                      Enter your Key ID from dashboard.razorpay.com to collect real UPI, GPay, PhonePe, Cards &amp; NetBanking
                    </p>
                  </div>
                  {razorpayKeyId && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      razorpayKeyId.startsWith('rzp_live_') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {razorpayKeyId.startsWith('rzp_live_') ? 'LIVE MODE ACTIVE' : 'TEST MODE'}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Razorpay Key ID</label>
                    <input
                      type="text"
                      placeholder="rzp_test_... or rzp_live_..."
                      value={razorpayKeyId}
                      onChange={(e) => setRazorpayKeyId(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-900"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Found in Razorpay Dashboard &gt; Account &amp; Settings &gt; API Keys</p>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Key Secret</label>
                    <input
                      type="password"
                      placeholder="••••••••••••••••"
                      value={razorpaySecret}
                      onChange={(e) => setRazorpaySecret(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('tks_razorpay_key_id', razorpayKeyId.trim());
                      localStorage.setItem('tks_razorpay_key_secret', razorpaySecret.trim());
                      setSavedRzp(true);
                      setTimeout(() => setSavedRzp(false), 2500);
                    }}
                    className="px-4 py-2 bg-[#0A5C36] hover:bg-[#064024] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    {savedRzp ? 'Saved Successfully!' : 'Save Razorpay Keys'}
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-red-200 space-y-3">
                <h3 className="text-sm font-bold text-red-800">Reset Initial Catalog</h3>
                <p className="text-xs text-gray-500">
                  Restore default sample dropshipping catalog and demo data.
                </p>
                <button
                  onClick={() => {
                    if (confirm('Reset catalog to default seed products?')) {
                      StoreService.resetLocalData();
                      loadAllAdminData();
                      showNotification('Catalog reset to initial seed state.');
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
                >
                  Reset Sample Data
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Product Edit / Create Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        product={selectedProductForModal}
        categories={categories}
        suppliers={suppliers}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
      />

      {/* Meesho Smart Importer Modal */}
      <MeeshoImporterModal
        isOpen={isMeeshoImporterOpen}
        categories={categories}
        onClose={() => setIsMeeshoImporterOpen(false)}
        onProductImported={loadAllAdminData}
      />

    </div>
  );
};

