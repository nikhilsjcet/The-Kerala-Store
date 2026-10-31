import React from 'react';
import { X, ShieldCheck, Truck, RefreshCw, HelpCircle, Mail, Phone, MapPin, CreditCard, Instagram } from 'lucide-react';

interface InfoModalProps {
  type: string | null;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const getContent = () => {
    switch (type) {
      case 'about':
        return {
          title: 'About TheKeralaStore',
          icon: <ShieldCheck className="w-6 h-6 text-[#0A5C36]" />,
          body: (
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <p>
                <strong>TheKeralaStore</strong> is an independent e-commerce dropshipping storefront powered by the <strong>Meesho Marketplace (Meesho Wholesale)</strong>, dedicated to delivering useful, vetted, high-demand products at honest wholesale prices.
              </p>
              <p>
                While rooted in the trusted hospitality and meticulous standards of Kerala, we operate as a general dropshipping store sourcing directly from top domestic suppliers and manufacturers across electronics, home lifestyle, and fashion.
              </p>
              <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-[#0A5C36]">
                <h4 className="font-bold text-sm mb-1">Our Core Promise</h4>
                <p className="text-xs">
                  Every product listed on our store undergoes supplier quality verification, safe packaging, and fast trackable courier dispatch to your doorstep nationwide.
                </p>
              </div>
            </div>
          ),
        };
      case 'contact':
        return {
          title: 'Support & Help',
          icon: <Mail className="w-6 h-6 text-[#0A5C36]" />,
          body: (
            <div className="space-y-4 text-sm text-gray-600">
              <p>For any order help, returns, tracking, or customer inquiries, reach our team directly:</p>
              
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0A5C36] flex items-center justify-center text-white">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">Official Email Support</p>
                    <p className="font-bold text-gray-900 text-sm">support@thekeralastore.shop</p>
                  </div>
                </div>
                <a
                  href="mailto:support@thekeralastore.shop"
                  className="px-3.5 py-1.5 bg-[#0A5C36] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#08482A] transition-colors"
                >
                  Send Email
                </a>
              </div>

              <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">Instagram DM</p>
                    <p className="font-bold text-gray-900 text-sm">@thekeralastore_</p>
                  </div>
                </div>
                <a
                  href="https://instagram.com/thekeralastore_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs rounded-xl shadow-xs hover:opacity-95 transition-opacity"
                >
                  Message Us
                </a>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <MapPin className="w-5 h-5 text-[#0A5C36] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 font-semibold">Store Location</p>
                  <p className="text-xs text-gray-800 font-medium">
                    TheKeralaStore, Kottayam, Kerala, India
                  </p>
                </div>
              </div>
            </div>
          ),
        };
      case 'shipping':
        return {
          title: 'Shipping & Delivery Policy',
          icon: <Truck className="w-6 h-6 text-[#0A5C36]" />,
          body: (
            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <p>
                <strong>Free Shipping:</strong> Available on all orders with a cart value of ₹999 and above. For orders under ₹999, a nominal flat rate of ₹99 applies.
              </p>
              <p>
                <strong>Delivery Timelines:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>Kerala &amp; South India: 2-3 business days.</li>
                <li>Metro Cities (Mumbai, Delhi, Bengaluru, etc.): 3-4 business days.</li>
                <li>Rest of India: 4-6 business days.</li>
              </ul>
              <p className="text-xs pt-2">
                All shipments include an active tracking number sent via SMS and email immediately upon carrier handoff.
              </p>
            </div>
          ),
        };
      case 'track':
        return {
          title: 'Track Your Order',
          icon: <Truck className="w-6 h-6 text-[#0A5C36]" />,
          body: (
            <div className="space-y-4 text-sm text-gray-600">
              <p>
                To track your order status, courier waybill, and delivery progress in real-time, visit our dedicated <strong>Order Tracking</strong> page:
              </p>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#0A5C36]">Live Courier Tracking</p>
                  <p className="text-[11px] text-gray-500">Search by Order ID or mobile number</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    window.dispatchEvent(new CustomEvent('navigate-orders'));
                  }}
                  className="px-4 py-2 bg-[#0A5C36] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#064024] transition-colors"
                >
                  Track Now
                </button>
              </div>
            </div>
          ),
        };
      case 'help':
      case 'faq':
        return {
          title: 'Frequently Asked Questions (FAQ)',
          icon: <HelpCircle className="w-6 h-6 text-[#0A5C36]" />,
          body: (
            <div className="space-y-3 text-xs sm:text-sm text-gray-600">
              <div className="p-3 bg-gray-50 rounded-xl">
                <h4 className="font-bold text-gray-900">How do I track my order?</h4>
                <p className="mt-1 text-xs">
                  Go to <strong>My Orders</strong> in the top menu or footer, enter your Order Number (e.g., TKS-2026-...) to view live courier status.
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <h4 className="font-bold text-gray-900">What payment methods do you accept?</h4>
                <p className="mt-1 text-xs">
                  We accept UPI (GPay, PhonePe, Paytm), RuPay, Visa, MasterCard, NetBanking, and Cash on Delivery (COD).
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <h4 className="font-bold text-gray-900">What is the return policy?</h4>
                <p className="mt-1 text-xs leading-relaxed">
                  As a Meesho dropshipping platform, returns and refunds are governed strictly by each product's specific listing on Meesho. For return-eligible products, we offer a 7-day replacement or refund window for defective or damaged items. Non-returnable designated items cannot be returned.
                </p>
              </div>
            </div>
          ),
        };
      default:
        return {
          title: 'Store Information',
          icon: <ShieldCheck className="w-6 h-6 text-[#0A5C36]" />,
          body: (
            <p className="text-sm text-gray-600">
              For any questions regarding our terms, refunds, or support, please email us at <a href="mailto:support@thekeralastore.shop" className="text-[#0A5C36] font-semibold hover:underline">support@thekeralastore.shop</a> or DM us on Instagram at <a href="https://instagram.com/thekeralastore_" target="_blank" rel="noopener noreferrer" className="text-pink-600 font-semibold hover:underline">@thekeralastore_</a>.
            </p>
          ),
        };
    }
  };

  const { title, icon, body } = getContent();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-green-50">{icon}</div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h3>
        </div>

        <div className="mt-2 mb-6">{body}</div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-[#0A5C36] hover:bg-[#064024] text-white font-bold text-sm transition-colors shadow-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
};

