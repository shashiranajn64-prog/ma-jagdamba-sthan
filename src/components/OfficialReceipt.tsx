import React, { useEffect, useState } from 'react';
import { Donation } from '../types';
import { MandirSeal, KalashIcon, OmIcon } from './TempleIcons';
import { Printer, Share2, Download, ArrowLeft, CheckCircle2 } from 'lucide-react';
import QRCode from 'qrcode';

// TODO: Change to seva@maajagdambasthan.org after buying domain
const TRUST_EMAIL = 'maajagdambasthan.mathurapur@gmail.com';
const TRUST_PHONE = '+91 9709168876';
const TRUST_ADDRESS = 'मथुरापुर, मुजफ्फरपुर, बिहार - 843119';
const WEBSITE_URL = 'https://ma-jagdamba-sthan.ai.studio';

interface OfficialReceiptProps {
  donation: Donation;
  onBack?: () => void;
  isStandalone?: boolean;
}

// Convert number to words in Hindi/English
function numberToWords(num: number): string {
  const a = [
    '', 'एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह', 'सात', 'आठ', 'नौ', 'दस',
    'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पंद्रह', 'सोलह', 'सत्रह', 'अठारह', 'उन्नीस'
  ];
  const b = ['', '', 'बीस', 'तीस', 'चालीस', 'पचास', 'साठ', 'सत्तर', 'अस्सी', 'नब्बे'];

  if (num === 0) return 'शून्य रुपये मात्र';
  if (num < 20) return `${a[num]} रुपये मात्र`;
  if (num < 100) return `${b[Math.floor(num / 10)]} ${a[num % 10]} रुपये मात्र`;
  if (num < 1000) {
    const rem = num % 100;
    return `${a[Math.floor(num / 100)]} सौ ${rem ? numberToWords(rem).replace(' रुपये मात्र', '') : ''} रुपये मात्र`;
  }
  if (num < 100000) {
    const th = Math.floor(num / 1000);
    const rem = num % 1000;
    return `${numberToWords(th).replace(' रुपये मात्र', '')} हज़ार ${rem ? numberToWords(rem).replace(' रुपये मात्र', '') : ''} रुपये मात्र`;
  }
  return `${num} रुपये मात्र`;
}

