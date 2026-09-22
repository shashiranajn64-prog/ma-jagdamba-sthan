import React from 'react';
import { Staff } from '../types';
import { ShieldCheck, CheckCircle2, Phone, Calendar, ArrowLeft, Building2 } from 'lucide-react';
import { MandirSeal } from './TempleIcons';

interface StaffVerifyViewProps {
  staff: Staff | undefined;
  staffId: string;
  onBack: () => void;
}

export const StaffVerifyView: React.FC<StaffVerifyViewProps> = ({ staff, staffId, onBack }) => {
  return (
    <div className="min-h-screen bg-amber-50/70 py-12 px-4 sm:px-6">
      <div className="max-w-md mx-auto space-y-6">
        <button
          onClick={onBack}
          className="text-xs font-bold text-stone-600 hover:text-stone-900 bg-white px-3.5 py-2 rounded-xl border border-stone-200 flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>मुख्य पृष्ठ (Go Home)</span>
        </button>

        {staff ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-emerald-500 text-center relative overflow-hidden">
            {/* Top Verified Ribbon */}
            <div className="bg-emerald-600 text-white py-1.5 px-4 -mx-8 -mt-8 mb-6 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 shadow">
              <ShieldCheck className="w-4 h-4" />
              <span>अधिकृत मंदिर सेवक (Verified Staff)</span>
            </div>

            {/* Staff Photo */}
            <div className="relative inline-block mb-4">
              <img
                src={staff.photoUrl}
                alt={staff.name}
                className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-[#FFD700] shadow-md"
              />
              <div className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1 rounded-full border-2 border-white">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            {/* Staff Name & Role */}
            <h2 className="text-2xl font-bold font-heading text-stone-900">
              {staff.name}
            </h2>
            <div className="mt-1 inline-block bg-amber-100 text-[#7a0000] px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border border-amber-300">
              पद: {staff.role}
            </div>

            {/* Details list */}
            <div className="mt-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-left text-xs sm:text-sm space-y-2.5">
              <div className="flex justify-between py-1 border-b border-amber-200/60">
                <span className="text-stone-500">स्टाफ ID:</span>
                <span className="font-mono font-bold text-stone-900">{staff.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-amber-200/60">
                <span className="text-stone-500">मोबाइल:</span>
                <span className="font-mono font-bold text-stone-900">+91 {staff.mobile}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-amber-200/60">
                <span className="text-stone-500">सेवा प्रारंभ तिथि:</span>
                <span className="font-mono text-stone-800">{staff.joinDate}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-stone-500">अधिकार स्थिति:</span>
                <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  सक्रिय एवं अधिकृत
                </span>
              </div>
            </div>

            {/* Mandir Seal */}
            <div className="mt-6 pt-4 border-t border-stone-200 flex items-center justify-center gap-3">
              <MandirSeal size={65} />
              <div className="text-left text-[11px] text-stone-600">
                <div className="font-bold text-[#7a0000]">माँ जगदंबा स्थान ट्रस्ट</div>
                <div>मथुरापुर, मुजफ्फरपुर (बिहार)</div>
                <div className="text-[10px] text-stone-400">रसीद एवं दान संग्रह हेतु अधिकृत</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-red-300 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
              ✕
            </div>
            <h2 className="text-xl font-bold text-stone-900">
              अमान्य स्टाफ ID ({staffId})
            </h2>
            <p className="text-xs text-stone-600">
              यह स्टाफ ID मंदिर के अधिकृत रिकॉर्ड में नहीं पाया गया। कृपया किसी भी अनधिकृत व्यक्ति को दान न दें।
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
