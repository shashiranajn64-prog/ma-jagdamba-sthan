import React from 'react';
import { GalleryPhoto } from '../types';
import { X, Sparkles } from 'lucide-react';

interface PhotoLightboxProps {
  photo: GalleryPhoto | null;
  onClose: () => void;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({ photo, onClose }) => {
  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full bg-stone-900 rounded-2xl overflow-hidden border-2 border-[#FFD700] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 cursor-pointer border border-white/20 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="max-h-[70vh] flex items-center justify-center bg-black">
          <img
            src={photo.url}
            alt={photo.title}
            className="max-h-[70vh] w-auto max-w-full object-contain"
          />
        </div>

        <div className="p-5 bg-stone-950 text-white border-t border-amber-500/30">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#FFD700] uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>माँ जगदंबा पावन दर्शन</span>
          </div>
          <h3 className="text-xl font-bold font-heading text-white">{photo.title}</h3>
          {photo.caption && (
            <p className="text-stone-300 text-sm mt-1">{photo.caption}</p>
          )}
        </div>
      </div>
    </div>
  );
};
