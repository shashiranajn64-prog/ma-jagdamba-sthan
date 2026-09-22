import React, { useState } from 'react';
import { Bell, Calendar, Sparkles, ChevronRight, Eye, ExternalLink, MapPin, Volume2 } from 'lucide-react';
import { TempleConfig, Notice, CalendarItem, GalleryPhoto } from '../types';

interface HomeTwoColumnsProps {
  config: TempleConfig;
  notices: Notice[];
  calendar: CalendarItem[];
  onOpenNoticeModal: () => void;
  onOpenPhotoModal: (photo: GalleryPhoto) => void;
  onNavigateToGallery: () => void;
  onNavigateToDonation: () => void;
  isAdminLoggedIn: boolean;
  onNavigateToAdmin: () => void;
  onNavigateToNavratri?: () => void;
}

export const HomeTwoColumns: React.FC<HomeTwoColumnsProps> = ({
  config,
  notices,
  calendar,
  onOpenNoticeModal,
  onOpenPhotoModal,
  onNavigateToGallery,
  onNavigateToDonation,
  isAdminLoggedIn,
  onNavigateToAdmin,
  onNavigateToNavratri,
}) => {
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  // Auto JS Date for Today
  const today = new Date();
  const formattedTodayDate = today.toLocaleDateString('hi-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate if notice is < 3 days old
  const isNewNotice = (noticeDateStr: string) => {
    try {
      const noticeDate = new Date(noticeDateStr);
      const diffTime = Math.abs(today.getTime() - noticeDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 3;
    } catch {
      return false;
    }
  };

  const latestNotices = notices
    .filter((n) => n.status === 'APPROVED')
    .slice(0, 5);

  const displayPhotos = config.galleryPhotos?.slice(0, 6) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (70%): lg:col-span-8 */}
        <div className="lg:col-span-8 space-y-8">
          {/* About Mandir Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-amber-200/80 relative overflow-hidden">
            {/* Top decorative stripe */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#7a0000] via-[#ff9933] to-[#FFD700]" />

            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#7a0000] bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                  पवित्र इतिहास एवं महिमा
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-heading text-stone-900 mt-2">
                  माँ जगदंबा स्थान, मथुरापुर धाम
                </h2>
              </div>
              {isAdminLoggedIn && (
                <button
                  onClick={onNavigateToAdmin}
                  className="text-xs font-bold text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>संपादित करें (Admin Edit)</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="prose max-w-none text-stone-700 leading-relaxed space-y-4 text-base">
              <p className="first-letter:text-4xl first-letter:font-bold first-letter:text-[#7a0000] first-letter:float-left first-letter:mr-2">
                {config.aboutText}
              </p>
              <p className="text-stone-600 bg-amber-50/60 p-4 rounded-xl border-l-4 border-[#ff9933]">
                {config.historyText}
              </p>
            </div>

            {/* Darshan & Timings summary */}
            <div className="mt-6 pt-6 border-t border-amber-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200">
                <div className="text-xs font-bold text-[#7a0000] uppercase tracking-wider mb-1">
                  मंदिर दर्शन समय
                </div>
                <div className="text-sm font-semibold text-stone-800">
                  {config.darshanTimings}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200">
                <div className="text-xs font-bold text-[#7a0000] uppercase tracking-wider mb-1">
                  मंदिर का पता
                </div>
                <div className="text-sm font-semibold text-stone-800 flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-[#7a0000] shrink-0 mt-0.5" />
                  <span>{config.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navratri 9 Roop Katha Banner Card */}
          <div className="bg-gradient-to-r from-[#7a0000] via-[#8c0000] to-[#590000] text-white rounded-2xl p-6 sm:p-7 shadow-lg border-2 border-[#FFD700] relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFD700] text-[#7a0000]">
                  <Sparkles className="w-3.5 h-3.5 text-[#7a0000]" />
                  <span>नवरात्र विशेष • 9 पावन स्वरूप</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
                  माँ दुर्गा के 9 रूपों की पवित्र कथाएं सुनें
                </h3>
                <p className="text-xs sm:text-sm text-amber-200">
                  शैलपुत्री से सिद्धिदात्री तक - अब लाइव ऑडियो (Text-to-Speech) एवं कराओके हाइलाइट के साथ
                </p>
              </div>

              {onNavigateToNavratri && (
                <button
                  onClick={onNavigateToNavratri}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#ff9933] text-stone-950 font-extrabold text-sm flex items-center gap-2 hover:scale-105 transition cursor-pointer shadow-md shrink-0 border border-amber-300"
                >
                  <Volume2 className="w-4 h-4 text-stone-950" />
                  <span>🔊 9 कथाएं सुनें</span>
                </button>
              )}
            </div>
          </div>

          {/* Gallery 6 Photos (Admin can add/delete) */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-amber-200/80">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#ff9933] bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  दिव्य दर्शन दीर्घा
                </span>
                <h3 className="text-2xl font-bold font-heading text-stone-900 mt-1">
                  माँ के 6 पावन दर्शन चित्र
                </h3>
              </div>
              <button
                onClick={onNavigateToGallery}
                className="text-sm font-bold text-[#7a0000] hover:text-[#990000] flex items-center gap-1 cursor-pointer group"
              >
                <span>पूरी गैलरी देखें</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {displayPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => onOpenPhotoModal(photo)}
                  className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-[#FFD700] aspect-[4/3] bg-stone-100"
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white">
                    <span className="text-xs font-bold text-[#FFD700] line-clamp-1">
                      {photo.title}
                    </span>
                    <span className="text-[11px] text-amber-200/80 line-clamp-1">
                      {photo.caption || 'बड़ा दर्शन करें'}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={onNavigateToDonation}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7a0000] to-[#990000] hover:from-[#990000] hover:to-[#7a0000] text-[#FFD700] text-sm font-bold shadow-md cursor-pointer transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>मंदिर विकास एवं सेवा में दान दें</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (30%): lg:col-span-4 */}
        <div className="lg:col-span-4 space-y-8">
          {/* Box 1: 📢 मंदिर सूचना */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-md border-2 border-amber-300 relative">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#7a0000] text-[#FFD700]">
                  <Bell className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold font-heading text-[#7a0000]">
                  📢 मंदिर सूचना
                </h3>
              </div>
              <button
                onClick={onOpenNoticeModal}
                className="text-xs font-bold text-[#ff9933] hover:text-[#e68523] cursor-pointer"
              >
                सभी देखें
              </button>
            </div>

            <div className="space-y-3">
              {latestNotices.map((n) => {
                const isNew = isNewNotice(n.date);
                return (
                  <div
                    key={n.id}
                    onClick={() => setSelectedNotice(n)}
                    className="p-3 rounded-xl bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200/80 transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs text-stone-500 mb-1">
                      <span className="font-mono text-stone-600">{n.date}</span>
                      {isNew && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600 text-white animate-pulse shadow-sm">
                          NEW
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-stone-900 group-hover:text-[#7a0000] transition line-clamp-2 leading-snug">
                      {n.title}
                    </h4>
                  </div>
                );
              })}
            </div>

            <button
              onClick={onOpenNoticeModal}
              className="w-full mt-4 py-2.5 rounded-xl text-xs font-bold bg-[#7a0000] text-amber-100 hover:bg-[#990000] transition text-center cursor-pointer shadow-sm"
            >
              सभी सूचनाएं देखें (Sabhi Dekhein)
            </button>
          </div>

          {/* Box 2: 📅 मंदिर कैलेंडर */}
          <div className="bg-gradient-to-b from-amber-50 to-white rounded-2xl p-5 sm:p-6 shadow-md border-2 border-amber-300">
            <div className="flex items-center gap-2 pb-3 border-b border-amber-200 mb-4">
              <div className="p-2 rounded-lg bg-[#ff9933] text-stone-950">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold font-heading text-[#7a0000]">
                📅 मंदिर कैलेंडर
              </h3>
            </div>

            {/* Aaj ki Date Auto JS */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#7a0000] to-[#990000] text-white mb-4 shadow">
              <div className="text-[11px] text-amber-300 font-semibold uppercase tracking-wider">
                आज का पावन दिन (Today)
              </div>
              <div className="text-base sm:text-lg font-bold text-white font-heading mt-0.5">
                {formattedTodayDate}
              </div>
              <div className="text-xs text-amber-200 mt-1 flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
                <span>तिथि: आश्विन शुक्ल पक्ष, त्रयोदशी</span>
              </div>
            </div>

            {/* Agle Tyohar List (Upcoming Festivals) */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-[#7a0000] uppercase tracking-wider mb-2">
                आगामी पर्व एवं महोत्सव (अगले त्योहार)
              </div>

              {calendar.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border text-xs transition ${
                    item.isMajor
                      ? 'bg-amber-100/70 border-amber-400/80 shadow-xs'
                      : 'bg-white border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-stone-500 mb-1">
                    <span className="font-mono font-bold text-[#7a0000]">{item.date}</span>
                    {item.tithi && (
                      <span className="text-[10px] text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                        {item.tithi}
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-stone-900 text-sm">{item.title}</div>
                  <div className="text-stone-600 text-[11px] mt-0.5 line-clamp-2">
                    {item.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notice Detail Popup Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border-2 border-amber-400 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#7a0000] text-[#FFD700]">
                  <Bell className="w-4 h-4" />
                </span>
                <span className="text-xs font-mono text-stone-500">{selectedNotice.date}</span>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold p-1 cursor-pointer"
              >
                ✕ बंद करें
              </button>
            </div>

            <h3 className="text-xl font-bold font-heading text-[#7a0000] mb-3">
              {selectedNotice.title}
            </h3>

            <p className="text-stone-700 text-sm leading-relaxed mb-6 whitespace-pre-line bg-amber-50/50 p-4 rounded-xl border border-amber-200">
              {selectedNotice.details}
            </p>

            <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-amber-100">
              <span>जारीकर्ता: {selectedNotice.addedBy}</span>
              <button
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-2 rounded-lg bg-[#7a0000] text-white font-bold cursor-pointer hover:bg-[#990000]"
              >
                ठीक है
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
