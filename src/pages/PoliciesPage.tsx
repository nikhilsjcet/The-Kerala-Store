import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  RefreshCw, 
  Truck, 
  Lock, 
  FileText, 
  HelpCircle, 
  Mail, 
  Instagram, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  ChevronRight
} from 'lucide-react';

interface PoliciesPageProps {
  onNavigate: (page: string, param?: string) => void;
  initialTab?: 'returns' | 'shipping' | 'privacy' | 'cancellation';
}

export const PoliciesPage: React.FC<PoliciesPageProps> = ({ onNavigate, initialTab = 'returns' }) => {
  const [activeTab, setActiveTab] = useState<'returns' | 'shipping' | 'privacy' | 'cancellation'>(initialTab);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#FBFBFA] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumb / Back button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-700 hover:text-[#0A5C36] px-3.5 py-2 rounded-xl bg-white border border-gray-200/80 shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </button>
          
          <span className="text-xs font-semibold text-gray-500">
            Last Updated: October 2026
          </span>
        </div>

        {/* Hero Header Banner */}
        <div className="bg-gradient-to-br from-[#0B4628] via-[#0A5C36] to-[#06301A] text-white rounded-3xl p-6 sm:p-10 shadow-sm border-2 border-[#064024] relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-[11px] font-black uppercase tracking-wider text-emerald-100 border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
              Customer Protection Guarantee
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              The Kerala Store Policies
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Clear, transparent, and fair guidelines for your orders, shipments, returns, privacy, and customer satisfaction across India.
            </p>
          </div>
          
          {/* Subtle Decorative Elements */}
          <div className="absolute -right-8 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:block opacity-15">
            <ShieldCheck className="w-40 h-40 text-white" />
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex gap-2 p-1.5 bg-stone-100/80 rounded-2xl border border-stone-200/80 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('returns')}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'returns'
                ? 'bg-white text-[#0A5C36] shadow-2xs border border-gray-200/80'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <RefreshCw className="w-4 h-4 shrink-0" />
            <span>Returns &amp; Refunds</span>
          </button>
          
          <button
            onClick={() => setActiveTab('shipping')}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'shipping'
                ? 'bg-white text-[#0A5C36] shadow-2xs border border-gray-200/80'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <Truck className="w-4 h-4 shrink-0" />
            <span>Shipping &amp; Delivery</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-white text-[#0A5C36] shadow-2xs border border-gray-200/80'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <Lock className="w-4 h-4 shrink-0" />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('cancellation')}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'cancellation'
                ? 'bg-white text-[#0A5C36] shadow-2xs border border-gray-200/80'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>Order Cancellation</span>
          </button>
        </div>

        {/* Content Container */}
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-6 sm:p-10 space-y-8">
          
          {/* TAB 1: RETURNS & REFUNDS (Governed by Meesho Dropshipping Platform Rules) */}
          {activeTab === 'returns' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                    Meesho Dropshipping Fulfillment
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
                  <RefreshCw className="w-6 h-6 text-[#0A5C36]" />
                  Return &amp; Refund Policy
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                  The Kerala Store is an independent retail storefront that operates on a <strong>dropshipping platform model powered by the Meesho Marketplace</strong>. Accordingly, all returns, replacements, and refund terms are strictly governed by the specific return policy of each individual product as listed on Meesho.
                </p>
              </div>

              {/* Crucial Meesho Platform Return Policy Alert Banner */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200/90 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-purple-900 font-extrabold text-sm sm:text-base">
                  <AlertCircle className="w-5 h-5 text-purple-700 shrink-0" />
                  <span>Important: Product-Specific Return Policy via Meesho</span>
                </div>
                <p className="text-xs sm:text-sm text-purple-950/90 leading-relaxed">
                  As our products are sourced directly from verified wholesale suppliers and manufacturers on <strong>Meesho</strong>, return eligibility is <strong>determined solely by the individual product listing on Meesho</strong>. While most categories enjoy a 7-day hassle-free return window, products marked by suppliers as non-returnable on Meesho cannot be returned or refunded.
                </p>
              </div>

              {/* Highlights Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-1.5">
                  <span className="text-emerald-800 font-extrabold text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0A5C36]" />
                    7-Day Meesho Window
                  </span>
                  <p className="text-xs text-emerald-950/80">
                    For eligible items, initiate a return or replacement request within 7 calendar days of doorstep delivery.
                  </p>
                </div>

                <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-1.5">
                  <span className="text-emerald-800 font-extrabold text-sm flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#0A5C36]" />
                    Reverse Courier Pickup
                  </span>
                  <p className="text-xs text-emerald-950/80">
                    Handled directly by Meesho's logistics partners (Delhivery, Shadowfax, Xpressbees) from your delivery address.
                  </p>
                </div>

                <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-1.5">
                  <span className="text-emerald-800 font-extrabold text-sm flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#0A5C36]" />
                    Verified 100% Refund
                  </span>
                  <p className="text-xs text-emerald-950/80">
                    Refunds are initiated within 24-48 hours once the reverse pickup passes Meesho supplier verification.
                  </p>
                </div>
              </div>

              {/* Detailed Terms */}
              <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed">
                <h3 className="text-base font-bold text-gray-900">1. Meesho Return Eligibility &amp; Guidelines</h3>
                <p>
                  Returns and replacements are accepted <strong>only for items designated as returnable on the Meesho Marketplace</strong> at the time of purchase under the following conditions:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>Damaged, Defective, or Tampered Items:</strong> The product received is physically broken, cracked, defective, or package arrived tampered.</li>
                  <li><strong>Wrong Item or Incorrect Variant Delivered:</strong> Product delivered does not match your ordered model, color, or size.</li>
                  <li><strong>Missing Accessories or Components:</strong> Parts, chargers, or components listed on the original manufacturer packaging are missing.</li>
                  <li><strong>Original Packaging Requirement:</strong> Items must be returned unused, unwashed, and undamaged with all original price tags, brand labels, barcodes, and supplier packaging intact.</li>
                </ul>

                <h3 className="text-base font-bold text-gray-900 pt-2">2. Non-Returnable Products (Strict Meesho Policy)</h3>
                <p>
                  In accordance with Meesho wholesale terms, the following categories are <strong>strictly non-returnable and non-refundable</strong> once delivered:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>Personal Hygiene &amp; Innerwear:</strong> Undergarments, socks, personal care devices, and hygiene products for sanitary safety.</li>
                  <li><strong>Cosmetics &amp; Skincare:</strong> Beauty products, perfumes, and cosmetics if the original seal or packaging has been unsealed.</li>
                  <li><strong>Customized / Clearance Products:</strong> Items clearly marked as clearance or "Non-Returnable" on the product listing by the Meesho seller.</li>
                  <li><strong>Items Returned Without Original Tags / Box:</strong> Any returned item with missing tags, torn packaging, or signs of use will be rejected by the Meesho inspection team and will not be eligible for refund.</li>
                </ul>

                <h3 className="text-base font-bold text-gray-900 pt-2">3. How to Request a Return or Replacement</h3>
                <p>
                  Because we coordinate with Meesho suppliers on your behalf, raising a return request is simple:
                </p>
                <ol className="list-decimal pl-5 space-y-1.5">
                  <li>Go to <button onClick={() => onNavigate('orders')} className="text-[#0A5C36] font-bold underline">Track My Orders</button> or DM our support team on Instagram at <a href="https://instagram.com/thekeralastore_" target="_blank" rel="noopener noreferrer" className="text-pink-600 font-bold underline">@thekeralastore_</a>.</li>
                  <li>Provide your Order ID (e.g., <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded text-gray-800">TKS-2026-XXXXXX</span>) and 2-3 clear photographs or an unboxing video demonstrating the defect or issue.</li>
                  <li>Our fulfillment team verifies the product's return eligibility against the supplier listing on Meesho and books a reverse pickup within 24 hours.</li>
                </ol>

                <h3 className="text-base font-bold text-gray-900 pt-2">4. Refund Methods &amp; Processing Timelines</h3>
                <p>
                  Once the courier agent completes the reverse pickup scan and the return is cleared by Meesho logistics:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>Online Prepaid Orders (Razorpay / UPI / Cards / NetBanking):</strong> 100% refund is initiated back to your original payment method within 24-48 hours (settles within 3-5 banking days).</li>
                  <li><strong>Cash on Delivery (COD) Orders:</strong> Refund is transferred directly to your designated UPI ID (GPay, PhonePe, Paytm) or verified IMPS bank account within 24-48 hours of return pickup confirmation.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: SHIPPING & DELIVERY */}
          {activeTab === 'shipping' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
                  <Truck className="w-6 h-6 text-[#0A5C36]" />
                  Shipping &amp; Delivery Policy
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Prompt, insured, and verified courier delivery to doorstep locations nationwide.
                </p>
              </div>

              {/* Delivery Timelines Table */}
              <div className="overflow-hidden border border-gray-200 rounded-2xl">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#FAF7F2] text-gray-800 font-bold border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4">Region</th>
                      <th className="py-3 px-4">Estimated Delivery Time</th>
                      <th className="py-3 px-4">Courier Partner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    <tr className="hover:bg-stone-50">
                      <td className="py-3 px-4 font-semibold text-gray-900">Kerala &amp; South India</td>
                      <td className="py-3 px-4 text-[#0A5C36] font-bold">2 - 3 Business Days</td>
                      <td className="py-3 px-4">Delhivery Express / BlueDart</td>
                    </tr>
                    <tr className="hover:bg-stone-50">
                      <td className="py-3 px-4 font-semibold text-gray-900">Metro Cities (Bengaluru, Mumbai, Delhi, etc.)</td>
                      <td className="py-3 px-4 text-[#0A5C36] font-bold">3 - 4 Business Days</td>
                      <td className="py-3 px-4">BlueDart / Shadowfax</td>
                    </tr>
                    <tr className="hover:bg-stone-50">
                      <td className="py-3 px-4 font-semibold text-gray-900">Rest of India &amp; Tier 2/3 Towns</td>
                      <td className="py-3 px-4 text-[#0A5C36] font-bold">4 - 6 Business Days</td>
                      <td className="py-3 px-4">Delhivery / Xpressbees / India Post</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Detailed Points */}
              <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed">
                <h3 className="text-base font-bold text-gray-900">Shipping Rates &amp; Free Shipping</h3>
                <p>
                  We keep shipping simple and honest:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>Free Shipping:</strong> Automatically applied to all orders with total value of ₹999 or more.</li>
                  <li><strong>Standard Delivery:</strong> Flat rate of ₹99 for orders below ₹999 to cover insured priority courier packaging.</li>
                </ul>

                <h3 className="text-base font-bold text-gray-900 pt-2">Live Tracking &amp; AWB Notification</h3>
                <p>
                  As soon as your parcel is packed and handed over to the courier partner, an automated SMS, WhatsApp, and email update is dispatched with your direct Waybill / AWB tracking code. You can also view live real-time updates at any moment from the <button onClick={() => onNavigate('orders')} className="text-[#0A5C36] font-bold underline">Live Delivery Tracking</button> screen.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
                  <Lock className="w-6 h-6 text-[#0A5C36]" />
                  Privacy Policy &amp; Data Security
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  How The Kerala Store protects your personal data, payment information, and identity.
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed">
                <h3 className="text-base font-bold text-gray-900">1. Information We Collect</h3>
                <p>
                  When you visit or purchase from The Kerala Store, we only collect information essential to process and ship your orders:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>Customer Details:</strong> Name, delivery address, phone number, and email address.</li>
                  <li><strong>Google Authentication:</strong> When you sign in with Google, we receive your name, verified email, and profile avatar to personalize your account and protect order privacy.</li>
                  <li><strong>Order History:</strong> Past purchases, saved wishlist items, and delivery preferences stored securely under Supabase row-level security.</li>
                </ul>

                <h3 className="text-base font-bold text-gray-900 pt-2">2. Payment Security with Razorpay</h3>
                <p>
                  Your payment security is guaranteed through <strong>Razorpay</strong>, India's leading PCI-DSS Level 1 certified payment gateway:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>We do <strong>not</strong> store or have access to your credit/debit card numbers, CVVs, or UPI PINs on our servers.</li>
                  <li>All payment transactions are encrypted end-to-end via 256-bit SSL protocols.</li>
                </ul>

                <h3 className="text-base font-bold text-gray-900 pt-2">3. Meesho Dropshipping Fulfillment Logistics</h3>
                <p>
                  The Kerala Store utilizes the <strong>Meesho Dropshipping Platform</strong> to dispatch products directly from vetted suppliers to your doorstep:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Your necessary shipping information (customer name, delivery address, postal pincode, and contact telephone number) is shared securely with the <strong>Meesho Marketplace</strong> and its authorized logistics courier partners (Delhivery, Shadowfax, Xpressbees, India Post) solely for the operational fulfillment, dispatch, and delivery of your purchased parcel.</li>
                  <li>No payment credentials, card numbers, or banking passwords are ever shared with suppliers or third-party logistics agents.</li>
                </ul>

                <h3 className="text-base font-bold text-gray-900 pt-2">4. Zero Third-Party Selling</h3>
                <p>
                  We maintain a strict <strong>no-sale privacy policy</strong>. Your personal contact details are never sold, rented, or distributed to external marketing agencies or unauthorized data brokers.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: ORDER CANCELLATION */}
          {activeTab === 'cancellation' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
                  <FileText className="w-6 h-6 text-[#0A5C36]" />
                  Order Cancellation Policy
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Guidelines on modifying or cancelling an order prior to dispatch.
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed">
                <h3 className="text-base font-bold text-gray-900">Cancellation Before Dispatch</h3>
                <p>
                  Orders can be cancelled free of charge at any time prior to packaging and dispatch by our Meesho wholesale suppliers:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Visit <button onClick={() => onNavigate('orders')} className="text-[#0A5C36] font-bold underline">Track My Orders</button> and click on your active order.</li>
                  <li>Or send a quick DM on Instagram <a href="https://instagram.com/thekeralastore_" target="_blank" rel="noopener noreferrer" className="text-pink-600 font-bold underline">@thekeralastore_</a> with your Order ID.</li>
                  <li>For prepaid orders cancelled prior to supplier courier dispatch, a 100% immediate refund is initiated to your original payment method.</li>
                </ul>

                <h3 className="text-base font-bold text-gray-900 pt-2">Cancellation After Dispatch</h3>
                <p>
                  Once an order has been handed over to the courier partner with an assigned tracking number, it cannot be intercepted in transit. However, for products eligible for return on Meesho, you may either refuse delivery at your doorstep or initiate a 7-day return request upon delivery.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Customer Support Card */}
        <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-gray-900">Have Questions About Our Policies?</h3>
            <p className="text-xs text-gray-500">
              Our Kerala customer care team is here to assist you 7 days a week.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="mailto:support@thekeralastore.shop"
              className="px-4 py-2.5 bg-white border border-gray-300 text-gray-800 rounded-xl text-xs font-bold hover:border-[#0A5C36] hover:text-[#0A5C36] transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Mail className="w-4 h-4 text-[#0A5C36]" />
              <span>Email Support</span>
            </a>
            <a
              href="https://instagram.com/thekeralastore_"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity shadow-2xs flex items-center gap-1.5"
            >
              <Instagram className="w-4 h-4" />
              <span>DM on Instagram</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

