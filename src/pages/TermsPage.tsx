import React, { useEffect } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Scale, 
  ArrowLeft, 
  Mail, 
  Instagram, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface TermsPageProps {
  onNavigate: (page: string, param?: string) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigate }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
            Effective Date: October 2026
          </span>
        </div>

        {/* Hero Header Banner */}
        <div className="bg-gradient-to-br from-[#0B4628] via-[#0A5C36] to-[#06301A] text-white rounded-3xl p-6 sm:p-10 shadow-sm border-2 border-[#064024] relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-[11px] font-black uppercase tracking-wider text-emerald-100 border border-white/20">
              <Scale className="w-3.5 h-3.5 text-emerald-200" />
              Legal &amp; User Agreement
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Please review the terms and conditions that govern your access to and purchases from The Kerala Store.
            </p>
          </div>
          
          <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:block opacity-15">
            <FileText className="w-40 h-40 text-white" />
          </div>
        </div>

        {/* Legal Text Content Card */}
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-6 sm:p-10 space-y-8 text-xs sm:text-sm text-gray-700 leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#0A5C36] flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <span>Acceptance of Terms</span>
            </h2>
            <p>
              By accessing, browsing, or purchasing products through <strong>The Kerala Store</strong> (operated at thekeralastore.shop), you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service, along with our <button onClick={() => onNavigate('policies')} className="text-[#0A5C36] font-bold underline">Store Policies</button>.
            </p>
            <p>
              If you do not agree with any part of these Terms, you must discontinue your use of our storefront immediately.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 pt-4 border-t border-gray-100">
            <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#0A5C36] flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <span>Meesho Dropshipping Platform &amp; Business Model</span>
            </h2>
            <p>
              <strong>The Kerala Store is an independent dropshipping platform</strong> that sources and fulfills products through the <strong>Meesho Marketplace (Meesho Wholesale)</strong>. Products featured across our catalog are procured directly from and fulfilled by verified domestic wholesalers, manufacturers, and merchant suppliers operating on Meesho.
            </p>
            <p>
              The Kerala Store acts as an e-commerce storefront providing product curation, secure payment processing, order management, and customer support. Orders placed on our platform are transmitted to Meesho suppliers for packing and doorstep dispatch via contracted national courier partners.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 pt-4 border-t border-gray-100">
            <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#0A5C36] flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <span>Customer Accounts &amp; Authentication</span>
            </h2>
            <p>
              You may browse our catalog as a guest or sign in securely via <strong>Google Authentication</strong>. By creating an account or placing an order:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>You agree to provide true, accurate, current, and complete contact and shipping details.</li>
              <li>You are responsible for maintaining the confidentiality of your credentials and devices.</li>
              <li>You agree that order details associated with your phone number and email will be accessible via our order tracking system.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 pt-4 border-t border-gray-100">
            <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#0A5C36] flex items-center justify-center text-xs font-bold shrink-0">4</span>
              <span>Pricing, Payments &amp; Currency</span>
            </h2>
            <p>
              All prices displayed on The Kerala Store are quoted in <strong>Indian National Rupees (INR ₹)</strong> and are inclusive of applicable GST unless explicitly stated otherwise.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Prepaid Payments:</strong> Processed securely through Razorpay supporting UPI (Google Pay, PhonePe, Paytm), RuPay, Visa, MasterCard, and NetBanking.</li>
              <li><strong>Cash on Delivery (COD):</strong> Available on eligible pin codes. Customers selecting COD agree to accept delivery and tender the exact invoice cash amount upon package arrival.</li>
              <li>We reserve the right to correct typographical pricing errors before shipment handoff.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 pt-4 border-t border-gray-100">
            <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#0A5C36] flex items-center justify-center text-xs font-bold shrink-0">5</span>
              <span>Shipping, Delivery &amp; Risk of Loss</span>
            </h2>
            <p>
              Delivery estimates are provided in good faith and may be subject to logistics delays caused by weather, festive volumes, or local courier operational constraints. Risk of loss and title for ordered goods pass to you upon delivery by the carrier to your designated address.
            </p>
          </section>

          {/* Section 6 - Dedicated Meesho Return Policy */}
          <section className="space-y-3 pt-4 border-t border-gray-100">
            <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#0A5C36] flex items-center justify-center text-xs font-bold shrink-0">6</span>
              <span>Returns, Refunds &amp; Meesho Product Returnability</span>
            </h2>
            <p>
              Because our order fulfillment operates on the Meesho dropshipping infrastructure, <strong>all return, exchange, and refund requests are governed strictly by the individual product return policy listed on Meesho</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Product-Specific Eligibility:</strong> Returns are accepted only if that specific product is designated as "Returnable" by the supplier on the Meesho platform. If an item is marked as non-returnable on Meesho, no return or refund can be entertained.</li>
              <li><strong>7-Day Return Window:</strong> For return-eligible items, returns must be requested within 7 calendar days of doorstep delivery for issues concerning defect, breakage, wrong item delivery, or missing components.</li>
              <li><strong>Original Packaging Mandatory:</strong> Items must be returned in their original packaging with all manufacturer tags, barcodes, accessories, and promotional extras untouched. Used, washed, or altered items will be rejected.</li>
              <li><strong>Verification &amp; Refund Disbursement:</strong> Refunds are processed solely after the returned package is collected by the courier partner and passes physical verification in accordance with Meesho's return logistics standards.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3 pt-4 border-t border-gray-100">
            <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#0A5C36] flex items-center justify-center text-xs font-bold shrink-0">7</span>
              <span>Intellectual Property</span>
            </h2>
            <p>
              The trademarks, brand identity, logo, domain name (<span className="font-mono bg-stone-100 px-1 py-0.5 rounded">thekeralastore.shop</span>), UI graphics, and proprietary designs of TheKeralaStore™ are the intellectual property of The Kerala Store and may not be copied, reproduced, or exploited without prior written authorization.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3 pt-4 border-t border-gray-100">
            <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#0A5C36] flex items-center justify-center text-xs font-bold shrink-0">8</span>
              <span>Governing Law &amp; Jurisdiction</span>
            </h2>
            <p>
              These Terms of Service and any transactional agreements shall be governed by and construed in accordance with the laws of <strong>India</strong>. Any disputes arising out of or related to your use of this website or orders placed shall be subject to the exclusive jurisdiction of the competent courts in <strong>Kottayam / Ernakulam, Kerala, India</strong>.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3 pt-4 border-t border-gray-100">
            <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#0A5C36] flex items-center justify-center text-xs font-bold shrink-0">9</span>
              <span>Contact Us</span>
            </h2>
            <p>
              For any legal notices, queries, or clarification regarding these Terms of Service, reach out to our team:
            </p>
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-1">
              <p className="font-bold text-gray-900">The Kerala Store Customer Care</p>
              <p className="text-gray-600">Email: <a href="mailto:support@thekeralastore.shop" className="text-[#0A5C36] font-semibold underline">support@thekeralastore.shop</a></p>
              <p className="text-gray-600">Instagram DM: <a href="https://instagram.com/thekeralastore_" target="_blank" rel="noopener noreferrer" className="text-pink-600 font-semibold underline">@thekeralastore_</a></p>
              <p className="text-gray-600">Location: Kottayam, Kerala - 686001, India</p>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
};

