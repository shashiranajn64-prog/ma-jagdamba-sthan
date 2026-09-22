import React, { useState } from 'react';
import { Notice } from '../types';
import { Bell, Search, X } from 'lucide-react';

interface NoticeModalProps {
  notices: Notice[];
  isOpen: boolean;
  onClose: () => void;
}

export const NoticeModal: React.FC<NoticeModalProps> = ({ notices, isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const approved = notices.filter((n) => n.status === 'APPROVED');
  const filtered = approved.filter(
    (n) =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border-2 border-[#FFD700] overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#7a0000] to-[#990000] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-black/20 text-[#FFD700]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-heading text-[#FFD700]">
                माँ जगदंबा मंदिर - समस्त आधिकारिक सूचनाएं
              </h3>
              <p className="text-xs text-amber-200">
                मथुरापुर धाम ट्रस्ट द्वारा जारी आवश्यक विज्ञप्तियां
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 bg-amber-50/70 border-b border-amber-200">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
            <input
              type="text"
              placeholder="सूचना खोजें (उदा: आरती, नवरात्र, भंडारा)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-amber-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#7a0000] bg-white"
            />
          </div>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-stone-500 text-sm">
              कोई सूचना नहीं मिली।
            </div>
          ) : (
            filtered.map((n) => (
              <div
                key={n.id}
                className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-100/50 transition"
              >
                <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
                  <span className="font-mono font-bold text-[#7a0000]">{n.date}</span>
                  <span className="text-[11px] bg-stone-100 px-2 py-0.5 rounded text-stone-600">
                    द्वारा: {n.addedBy}
                  </span>
                </div>
                <h4 className="text-base font-bold text-stone-900 mb-1.5">{n.title}</h4>
                <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-line">
                  {n.details}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#7a0000] hover:bg-[#990000] text-white text-sm font-bold cursor-pointer"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
};
