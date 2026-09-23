import React from 'react';
import { Sparkles, HeartHandshake, Eye, Clock, Flame, Volume2 } from 'lucide-react';
import { TempleConfig } from '../types';

interface HeroBannerProps {
  config: TempleConfig;
  onNavigate: (tab: string) => void;
  onOpenDarshan: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ config, onNavigate, onOpenDarshan }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#7a0000] via-[#590000] to-[#3d0000] text-white">
      {/* Background Sacred Motif & Lighting Overlay */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#FFD700_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#ff9933]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#FFD700]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text & Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Auspicious Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-[#FFD700]/50 text-amber-200 text-xs sm:text-sm font-semibold shadow-sm">
              <Sparkles className="w-4 h-4 text-[#FFD700] animate-spin" style={{ animationDuration: '6s' }} />
              <span>{config.heroBadge || 'उत्तर बिहार का प्रसिद्ध जागृत शक्तिपीठ'}</span>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-[#FFD700] tracking-wide drop-shadow-md leading-tight">
                {config.heroTitle || 'जय माँ जगदंबा'}
              </h1>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-amber-100 font-heading">
                {config.heroSubtitle || 'मथुरापुर धाम, मुजफ्फरपुर'}
              </div>
            </div>

            {/* Shloka */}
            <div className="p-3 sm:p-4 rounded-xl bg-black/30 border-l-4 border-[#ff9933] text-amber-200/90 text-sm sm:text-base italic leading-relaxed font-serif whitespace-pre-line">
              {config.heroShloka || '"सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके ।\nशरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते ॥"'}
            </div>

            {/* Aarti Time Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-950/60 p-4 rounded-xl border border-amber-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[#7a0000] text-[#FFD700] border border-[#FFD700]/40 shrink-0">
                  <Flame className="w-5 h-5 text-[#ff9933]" />
                </div>
                <div>
                  <div className="text-xs text-amber-300 font-medium">प्रातः मंगला आरती</div>
                  <div className="text-base sm:text-lg font-bold text-white tracking-wide font-mono">
                    {config.aartiMorning || '05:00 AM'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[#7a0000] text-[#FFD700] border border-[#FFD700]/40 shrink-0">
                  <Clock className="w-5 h-5 text-[#FFD700]" />
                </div>
                <div>
                  <div className="text-xs text-amber-300 font-medium">सायं महाआरती</div>
                  <div className="text-base sm:text-lg font-bold text-white tracking-wide font-mono">
                    {config.aartiEvening || '07:00 PM'}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons: दर्शन and दान करें */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onOpenDarshan}
                className="px-5 py-3.5 rounded-xl font-bold text-sm sm:text-base bg-white/10 hover:bg-white/20 text-[#FFD700] border-2 border-[#FFD700] shadow-lg hover:shadow-[#FFD700]/20 transition-all flex items-center gap-2 cursor-pointer group"
              >
                <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>दर्शन (Darshan)</span>
              </button>

              <button
                onClick={() => onNavigate('navratri')}
                className="px-5 py-3.5 rounded-xl font-bold text-sm sm:text-base bg-amber-500/25 hover:bg-amber-500/40 text-white border-2 border-amber-400/70 shadow-lg transition-all flex items-center gap-2 cursor-pointer group"
              >
                <Volume2 className="w-5 h-5 text-[#FFD700] group-hover:scale-110 transition-transform animate-pulse" />
                <span>नवरात्रि कथा सुनें</span>
              </button>

              <button
                onClick={() => onNavigate('donation')}
                className="px-7 py-3.5 rounded-xl font-extrabold text-base bg-gradient-to-r from-[#ff9933] via-[#ffa742] to-[#FFD700] text-stone-950 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer ring-2 ring-[#FFD700]/80"
              >
                <HeartHandshake className="w-5 h-5 text-stone-950" />
                <span>दान करें (Donate Online)</span>
              </button>
            </div>
          </div>

          {/* Right Maa Durga Photo Card with Golden Frame */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-sm sm:max-w-md w-full">
              {/* Outer Golden Aura Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#ff9933] via-[#FFD700] to-[#ff9933] rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition duration-700 animate-pulse" />

              <div className="relative rounded-2xl overflow-hidden border-4 border-[#FFD700] bg-stone-900 shadow-2xl">
                <img
                  src={
                    config.heroImageUrl ||
                    'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=900&q=80'
                  }
                  alt={config.heroTitle || 'माँ जगदंबा, मथुरापुर धाम'}
                  className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                {/* Photo Bottom Caption */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4 text-center">
                  <div className="text-lg font-bold font-heading text-[#FFD700]">
                    {config.heroImageCaption || 'माँ जगदम्बा के पावन दर्शन'}
                  </div>
                  <div className="text-xs text-amber-200/90 font-medium">
                    {config.heroImageSubCaption || 'प्रतिदिन प्रातः 04:30 बजे से मंदिर कपाट खुलते हैं'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