export const OfficialReceipt: React.FC<OfficialReceiptProps> = ({
  donation,
  onBack,
  isStandalone = false,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const receiptUrl = `${WEBSITE_URL}/receipt/${donation.receiptNo || donation.id}`;

  useEffect(() => {
    QRCode.toDataURL(receiptUrl, {
      width: 140,
      margin: 1,
      color: {
        dark: '#7a0000',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error(err));
  }, [receiptUrl]);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const cleanMobile = donation.mobile.replace(/\D/g, '').slice(-10);
    const msg =
      `🙏 जय माँ जगदंबा 🙏\n` +
      `प्रिय ${donation.name} जी, आपका ₹${donation.amount} दान प्राप्त हुआ।\n` +
      `रसीद संख्या: ${donation.receiptNo || 'MJS-2026-XXXX'}\n` +
      `दिनांक: ${donation.date}\n` +
      `- माँ जगदंबा स्थान ट्रस्ट, मथुरापुर, मुजफ्फरपुर\n` +
      `डिजिटल रसीद: ${receiptUrl}`;

    window.open(`https://wa.me/91${cleanMobile}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className={`max-w-3xl mx-auto ${isStandalone ? 'py-10 px-4' : 'p-2'}`}>
      {/* Top Action Controls (hidden in print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-4 rounded-2xl border border-amber-300 shadow-md">
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl text-stone-700 hover:text-stone-900 bg-amber-50 hover:bg-amber-100 text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer border border-amber-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>वापस जाएं (Back)</span>
          </button>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleShareWhatsApp}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow transition"
          >
            <Share2 className="w-4 h-4" />
            <span>व्हाट्सएप पर भेजें</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-[#7a0000] hover:bg-[#990000] text-[#FFD700] text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow transition"
          >
            <Printer className="w-4 h-4" />
            <span>प्रिंट / डाउनलोड PDF</span>
          </button>
        </div>
      </div>

      {/* PRINTABLE OFFICIAL RECEIPT PAPER */}
      <div className="printable-area bg-[#fffdf7] text-stone-900 p-6 sm:p-10 rounded-2xl shadow-2xl border-4 border-[#7a0000] relative overflow-hidden">
        {/* Subtle Watermark in Center */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
          <MandirSeal size={460} />
        </div>

        {/* Outer Corner Ornaments */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#7a0000]" />
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#7a0000]" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#7a0000]" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#7a0000]" />

        {/* Top Header of Receipt */}
        <div className="text-center pb-4 border-b-2 border-[#7a0000]/60 relative">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#7a0000] tracking-widest uppercase mb-1">
            <OmIcon className="text-base" />
            <span>॥ श्री गणेशाय नमः • जय माँ जगदम्बे ॥</span>
            <OmIcon className="text-base" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#7a0000] tracking-wide">
            माँ जगदंबा स्थान ट्रस्ट
          </h1>
          <div className="text-xs sm:text-sm font-bold text-amber-900 mt-0.5">
            मथुरापुर, मुजफ्फरपुर, बिहार - 843119
          </div>
          <div className="text-[11px] text-stone-600 mt-1 flex flex-wrap items-center justify-center gap-x-4">
            <span>📞 {TRUST_PHONE}</span>
            <span>📧 {TRUST_EMAIL}</span>
            <span>🌐 {WEBSITE_URL}</span>
          </div>

          {/* Receipt Title Ribbon */}
          <div className="mt-3 inline-block bg-[#7a0000] text-[#FFD700] px-6 py-1 rounded-full text-xs sm:text-sm font-bold tracking-wider shadow-sm uppercase">
            आधिकारिक दान सहयोग पावती (Official Donation Receipt)
          </div>
        </div>

        {/* Meta Bar: Receipt No, Date, Payment Mode */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3 px-4 my-4 bg-amber-100/60 rounded-xl border border-amber-300 text-xs sm:text-sm">
          <div>
            <span className="text-stone-500 font-medium">रसीद संख्या: </span>
            <span className="font-mono font-extrabold text-[#7a0000]">
              {donation.receiptNo || 'MJS-2026-XXXX'}
            </span>
          </div>
          <div className="sm:text-center">
            <span className="text-stone-500 font-medium">दिनांक: </span>
            <span className="font-mono font-bold text-stone-900">{donation.date}</span>
          </div>
          <div className="sm:text-right">
            <span className="text-stone-500 font-medium">माध्यम: </span>
            <span className="font-bold text-stone-900">
              {donation.type === 'CASH' ? 'नकद (Cash Chanda)' : 'ऑनलाइन UPI (Online)'}
            </span>
          </div>
        </div>

        {/* Devotee Info Table Grid */}
        <div className="space-y-3 py-2 text-xs sm:text-sm">
          <div className="flex border-b border-stone-200 pb-2">
            <span className="w-36 sm:w-44 text-stone-500 font-semibold shrink-0">
              श्रद्धालु / दानदाता का नाम:
            </span>
            <span className="font-bold text-stone-900 text-base">{donation.name}</span>
          </div>

          <div className="flex border-b border-stone-200 pb-2">
            <span className="w-36 sm:w-44 text-stone-500 font-semibold shrink-0">
              व्हाट्सएप मोबाइल नंबर:
            </span>
            <span className="font-mono font-bold text-stone-800">{donation.mobile}</span>
          </div>

          {donation.city && (
            <div className="flex border-b border-stone-200 pb-2">
              <span className="w-36 sm:w-44 text-stone-500 font-semibold shrink-0">
                शहर / पता:
              </span>
              <span className="font-medium text-stone-800">{donation.city}</span>
            </div>
          )}

          {donation.sankalp && (
            <div className="flex border-b border-stone-200 pb-2">
              <span className="w-36 sm:w-44 text-stone-500 font-semibold shrink-0">
                संकल्प / सेवा का नाम:
              </span>
              <span className="font-medium text-stone-800">{donation.sankalp}</span>
            </div>
          )}

          {donation.collectedBy && (
            <div className="flex border-b border-stone-200 pb-2">
              <span className="w-36 sm:w-44 text-stone-500 font-semibold shrink-0">
                रसीद जारीकर्ता सेवक:
              </span>
              <span className="font-medium text-stone-800">
                {donation.collectedBy.staffName} (ID: {donation.collectedBy.staffId})
              </span>
            </div>
          )}

          <div className="flex border-b border-stone-200 pb-2">
            <span className="w-36 sm:w-44 text-stone-500 font-semibold shrink-0">
              शब्दों में राशि (In Words):
            </span>
            <span className="font-bold text-[#7a0000]">
              {numberToWords(donation.amount)}
            </span>
          </div>
        </div>

        {/* Amount Box */}
        <div className="my-5 p-4 bg-gradient-to-r from-amber-100 to-amber-50 rounded-xl border-2 border-dashed border-[#7a0000] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs sm:text-sm font-semibold text-stone-700">
            माँ जगदम्बा स्थान के पावन कोष में कुल प्राप्त राशि:
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#7a0000] font-mono tracking-tight">
            ₹{donation.amount.toLocaleString('en-IN')}/-
          </div>
        </div>

        {/* Bottom Signature, Seal & QR Area */}
        <div className="pt-4 border-t-2 border-stone-200 flex flex-wrap items-end justify-between gap-6">
          {/* QR Verification */}
          <div className="flex items-center gap-3">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="Receipt Verification QR"
                className="w-20 h-20 border border-stone-300 rounded-lg p-1 bg-white"
              />
            ) : (
              <div className="w-20 h-20 border border-stone-300 rounded-lg bg-stone-100" />
            )}
            <div className="text-[10px] text-stone-500 leading-tight">
              <div className="font-bold text-stone-700">सत्यापन QR कोड</div>
              <div>QR स्कैन कर रसीद की</div>
              <div>वैधता सत्यापित करें</div>
              <div className="text-emerald-700 font-bold mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>डिजिटल प्रमाणित</span>
              </div>
            </div>
          </div>

          {/* Mandir Official Seal (Mohar) */}
          <div className="text-center">
            <MandirSeal size={100} className="mx-auto transform -rotate-6" />
          </div>

          {/* Digital Signature */}
          <div className="text-center space-y-1">
            <div className="font-heading text-base font-bold text-[#7a0000] tracking-wider italic">
              माँ जगदंबा स्थान न्यास
            </div>
            <div className="h-0.5 w-32 bg-stone-400 mx-auto" />
            <div className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
              अधिकृत हस्ताक्षर / ट्रस्टी
            </div>
          </div>
        </div>

        {/* Devotional Note at bottom */}
        <div className="mt-6 pt-3 border-t border-amber-200 text-center text-[11px] text-stone-500 font-medium">
          "माँ जगदम्बा की कृपा से आपके परिवार में सदा सुख, शांति एवं समृद्धि का वास रहे।"
        </div>
      </div>
    </div>
  );
};
