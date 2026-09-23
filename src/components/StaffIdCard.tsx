import React, { useEffect, useState, useRef } from 'react';
import { Staff } from '../types';
import {
  Printer,
  X,
  ShieldCheck,
  CheckCircle2,
  QrCode as QrIcon,
  Sparkles,
  Camera,
  Upload,
  Trash2,
  Check,
  AlertCircle,
} from 'lucide-react';
import QRCode from 'qrcode';
import { templeStore } from '../services/store';
import { processImageFile } from '../utils/imageUtils';

interface StaffIdCardProps {
  staff: Staff;
  onClose: () => void;
  onUpdateStaff?: (updatedStaff: Staff) => void;
}

/**
 * Authentic Round Temple Seal Stamp: "MJS TRUST"
 * Designed according to strict requirements:
 * - Round temple stamp with "MJS TRUST"
 * - "अधिकृत हस्ताक्षरकर्ता" text
 * - NO personal name (NO Shashi Ranjan), only the official stamp.
 */
const RoundTempleStamp: React.FC<{ size?: number; className?: string }> = ({
  size = 110,
  className = '',
}) => {
  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 160 160"
        className="transform -rotate-6 filter drop-shadow-sm select-none"
      >
        {/* Outer Circular Ring with dashed border */}
        <circle
          cx="80"
          cy="80"
          r="76"
          fill="none"
          stroke="#7a0000"
          strokeWidth="2.5"
          strokeDasharray="5,2"
        />
        {/* Inner Solid Circular Ring */}
        <circle
          cx="80"
          cy="80"
          r="71"
          fill="#fffbf5"
          stroke="#7a0000"
          strokeWidth="2.5"
        />
        {/* Innermost Ring */}
        <circle
          cx="80"
          cy="80"
          r="48"
          fill="none"
          stroke="#7a0000"
          strokeWidth="1.5"
        />

        {/* Circular text path for Curved Top and Bottom Headers */}
        <defs>
          <path
            id="stampArcTop"
            d="M 22,80 A 58,58 0 1,1 138,80"
            fill="none"
          />
          <path
            id="stampArcBottom"
            d="M 138,80 A 58,58 0 0,1 22,80"
            fill="none"
          />
        </defs>

        {/* Curved Top Text */}
        <text
          fill="#7a0000"
          fontSize="9.5"
          fontWeight="900"
          letterSpacing="1.2"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          <textPath href="#stampArcTop" startOffset="50%" textAnchor="middle">
            ★ MAA JAGDAMBA STHAN ★
          </textPath>
        </text>

        {/* Curved Bottom Text */}
        <text
          fill="#7a0000"
          fontSize="8.5"
          fontWeight="800"
          letterSpacing="1.4"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          <textPath href="#stampArcBottom" startOffset="50%" textAnchor="middle">
            • MATHURAPUR (MUZ) •
          </textPath>
        </text>

        {/* Center Trishul / Temple Icon */}
        <path
          d="M 77,53 L 80,49 L 83,53 M 80,49 L 80,61 M 74,56 C 74,63 86,63 86,56"
          fill="none"
          stroke="#7a0000"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Center Bold Text: MJS TRUST */}
        <text
          x="80"
          y="74"
          textAnchor="middle"
          fill="#7a0000"
          fontSize="13.5"
          fontWeight="900"
          letterSpacing="1.5"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          MJS TRUST
        </text>

        {/* Sub-center Text */}
        <text
          x="80"
          y="88"
          textAnchor="middle"
          fill="#7a0000"
          fontSize="8"
          fontWeight="800"
          letterSpacing="0.8"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          ★ न्यास समिति ★
        </text>
      </svg>

      {/* Required Text Under Stamp: अधिकृत हस्ताक्षरकर्ता (NO personal name) */}
      <div className="text-[10.5px] font-bold text-[#FFD700] mt-1 tracking-wider text-center font-heading">
        अधिकृत हस्ताक्षरकर्ता
      </div>
      <div className="text-[8px] text-amber-200/90 tracking-widest uppercase font-semibold">
        (Authorized Signatory)
      </div>
    </div>
  );
};

