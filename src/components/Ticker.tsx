import React from 'react';
import { Donation } from '../types';
import { Heart } from 'lucide-react';

interface TickerProps {
  donations: Donation[];
}

export const Ticker: React.FC<TickerProps> = ({ donations }) => {
  // Format items: • Ramesh - ₹501 • Sita - ₹1100 •
  const approvedList = donations.filter((d) => d.status === 'APPROVED');

  const donorItems = approvedList.length > 0
    ? approvedList.map((d) => `${d.name} - ₹${d.amount.toLocaleString('en-IN')}`)
    : ['रमेश - ₹501', 'सीता - ₹1100', 'मोहन - ₹251', 'अंजलि - ₹5100'];

  return (
    <div className="bg-[#7a0000] border-b border-[#FFD700]/30 text-white overflow-hidden py-2 shadow-inner relative z-30 select-none">
      <div className="flex items-center">
        {/* Ticker Lead Tag */}
        <div className="shrink-0 bg-[#5a0000] px-3.5 py-1 z-10 flex items-center gap-1.5 shadow-md border-r border-[#FFD700]/40 text-[#FFD700] text-xs font-bold tracking-wide">
          <Heart className="w-3.5 h-3.5 text-[#ff9933] fill-[#ff9933] animate-pulse" />
          <span className="whitespace-nowrap">🙏 हाल के सहयोगी :</span>
        </div>

        {/* Marquee Content */}
        <div className="overflow-hidden flex-1 relative">
          <div className="animate-marquee whitespace-nowrap text-xs sm:text-sm font-medium tracking-wide">
            {/* Repeat twice for continuous loop */}
            {[...donorItems, ...donorItems, ...donorItems].map((item, idx) => (
              <span key={idx} className="inline-flex items-center mx-3 text-amber-50">
                <span className="text-[#FFD700] mr-2 font-bold">•</span>
                <span className="hover:text-[#FFD700] transition-colors">{item}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
