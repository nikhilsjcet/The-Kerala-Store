import React from 'react';
import { Truck, ShieldCheck, RotateCcw, Headphones, Award } from 'lucide-react';

export const TrustBadgesBar: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-4 select-none">
      <div className="bg-[#F8F9FA] border border-gray-100 rounded-2xl p-2.5 sm:p-4">
        <div className="flex items-center overflow-x-auto scrollbar-none divide-x divide-gray-200">
          
          {/* 1. Free Shipping */}
          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left space-y-1 sm:space-y-0 sm:space-x-2.5 px-3 sm:px-4 shrink-0 min-w-[125px] sm:min-w-0 sm:flex-1">
            <Truck className="w-5 h-5 text-gray-800 shrink-0" strokeWidth={1.5} />
            <div className="min-w-0">
              <h4 className="text-[11px] sm:text-xs font-bold text-gray-900 leading-tight">
                Free Shipping
              </h4>
              <p className="text-[9px] sm:text-[10px] text-gray-500 truncate">
                On all doorstep orders
              </p>
            </div>
          </div>

          {/* 2. Secure Payments */}
          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left space-y-1 sm:space-y-0 sm:space-x-2.5 px-3 sm:px-4 shrink-0 min-w-[125px] sm:min-w-0 sm:flex-1">
            <ShieldCheck className="w-5 h-5 text-gray-800 shrink-0" strokeWidth={1.5} />
            <div className="min-w-0">
              <h4 className="text-[11px] sm:text-xs font-bold text-gray-900 leading-tight">
                Secure Payments
              </h4>
              <p className="text-[9px] sm:text-[10px] text-gray-500 truncate">
                Razorpay • UPI • COD
              </p>
            </div>
          </div>

          {/* 3. Easy Returns */}
          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left space-y-1 sm:space-y-0 sm:space-x-2.5 px-3 sm:px-4 shrink-0 min-w-[125px] sm:min-w-0 sm:flex-1">
            <RotateCcw className="w-5 h-5 text-gray-800 shrink-0" strokeWidth={1.5} />
            <div className="min-w-0">
              <h4 className="text-[11px] sm:text-xs font-bold text-gray-900 leading-tight">
                Easy Returns
              </h4>
              <p className="text-[9px] sm:text-[10px] text-gray-500 truncate">
                Hassle free returns
              </p>
            </div>
          </div>

          {/* 4. 24/7 Support */}
          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left space-y-1 sm:space-y-0 sm:space-x-2.5 px-3 sm:px-4 shrink-0 min-w-[125px] sm:min-w-0 sm:flex-1">
            <Headphones className="w-5 h-5 text-gray-800 shrink-0" strokeWidth={1.5} />
            <div className="min-w-0">
              <h4 className="text-[11px] sm:text-xs font-bold text-gray-900 leading-tight">
                24/7 Support
              </h4>
              <p className="text-[9px] sm:text-[10px] text-gray-500 truncate">
                We're always here
              </p>
            </div>
          </div>

          {/* 5. Quality Products */}
          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left space-y-1 sm:space-y-0 sm:space-x-2.5 px-3 sm:px-4 shrink-0 min-w-[125px] sm:min-w-0 sm:flex-1">
            <Award className="w-5 h-5 text-gray-800 shrink-0" strokeWidth={1.5} />
            <div className="min-w-0">
              <h4 className="text-[11px] sm:text-xs font-bold text-gray-900 leading-tight">
                Quality Products
              </h4>
              <p className="text-[9px] sm:text-[10px] text-gray-500 truncate">
                Trusted by thousands
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