export const StaffIdCard: React.FC<StaffIdCardProps> = ({ staff, onClose, onUpdateStaff }) => {
  const [activeStaff, setActiveStaff] = useState<Staff>(
    () => templeStore.getStaffById(staff.id) || staff
  );
  const [qrUrl, setQrUrl] = useState<string>('');
  const [activeSide, setActiveSide] = useState<'both' | 'front' | 'back'>('both');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync if prop changes
  useEffect(() => {
    const fresh = templeStore.getStaffById(staff.id) || staff;
    setActiveStaff(fresh);
  }, [staff]);

  // Handle direct photo selection from device/camera without URL
  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const base64Data = await processImageFile(file, 400, 0.85);
      templeStore.updateStaff(activeStaff.id, { photoUrl: base64Data });

      const updated = { ...activeStaff, photoUrl: base64Data };
      setActiveStaff(updated);
      if (onUpdateStaff) {
        onUpdateStaff(updated);
      }

      setUploadSuccess('पहचान पत्र पर नई फोटो सफलतापूर्वक लग गई है!');
      setTimeout(() => setUploadSuccess(''), 4000);
    } catch (err: any) {
      setUploadError(err.message || 'फोटो प्रोसेस करने में समस्या आई।');
      setTimeout(() => setUploadError(''), 4000);
    } finally {
      setIsUploading(false);
      // reset file input so selecting same file again triggers change
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Optional: reset/remove photo
  const handleRemovePhoto = () => {
    if (confirm('क्या आप पहचान पत्र से वर्तमान फोटो हटाना चाहते हैं?')) {
      templeStore.updateStaff(activeStaff.id, { photoUrl: '' });
      const updated = { ...activeStaff, photoUrl: '' };
      setActiveStaff(updated);
      if (onUpdateStaff) {
        onUpdateStaff(updated);
      }
      setUploadSuccess('फोटो हटा दी गई है।');
      setTimeout(() => setUploadSuccess(''), 3000);
    }
  };

  // Specific role label logic (Cash -> Cash Counter)
  const getRoleLabel = (role: string) => {
    const r = role.toLowerCase();
    if (r === 'cash' || r.includes('cash')) {
      return 'Cash Counter';
    }
    if (r === 'pujari' || r.includes('pujari')) {
      return 'Pujari (पुजारी)';
    }
    if (r === 'volunteer' || r.includes('volunteer')) {
      return 'Volunteer (स्वयंसेवक)';
    }
    return role;
  };

  const verifyUrl = `https://ma-jagdamba-sthan.ai.studio/verify-staff/${activeStaff.id}`;

  useEffect(() => {
    QRCode.toDataURL(verifyUrl, {
      width: 160,
      margin: 1,
      color: {
        dark: '#7a0000',
        light: '#ffffff',
      },
    })
      .then((url) => setQrUrl(url))
      .catch((err) => console.error('QR code generation failed:', err));
  }, [verifyUrl]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      {/* Hidden file input for camera/gallery upload without URL */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoFileChange}
      />

      <div className="bg-stone-900 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border-2 border-[#FFD700] my-auto">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print p-4 bg-stone-950 text-white flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/30">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#7a0000] text-[#FFD700] border border-[#FFD700]/40 font-bold">
              ID
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold font-heading text-[#FFD700] leading-none">
                सेवक पहचान पत्र (Staff ID Card)
              </h3>
              <p className="text-[11px] text-stone-400">
                माँ जगदंबा स्थान ट्रस्ट • फ्रंट एवं बैक साइड प्रिंट हेतु तैयार
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex bg-stone-800 p-0.5 rounded-lg border border-stone-700 text-xs">
              <button
                type="button"
                onClick={() => setActiveSide('both')}
                className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                  activeSide === 'both'
                    ? 'bg-[#7a0000] text-[#FFD700] shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                दोनों साइड (Both)
              </button>
              <button
                type="button"
                onClick={() => setActiveSide('front')}
                className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                  activeSide === 'front'
                    ? 'bg-[#7a0000] text-[#FFD700] shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                Front
              </button>
              <button
                type="button"
                onClick={() => setActiveSide('back')}
                className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                  activeSide === 'back'
                    ? 'bg-[#7a0000] text-[#FFD700] shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                Back
              </button>
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md hover:shadow-lg cursor-pointer transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>प्रिंट / PDF</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white cursor-pointer transition"
              title="बंद करें"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dedicated Direct Photo Upload Action Ribbon (Hidden on print) */}
        <div className="no-print bg-gradient-to-r from-amber-950/70 via-stone-900 to-amber-950/70 px-4 py-2.5 border-b border-[#FFD700]/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-amber-200 text-xs">
            <Camera className="w-4 h-4 text-[#FFD700] shrink-0 animate-pulse" />
            <span>
              <strong>सीधे फोटो जोड़ें:</strong> बिना किसी URL के अपने मोबाइल गैलरी या कैमरा से सीधे फोटो लगाएं।
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FFD700] to-amber-400 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition hover:scale-102 active:scale-98 disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'अपलोड हो रहा है...' : '📷 सीधे फोटो चुनें (Upload Photo)'}</span>
            </button>

            {activeStaff.photoUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-red-950 text-stone-400 hover:text-red-300 text-xs font-semibold cursor-pointer transition border border-stone-700 flex items-center gap-1"
                title="फोटो हटाएं"
              >
                <Trash2 className="w-3 h-3" />
                <span>हटाएं</span>
              </button>
            )}
          </div>
        </div>

        {/* Upload Notifications */}
        {uploadSuccess && (
          <div className="no-print mx-4 mt-3 p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {uploadError && (
          <div className="no-print mx-4 mt-3 p-2.5 rounded-xl bg-red-950/90 border border-red-500 text-red-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Mobile View Toggle Buttons */}
        <div className="no-print sm:hidden flex justify-center gap-1 p-2 bg-stone-900 border-b border-stone-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveSide('both')}
            className={`px-2.5 py-1 rounded-md font-bold text-xs ${
              activeSide === 'both' ? 'bg-[#7a0000] text-[#FFD700]' : 'text-stone-400'
            }`}
          >
            दोनों साइड
          </button>
          <button
            type="button"
            onClick={() => setActiveSide('front')}
            className={`px-2.5 py-1 rounded-md font-bold text-xs ${
              activeSide === 'front' ? 'bg-[#7a0000] text-[#FFD700]' : 'text-stone-400'
            }`}
          >
            सामने (Front)
          </button>
          <button
            type="button"
            onClick={() => setActiveSide('back')}
            className={`px-2.5 py-1 rounded-md font-bold text-xs ${
              activeSide === 'back' ? 'bg-[#7a0000] text-[#FFD700]' : 'text-stone-400'
            }`}
          >
            पीछे (Back)
          </button>
        </div>

        {/* ============================================================== */}
        {/* PRINTABLE CARDS CONTAINER                                     */}
        {/* ============================================================== */}
        <div className="printable-area p-4 sm:p-8 flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 bg-stone-950/90 min-h-[540px]">
          {/* ========================================================== */}
          {/* FRONT SIDE CARD (Maroon Temple Theme)                      */}
          {/* ========================================================== */}
          {(activeSide === 'both' || activeSide === 'front') && (
            <div className="w-[310px] sm:w-[325px] h-[510px] rounded-3xl bg-gradient-to-b from-[#660000] via-[#7a0000] to-[#4d0000] text-white p-4 shadow-2xl border-4 border-[#FFD700] relative overflow-hidden flex flex-col justify-between shrink-0 select-none">
              {/* Lanyard Hole Punch Slot Indicator (Decorative) */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-black/40 border border-amber-300/30"></div>

              {/* Decorative Corner Ornaments */}
              <div className="absolute top-1 left-1 text-[10px] text-[#FFD700]/40">❖</div>
              <div className="absolute top-1 right-1 text-[10px] text-[#FFD700]/40">❖</div>
              <div className="absolute bottom-1 left-1 text-[10px] text-[#FFD700]/40">❖</div>
              <div className="absolute bottom-1 right-1 text-[10px] text-[#FFD700]/40">❖</div>

              {/* FRONT HEADER */}
              <div className="pt-2 text-center border-b border-[#FFD700]/40 pb-2.5">
                <div className="text-[10px] text-amber-300 font-bold tracking-widest font-heading">
                  ॥ जय माँ जगदम्बा ॥
                </div>
                <div className="text-base font-extrabold font-heading text-[#FFD700] tracking-wide mt-0.5 leading-tight drop-shadow-sm">
                  माँ जगदंबा स्थान ट्रस्ट
                </div>
                <div className="text-[8.5px] text-amber-200 tracking-wider uppercase font-semibold">
                  MAA JAGDAMBA STHAN TRUST
                </div>
                <div className="text-[8px] text-amber-100/90 mt-0.5">
                  मथुरापुर, मुजफ्फरपुर (बिहार) - 843119
                </div>
              </div>

              {/* PHOTO CIRCLE + NAME + ROLE */}
              <div className="flex flex-col items-center my-auto py-1">
                {/* Interactive Photo Circle (Direct click to upload without URL) */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group cursor-pointer"
                  title="पहचान पत्र पर सीधे फोटो अपलोड करें (बिना URL)"
                >
                  <div className="w-24 h-24 rounded-full border-3 border-[#FFD700] p-1 bg-gradient-to-b from-amber-200 to-amber-400 shadow-xl overflow-hidden ring-4 ring-black/30 relative">
                    <img
                      src={
                        activeStaff.photoUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                      }
                      alt={activeStaff.name}
                      className="w-full h-full object-cover rounded-full"
                    />

                    {/* Camera Overlay on Hover (Hidden on print) */}
                    <div className="no-print absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity rounded-full">
                      <Camera className="w-5 h-5 text-[#FFD700]" />
                      <span className="text-[9px] font-bold mt-0.5 text-center leading-tight">
                        फोटो बदलें
                      </span>
                    </div>
                  </div>

                  {/* Camera Icon Floating Button (Hidden on print) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="no-print absolute -top-1 -right-1 p-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white border-2 border-white shadow-lg cursor-pointer transition hover:scale-110 active:scale-95"
                    title="सीधे फोटो अपलोड करें (बिना URL)"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>

                  {/* Verified checkmark badge */}
                  <div className="absolute bottom-0 right-0 p-1 rounded-full bg-emerald-600 text-white border-2 border-white shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Direct tap hint under photo on screen (Hidden on print) */}
                <div className="no-print mt-1 text-[8px] text-amber-300/80 tracking-wide font-medium flex items-center gap-1 cursor-pointer hover:underline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-2.5 h-2.5" />
                  <span>फोटो बदलने के लिए टैप करें</span>
                </div>

                {/* Name */}
                <div className="text-lg font-black font-heading text-white mt-1 leading-tight tracking-wide text-center">
                  {activeStaff.name}
                </div>

                {/* Role Badge: Cash Counter */}
                <div className="mt-1 px-3.5 py-0.5 rounded-full bg-gradient-to-r from-[#FFD700] to-amber-500 text-stone-950 text-[11px] font-black uppercase tracking-wider shadow-md border border-amber-300">
                  {getRoleLabel(activeStaff.role)}
                </div>
              </div>

              {/* STAFF DETAILS CARD */}
              <div className="bg-black/35 rounded-2xl p-3 text-[11px] space-y-1.5 border border-amber-400/30 backdrop-blur-xs font-medium">
                <div className="flex justify-between items-center pb-1 border-b border-white/10">
                  <span className="text-amber-200/90">आईडी (Staff ID):</span>
                  <span className="font-mono font-black text-[#FFD700] text-xs tracking-wider">
                    {activeStaff.id}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-1 border-b border-white/10">
                  <span className="text-amber-200/90">मोबाइल (Mobile):</span>
                  <span className="font-mono font-bold text-white tracking-wide">
                    +91 {activeStaff.mobile}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-1 border-b border-white/10">
                  <span className="text-amber-200/90">शामिल दिनांक:</span>
                  <span className="font-bold text-stone-200">
                    {activeStaff.joinDate || '15-01-2025'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-amber-200/90">प्राधिकार:</span>
                  <span className="text-emerald-300 font-extrabold flex items-center gap-1 text-[10px]">
                    <ShieldCheck className="w-3 h-3" /> अधिकृत सेवादार
                  </span>
                </div>
              </div>

              {/* FRONT BOTTOM FOOTER */}
              <div className="pt-2 text-center border-t border-[#FFD700]/30 mt-1">
                <div className="text-[8.5px] font-extrabold uppercase tracking-widest text-[#FFD700]">
                  ★ अधिकृत सेवक पहचान पत्र ★
                </div>
                <div className="text-[7.5px] text-amber-200/80">
                  Official Identity Card • Maa Jagdamba Sthan Trust
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* BACK SIDE CARD (Maroon Temple Theme)                       */}
          {/* ========================================================== */}
          {(activeSide === 'both' || activeSide === 'back') && (
            <div className="w-[310px] sm:w-[325px] h-[510px] rounded-3xl bg-gradient-to-b from-[#660000] via-[#7a0000] to-[#4d0000] text-white p-4 shadow-2xl border-4 border-[#FFD700] relative overflow-hidden flex flex-col justify-between shrink-0 select-none">
              {/* Lanyard Hole Punch Slot Indicator (Decorative) */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-black/40 border border-amber-300/30"></div>

              {/* Decorative Corner Ornaments */}
              <div className="absolute top-1 left-1 text-[10px] text-[#FFD700]/40">❖</div>
              <div className="absolute top-1 right-1 text-[10px] text-[#FFD700]/40">❖</div>
              <div className="absolute bottom-1 left-1 text-[10px] text-[#FFD700]/40">❖</div>
              <div className="absolute bottom-1 right-1 text-[10px] text-[#FFD700]/40">❖</div>

              {/* BACK HEADER WITH TEMPLE ADDRESS */}
              <div className="pt-2 text-center border-b border-[#FFD700]/40 pb-2">
                <div className="text-[10px] text-amber-300 font-bold tracking-wider font-heading">
                  माँ जगदंबा स्थान न्यास समिति
                </div>
                <div className="text-[8.5px] text-amber-100 font-medium mt-0.5 leading-snug">
                  मथुरापुर, कांटी, मुजफ्फरपुर, बिहार - 843119
                </div>
                <div className="text-[7.5px] text-amber-200/90 font-mono mt-0.5">
                  हेल्पलाइन: +91 9709168876 | ma-jagdamba-sthan.ai.studio
                </div>
              </div>

              {/* 4 GUIDELINES IN HINDI */}
              <div className="my-auto py-1.5">
                <div className="flex items-center gap-1.5 mb-1.5 px-1">
                  <Sparkles className="w-3 h-3 text-[#FFD700]" />
                  <span className="text-[10px] font-bold text-[#FFD700] uppercase tracking-wider font-heading">
                    नियम एवं निर्देश (Guidelines)
                  </span>
                </div>

                <div className="bg-black/35 rounded-2xl p-2.5 space-y-1.5 border border-amber-400/30 text-left">
                  {/* Guideline 1 */}
                  <div className="flex items-start gap-1.5 text-[9px] text-stone-100 leading-tight">
                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#FFD700] text-stone-950 font-black text-[8px] shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      यह पहचान पत्र माँ जगदंबा स्थान न्यास समिति द्वारा अधिकृत है।
                    </span>
                  </div>

                  {/* Guideline 2 */}
                  <div className="flex items-start gap-1.5 text-[9px] text-stone-100 leading-tight">
                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#FFD700] text-stone-950 font-black text-[8px] shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      चंदा संग्रह के समय भक्त को आधिकारिक डिजिटल रसीद तुरंत प्रदान करना अनिवार्य है।
                    </span>
                  </div>

                  {/* Guideline 3 */}
                  <div className="flex items-start gap-1.5 text-[9px] text-stone-100 leading-tight">
                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#FFD700] text-stone-950 font-black text-[8px] shrink-0 mt-0.5">
                      3
                    </span>
                    <span>
                      पहचान पत्र अहस्तांतरणीय (Non-transferable) है एवं खो जाने पर तुरंत सूचित करें।
                    </span>
                  </div>

                  {/* Guideline 4 */}
                  <div className="flex items-start gap-1.5 text-[9px] text-stone-100 leading-tight">
                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#FFD700] text-stone-950 font-black text-[8px] shrink-0 mt-0.5">
                      4
                    </span>
                    <span>
                      मंदिर मर्यादा, सत्यनिष्ठा एवं अनुशासन का सदैव निष्ठापूर्वक पालन करें।
                    </span>
                  </div>
                </div>
              </div>

              {/* BOTTOM SECTION: LEFT QR SCAN TO VERIFY + RIGHT ROUND TEMPLE STAMP ONLY */}
              <div className="pt-2 border-t border-[#FFD700]/30 grid grid-cols-2 gap-2 items-center bg-black/25 rounded-2xl p-2.5 border border-white/10">
                {/* LEFT: QR SCAN TO VERIFY */}
                <div className="flex flex-col items-center text-center pr-2 border-r border-[#FFD700]/30">
                  <div className="text-[8.5px] font-black uppercase text-[#FFD700] tracking-wider mb-1 flex items-center gap-0.5 font-heading">
                    <QrIcon className="w-2.5 h-2.5" />
                    <span>QR SCAN TO VERIFY</span>
                  </div>

                  {/* QR Image */}
                  <div className="bg-white p-1 rounded-xl border-2 border-[#FFD700] shadow-md">
                    {qrUrl ? (
                      <img
                        src={qrUrl}
                        alt="Scan to Verify"
                        className="w-[66px] h-[66px] object-contain"
                      />
                    ) : (
                      <div className="w-[66px] h-[66px] bg-stone-100 flex items-center justify-center text-[8px] text-stone-500">
                        QR Code
                      </div>
                    )}
                  </div>

                  <div className="text-[7.5px] text-amber-200 mt-1 font-medium leading-none">
                    स्कैन कर अधिकृतता जाँचें
                  </div>
                  <div className="text-[6.5px] font-mono text-amber-300/80 truncate max-w-[110px] mt-0.5">
                    ma-jagdamba-sthan.ai.studio
                  </div>
                </div>

                {/* RIGHT: ONLY ROUND TEMPLE STAMP "MJS TRUST" WITH "अधिकृत हस्ताक्षरकर्ता" TEXT */}
                {/* STRICT REQUIREMENT: NO name Shashi Ranjan, ONLY stamp. */}
                <div className="flex flex-col items-center justify-center text-center pl-1">
                  <RoundTempleStamp size={88} />
                </div>
              </div>

              {/* BACK BOTTOM STRIP */}
              <div className="pt-1.5 text-center mt-1">
                <div className="text-[7px] text-amber-200/80 tracking-wider">
                  यदि यह पहचान पत्र मिले तो कृपया माँ जगदंबा स्थान ट्रस्ट कार्यालय में लौटा दें।
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions (Hidden on print) */}
        <div className="no-print p-4 bg-stone-950 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-300">
          <div className="text-xs text-stone-400 text-center sm:text-left">
            💡 प्रिंट बटन दबाकर कार्ड को सीधे A4 पेपर या PVC कार्ड प्रिंटर पर निकाल सकते हैं।
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#7a0000] hover:bg-[#990000] text-[#FFD700] font-bold text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer transition"
            >
              <Printer className="w-4 h-4" />
              <span>प्रिंट करें (Print Front & Back)</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs cursor-pointer transition text-center"
            >
              बंद करें (Close)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
