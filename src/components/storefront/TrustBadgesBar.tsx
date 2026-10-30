import React from 'react';
import { Truck, ShieldCheck, RotateCcw, Headphones, Award } from 'lucide-react';

export const TrustBadgesBar: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3.5 select-none">
      <div className="bg-[#F8F9FA] border border-gray-100 rounded-xl sm:rounded-2xl py-2.5 px-1 sm:p-4">
        {/* 5 Equal Columns in a single row - No horizontal scrolling, matching screenshot */}
        <div className="grid grid-cols-5 divide-x divide-gray-200">
          
          {/* 1. Free Shipping */}
          <div className="flex flex-col items-center justify-center text-center px-1 sm:px-2 min-w-0">
            <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 shrink-0 mb-1" strokeWidth={1.75} />
            <h4 className="text-[8.5px] sm:text-xs font-bold text-gray-900 leading-tight truncate w-full">
              Free Shipping
            </h4>
            <p className="text-[7px] sm:text-[10px] text-gray-500 truncate w-full mt-0.5 leading-tight">
              On all doorstep orders
            </p>
          </div>

          {/* 2. Secure Payments */}
          <div className="flex flex-col items-center justify-center text-center px-1 sm:px-2 min-w-0">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 shrink-0 mb-1" strokeWidth={1.75} />
            <h4 className="text-[8.5px] sm:text-xs font-bold text-gray-900 leading-tight truncate w-full">
              Secure Payments
            </h4>
            <p className="text-[7px] sm:text-[10px] text-gray-500 truncate w-full mt-0.5 leading-tight">
              Razorpay • UPI • COD
            </p>
          </div>

          {/* 3. Easy Returns */}
          <div className="flex flex-col items-center justify-center text-center px-1 sm:px-2 min-w-0">
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 shrink-0 mb-1" strokeWidth={1.75} />
            <h4 className="text-[8.5px] sm:text-xs font-bold text-gray-900 leading-tight truncate w-full">
              Easy Returns
            </h4>
            <p className="text-[7px] sm:text-[10px] text-gray-500 truncate w-full mt-0.5 leading-tight">
              Hassle free returns
            </p>
          </div>

          {/* 4. 24/7 Support */}
          <div className="flex flex-col items-center justify-center text-center px-1 sm:px-2 min-w-0">
            <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 shrink-0 mb-1" strokeWidth={1.75} />
            <h4 className="text-[8.5px] sm:text-xs font-bold text-gray-900 leading-tight truncate w-full">
              24/7 Support
            </h4>
            <p className="text-[7px] sm:text-[10px] text-gray-500 truncate w-full mt-0.5 leading-tight">
              We're always here
            </p>
          </div>

          {/* 5. Quality Products */}
          <div className="flex flex-col items-center justify-center text-center px-1 sm:px-2 min-w-0">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 shrink-0 mb-1" strokeWidth={1.75} />
            <h4 className="text-[8.5px] sm:text-xs font-bold text-gray-900 leading-tight truncate w-full">
              Quality Products
            </h4>
            <p className="text-[7px] sm:text-[10px] text-gray-500 truncate w-full mt-0.5 leading-tight">
              Trusted by thousands
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

