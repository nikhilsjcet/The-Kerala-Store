import React from 'react';
import { Truck, ShieldCheck, RotateCcw, Headphones, Award } from 'lucide-react';

export const TrustBadgesBar: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 select-none">
      <div className="bg-[#F8F9FA] border border-gray-100 rounded-2xl p-4 sm:py-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6 items-center">
          
          {/* 1. Free Shipping */}
          <div className="flex items-center space-x-3">
            <Truck className="w-6 h-6 text-gray-800 shrink-0" strokeWidth={1.5} />
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug truncate">
                Free Shipping
              </h4>
              <p className="text-[11px] text-gray-500 truncate">
                On all doorstep orders
              </p>
            </div>
          </div>

          {/* 2. Secure Payments */}
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-gray-800 shrink-0" strokeWidth={1.5} />
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug truncate">
                Secure Payments
              </h4>
              <p className="text-[11px] text-gray-500 truncate">
                Razorpay • UPI • COD
              </p>
            </div>
          </div>

          {/* 3. Easy Returns */}
          <div className="flex items-center space-x-3">
            <RotateCcw className="w-6 h-6 text-gray-800 shrink-0" strokeWidth={1.5} />
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug truncate">
                Easy Returns
              </h4>
              <p className="text-[11px] text-gray-500 truncate">
                Hassle free returns
              </p>
            </div>
          </div>

          {/* 4. 24/7 Support */}
          <div className="flex items-center space-x-3">
            <Headphones className="w-6 h-6 text-gray-800 shrink-0" strokeWidth={1.5} />
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug truncate">
                24/7 Support
              </h4>
              <p className="text-[11px] text-gray-500 truncate">
                We're always here
              </p>
            </div>
          </div>

          {/* 5. Quality Products */}
          <div className="flex items-center space-x-3 col-span-2 sm:col-span-1">
            <Award className="w-6 h-6 text-gray-800 shrink-0" strokeWidth={1.5} />
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug truncate">
                Quality Products
              </h4>
              <p className="text-[11px] text-gray-500 truncate">
                Trusted by thousands
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

