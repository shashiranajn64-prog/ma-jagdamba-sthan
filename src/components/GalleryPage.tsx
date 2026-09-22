import React, { useState } from 'react';
import { TempleConfig, GalleryPhoto } from '../types';
import { Eye, HeartHandshake, Sparkles } from 'lucide-react';
import { PhotoLightbox } from './PhotoLightbox';

interface GalleryPageProps {
  config: TempleConfig;
  onNavigateToDonation: () => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ config, onNavigateToDonation }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  return (
    <div className="min-h-screen bg-amber-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-[#7a0000] text-xs font-bold border border-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-[#ff9933]" />
            <span>माँ जगदंबा पावन धाम दर्शन दीर्घा</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-stone-900">
            अलौकिक दर्शन एवं पावन स्मृतियां
          </h1>
          <p className="text-stone-600 text-sm sm:text-base">
            माँ जगदंबा स्थान, मथुरापुर (मुजफ्फरपुर) के पावन गर्भगृह, अखंड ज्योति, महाआरती एवं धार्मिक आयोजनों के दिव्य चित्र।
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {config.galleryPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-amber-200/70 hover:border-[#FFD700] cursor-pointer flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-900">
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-xs font-bold text-[#FFD700] flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    <span>पूर्ण आकार में देखें</span>
                  </span>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-base group-hover:text-[#7a0000] transition">
                    {photo.title}
                  </h3>
                  {photo.caption && (
                    <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                      {photo.caption}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Donation CTA */}
        <div className="bg-gradient-to-r from-[#7a0000] via-[#8c0000] to-[#590000] rounded-2xl p-8 text-center text-white shadow-xl border-2 border-[#FFD700] space-y-4 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold font-heading text-[#FFD700]">
            माँ जगदंबा स्थान के विकास में अपना योगदान दें
          </h2>
          <p className="text-amber-100 text-sm max-w-xl mx-auto">
            मंदिर नवनिर्माण, गौ-सेवा, नित्य भंडारा एवं अखंड ज्योति सेवा हेतु अपनी श्रद्धा अनुसार दान करें और तुरंत डिजिटल रसीद प्राप्त करें।
          </p>
          <button
            onClick={onNavigateToDonation}
            className="px-8 py-3.5 rounded-xl font-extrabold text-sm sm:text-base bg-gradient-to-r from-[#ff9933] to-[#FFD700] text-stone-950 shadow-lg hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <HeartHandshake className="w-5 h-5 text-stone-950" />
            <span>ऑनलाइन दान करें (100% निःशुल्क)</span>
          </button>
        </div>
      </div>

      <PhotoLightbox photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
    </div>
  );
};
