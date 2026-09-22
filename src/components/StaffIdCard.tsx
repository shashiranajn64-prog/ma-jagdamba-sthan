import React, { useEffect, useState } from 'react';
import { Staff } from '../types';
import { MandirSeal } from './TempleIcons';
import { Printer, Download, X } from 'lucide-react';
import QRCode from 'qrcode';

interface StaffIdCardProps {
  staff: Staff;
  onClose: () => void;
}

export const StaffIdCard: React.FC<StaffIdCardProps> = ({ staff, onClose }) => {
  const [qrUrl, setQrUrl] = useState<string>('');

  const verifyUrl = `https://maa-jagdamba-sthan-mathurapur.web.app/verify-staff/${staff.id}`;

  useEffect(() => {
    QRCode.toDataURL(verifyUrl, {
      width: 140,
      margin: 1,
      color: {
        dark: '#7a0000',
        light: '#ffffff',
      },
    })
      .then((url) => setQrUrl(url))
      .catch((err) => console.error(err));
  }, [verifyUrl]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border-2 border-[#FFD700]">
        {/* Modal Controls */}
        <div className="no-print p-4 bg-stone-900 text-white flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FFD700]">
            सेवक पहचान पत्र (Staff ID Card)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-[#7a0000] hover:bg-[#990000] text-[#FFD700] text-xs font-bold flex items-center gap-1 cursor-pointer transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE ID CARD (Standard ID card aspect ratio 85mm x 54mm equivalent) */}
        <div className="printable-area p-6 flex justify-center bg-amber-50/50">
          <div className="w-80 rounded-2xl bg-gradient-to-b from-[#7a0000] via-[#8c0000] to-[#590000] text-white p-4 shadow-2xl border-4 border-[#FFD700] relative overflow-hidden text-center">
            {/* Header */}
            <div className="border-b border-[#FFD700]/40 pb-2">
              <div className="text-[10px] text-amber-200 font-bold uppercase tracking-widest">
                ॥ जय माँ जगदम्बा ॥
              </div>
              <div className="text-base font-bold font-heading text-[#FFD700] leading-tight">
                माँ जगदंबा स्थान ट्रस्ट
              </div>
              <div className="text-[9px] text-amber-100">
                मथुरापुर, मुजफ्फरपुर (बिहार) - 843119
              </div>
            </div>

            {/* Photo & Role */}
            <div className="my-3 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-2 border-[#FFD700] p-0.5 bg-white shadow-md overflow-hidden">
                <img
                  src={staff.photoUrl}
                  alt={staff.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="text-sm font-bold text-white mt-1.5 font-heading">
                {staff.name}
              </div>
              <div className="mt-0.5 px-3 py-0.5 rounded-full bg-[#ff9933] text-stone-950 text-[10px] font-extrabold uppercase tracking-wide">
                {staff.role} (सेवक)
              </div>
            </div>

            {/* Staff Details */}
            <div className="bg-black/30 rounded-xl p-2.5 text-[11px] text-left space-y-1 border border-amber-400/30 font-medium">
              <div className="flex justify-between">
                <span className="text-amber-200">स्टाफ ID:</span>
                <span className="font-mono font-bold text-[#FFD700]">{staff.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-200">मोबाइल:</span>
                <span className="font-mono text-white">+91 {staff.mobile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-200">सत्यापन:</span>
                <span className="text-emerald-300 font-bold">अधिकृत चंदा संग्रहकर्ता</span>
              </div>
            </div>

            {/* Bottom QR Code & Seal */}
            <div className="mt-3 pt-2 border-t border-[#FFD700]/30 flex items-center justify-between px-1">
              <div className="text-left text-[8px] text-amber-200 max-w-[120px] leading-tight">
                <div className="font-bold text-white">QR स्कैन करें</div>
                <div>सत्यापन लिंक:</div>
                <div className="font-mono text-[7px] text-amber-300 truncate">
                  maa-jagdamba-sthan-mathurapur.web.app
                </div>
              </div>

              {/* QR Image */}
              {qrUrl && (
                <div className="bg-white p-1 rounded-md border border-[#FFD700] shadow">
                  <img src={qrUrl} alt="Verify QR" className="w-14 h-14" />
                </div>
              )}

              {/* Small Seal */}
              <div className="opacity-90">
                <MandirSeal size={46} className="text-[#FFD700]" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="no-print p-4 bg-stone-100 border-t border-stone-200 text-center">
          <p className="text-[11px] text-stone-500 mb-2">
            यह पहचान पत्र मंदिर परिसर में या चंदा संग्रह के दौरान अनिवार्य रूप से साथ रखें।
          </p>
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold cursor-pointer"
          >
            बंद करें (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
