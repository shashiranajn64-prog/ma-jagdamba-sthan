import React, { useState } from 'react';
import { TempleConfig, Donation } from '../types';
import { templeStore } from '../services/store';
import { HeartHandshake, CheckCircle2, Copy, Check, Upload, Smartphone, ArrowLeft, ShieldCheck, Heart, Sparkles, AlertCircle } from 'lucide-react';
import { KalashIcon } from './TempleIcons';

interface DonationPageProps {
  config: TempleConfig;
  onNavigateHome: () => void;
}

const PRESET_AMOUNTS = [51, 101, 251, 501, 1100];

export const DonationPage: React.FC<DonationPageProps> = ({ config, onNavigateHome }) => {
  // Step: 1 = Form, 2 = QR & Screenshot, 3 = Confirmation
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form fields
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [amount, setAmount] = useState<number | ''>(501);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [sankalp, setSankalp] = useState('मंदिर निर्माण एवं सामान्य सेवा');
  const [gotra, setGotra] = useState('');
  const [city, setCity] = useState('');

  // Step 2 fields
  const [screenshotUrl, setScreenshotUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdDonation, setCreatedDonation] = useState<Donation | null>(null);
  const [formError, setFormError] = useState('');

  // Handle Preset vs Custom
  const handleSelectPreset = (val: number) => {
    setIsCustom(false);
    setAmount(val);
    setCustomAmount('');
    setFormError('');
  };

  const handleSelectCustom = () => {
    setIsCustom(true);
    setAmount(customAmount ? Number(customAmount) : '');
  };

  const handleCustomChange = (val: string) => {
    setCustomAmount(val);
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      setAmount(num);
    } else {
      setAmount('');
    }
  };

  // Step 1 Validation & Proceed
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('कृपया अपना नाम दर्ज करें।');
      return;
    }
    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setFormError('कृपया 10 अंकों का वैध व्हाट्सएप मोबाइल नंबर दर्ज करें।');
      return;
    }
    const numericAmount = isCustom ? Number(customAmount) : Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setFormError('कृपया वैध दान राशि चुनें अथवा दर्ज करें।');
      return;
    }

    setStep(2);
  };

  // Copy helper
  const handleCopy = (text: string, type: 'upi' | 'amount') => {
    navigator.clipboard.writeText(text);
    if (type === 'upi') {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  // Screenshot Upload (FileReader)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('फ़ोटो का आकार 8MB से कम होना चाहिए');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Step 2 Submission (Verification ke liye bhejein)
  const handleSubmitVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshotUrl) {
      alert('कृपया भुगतान का स्क्रीनशॉट अपलोड करें!');
      return;
    }

    setSubmitting(true);
    try {
      const finalAmount = isCustom ? Number(customAmount) : Number(amount);
      const newRecord = templeStore.addOnlineDonation({
        name,
        mobile,
        amount: finalAmount,
        screenshotUrl,
        sankalp,
        gotra,
        city,
      });
      setCreatedDonation(newRecord);
      setStep(3);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error submitting donation');
    } finally {
      setSubmitting(false);
    }
  };

  const finalAmount = isCustom ? Number(customAmount) : Number(amount);
  const upiPayLink = `upi://pay?pa=${config.upiId}&pn=${encodeURIComponent(
    'Maa Jagdamba Sthan Trust'
  )}&am=${finalAmount}&cu=INR&tn=${encodeURIComponent('Temple Donation ' + name)}`;

  // Dynamic QR generator URL matching user's selected amount
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
    upiPayLink
  )}`;

  return (
    <div className="min-h-screen bg-amber-50/60 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-[#7a0000] text-xs font-bold border border-amber-300">
            <KalashIcon className="w-4 h-4 text-[#7a0000]" />
            <span>माँ जगदम्बा स्थान - पावन समर्पण</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-stone-900">
            ऑनलाइन मंदिर दान एवं सहयोग
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm">
            100% निःशुल्क सेवा • सीधे मंदिर ट्रस्ट के खाते में • तुरंत डिजिटल पावती
          </p>
        </div>

        {/* Progress Bar Steps */}
        <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-2xl border border-amber-200 shadow-xs text-xs font-bold text-center">
          <div
            className={`py-2 rounded-xl transition ${
              step >= 1 ? 'bg-[#7a0000] text-white shadow-xs' : 'text-stone-400'
            }`}
          >
            1. विवरण एवं राशि
          </div>
          <div
            className={`py-2 rounded-xl transition ${
              step >= 2 ? 'bg-[#7a0000] text-white shadow-xs' : 'text-stone-400'
            }`}
          >
            2. QR & स्क्रीनशॉट
          </div>
          <div
            className={`py-2 rounded-xl transition ${
              step === 3 ? 'bg-[#ff9933] text-stone-950 shadow-xs' : 'text-stone-400'
            }`}
          >
            3. सत्यापन एवं रसीद
          </div>
        </div>

        {/* STEP 1: FORM */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border-2 border-amber-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#7a0000] via-[#ff9933] to-[#FFD700]" />

            <form onSubmit={handleProceedToPayment} className="space-y-6">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Devotee Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  भक्त का पूरा नाम <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा: रमेश कुमार पोद्दार"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#7a0000] focus:border-[#7a0000] outline-hidden text-stone-900 font-medium bg-amber-50/20 text-sm sm:text-base"
                />
              </div>

              {/* WhatsApp Mobile */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  व्हाट्सएप मोबाइल नंबर <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-stone-500 text-sm font-bold">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10 अंकों का व्हाट्सएप नंबर"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full pl-14 pr-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#7a0000] focus:border-[#7a0000] outline-hidden text-stone-900 font-medium bg-amber-50/20 text-sm sm:text-base font-mono"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  * इसी व्हाट्सएप नंबर पर मंदिर की आधिकारिक रसीद भेजी जाएगी।
                </p>
              </div>

              {/* Rashi Buttons [51, 101, 251, 501, 1100, Custom] */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  सहयोग राशि (₹) चुनें <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {PRESET_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleSelectPreset(val)}
                      className={`py-3 rounded-xl font-bold text-sm sm:text-base transition cursor-pointer border-2 ${
                        !isCustom && amount === val
                          ? 'bg-[#7a0000] text-white border-[#7a0000] shadow-md scale-102'
                          : 'bg-amber-50/70 text-stone-800 border-amber-200 hover:border-amber-400 hover:bg-amber-100'
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleSelectCustom}
                    className={`py-3 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer border-2 ${
                      isCustom
                        ? 'bg-[#ff9933] text-stone-950 border-[#ff9933] shadow-md'
                        : 'bg-amber-50/70 text-stone-800 border-amber-200 hover:border-amber-400'
                    }`}
                  >
                    Custom (अन्य)
                  </button>
                </div>

                {/* Custom Amount Input if selected */}
                {isCustom && (
                  <div className="mt-3 animate-in fade-in">
                    <label className="block text-xs text-stone-600 mb-1 font-medium">
                      अपनी इच्छानुसार राशि दर्ज करें:
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-stone-600 font-bold">₹</span>
                      <input
                        type="number"
                        min="1"
                        placeholder="उदा: 2100"
                        value={customAmount}
                        onChange={(e) => handleCustomChange(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-[#ff9933] text-stone-900 font-bold text-base outline-hidden bg-white"
                        autoFocus
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Sankalp / Category (Devotional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    दान का संकल्प / उद्देश्य
                  </label>
                  <select
                    value={sankalp}
                    onChange={(e) => setSankalp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-medium text-stone-800 bg-white outline-hidden focus:ring-2 focus:ring-[#7a0000]"
                  >
                    <option value="मंदिर निर्माण एवं सामान्य सेवा">मंदिर निर्माण एवं सामान्य सेवा</option>
                    <option value="माँ जगदम्बा श्रृंगार व चोला">माँ जगदम्बा श्रृंगार व चोला</option>
                    <option value="अखंड ज्योति एवं घी सेवा">अखंड ज्योति एवं घी सेवा</option>
                    <option value="नित्य महाप्रसाद एवं भंडारा">नित्य महाप्रसाद एवं भंडारा</option>
                    <option value="गौ-माता सेवा एवं चारा">गौ-माता सेवा एवं चारा</option>
                    <option value="नवरात्र विशेष शतचंडी यज्ञ">नवरात्र विशेष शतचंडी यज्ञ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    शहर / गांव (City / Town)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा: मुजफ्फरपुर / पटना"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-800 bg-white outline-hidden focus:ring-2 focus:ring-[#7a0000]"
                  />
                </div>
              </div>

              {/* Submit to Step 2 */}
              <button
                type="submit"
                className="w-full py-4 rounded-xl font-extrabold text-base sm:text-lg bg-gradient-to-r from-[#7a0000] via-[#990000] to-[#7a0000] hover:from-[#990000] hover:to-[#7a0000] text-[#FFD700] shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-[#FFD700]/50"
              >
                <HeartHandshake className="w-5 h-5" />
                <span>दान करें (Dan Karein) • ₹{finalAmount || 0}</span>
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: SHOW TEMPLE UPI QR + UPI ID [COPY] + AMOUNT [COPY] + SCREENSHOT UPLOAD (NO UTR FIELD) */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border-2 border-amber-300 relative space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-stone-600 hover:text-[#7a0000] flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>विवरण बदलें (Back)</span>
              </button>
              <span className="text-xs font-bold text-[#7a0000] bg-amber-100 px-3 py-1 rounded-full">
                चरण 2: भुगतान एवं स्क्रीनशॉट
              </span>
            </div>

            {/* Devotee quick badge */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
              <div>
                <span className="text-stone-500">दानदाता: </span>
                <span className="font-bold text-stone-900">{name}</span>
                <span className="text-stone-400 mx-2">•</span>
                <span className="text-stone-500">मो: </span>
                <span className="font-mono font-bold text-stone-900">{mobile}</span>
              </div>
              <div className="font-extrabold text-base text-[#7a0000]">
                कुल राशि: ₹{finalAmount}
              </div>
            </div>

            {/* UPI QR & Payment Box */}
            <div className="bg-gradient-to-b from-amber-50 to-amber-100/60 p-6 rounded-2xl border-2 border-amber-300 text-center space-y-4">
              <div className="text-sm font-bold text-[#7a0000] uppercase tracking-wide">
                माँ जगदम्बा स्थान ट्रस्ट - आधिकारिक UPI QR कोड
              </div>

              {/* QR Image with Golden Border */}
              <div className="inline-block p-3 rounded-2xl bg-white shadow-xl border-4 border-[#FFD700]">
                <img
                  src={qrCodeUrl}
                  alt="Temple UPI QR Code"
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto"
                />
                <div className="text-[11px] font-bold text-stone-600 mt-2 font-mono">
                  राशि सेट: ₹{finalAmount}
                </div>
              </div>

              {/* Text instruction */}
              <div className="text-sm font-bold text-stone-800">
                "PhonePe / GPay / Paytm से भुगतान करें"
              </div>

              {/* Copy UPI ID and Copy Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                <div className="p-3 rounded-xl bg-white border border-amber-300 flex items-center justify-between text-xs">
                  <div className="text-left overflow-hidden mr-2">
                    <div className="text-stone-400 text-[10px]">मंदिर UPI ID</div>
                    <div className="font-mono font-bold text-stone-900 truncate">
                      {config.upiId}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(config.upiId, 'upi')}
                    className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-stone-900 font-bold flex items-center gap-1 cursor-pointer shrink-0 transition"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUpi ? 'कॉपी हुआ' : 'Copy'}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-white border border-amber-300 flex items-center justify-between text-xs">
                  <div className="text-left mr-2">
                    <div className="text-stone-400 text-[10px]">दान राशि</div>
                    <div className="font-mono font-bold text-[#7a0000] text-sm">
                      ₹{finalAmount}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(String(finalAmount), 'amount')}
                    className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-stone-900 font-bold flex items-center gap-1 cursor-pointer shrink-0 transition"
                  >
                    {copiedAmount ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAmount ? 'कॉपी हुआ' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Mobile App Intent button for direct app payment on phone */}
              <div className="pt-2">
                <a
                  href={upiPayLink}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md cursor-pointer transition"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>सीधे UPI ऐप खोलें (PhonePe/GPay/Paytm)</span>
                </a>
              </div>
            </div>

            {/* ONLY 1 FIELD: Payment Screenshot Upload * (NO UTR FIELD AT ALL) */}
            <form onSubmit={handleSubmitVerification} className="space-y-4 pt-2">
              <div className="p-5 rounded-2xl border-2 border-dashed border-[#7a0000]/60 bg-amber-50/40">
                <div className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-red-100 text-[#7a0000] flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-bold text-stone-900">
                      भुगतान का स्क्रीनशॉट अपलोड करें <span className="text-red-600">*</span>
                    </div>
                    <p className="text-xs text-stone-500">
                      (Google Pay, PhonePe, Paytm या बैंक ऐप का सफल भुगतान स्क्रीनशॉट चुनें)
                    </p>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    required
                    id="screenshotInput"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div className="pt-2">
                    <label
                      htmlFor="screenshotInput"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-bold cursor-pointer transition shadow"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{screenshotUrl ? 'स्क्रीनशॉट बदलें' : 'फ़ोटो / स्क्रीनशॉट चुनें'}</span>
                    </label>
                  </div>

                  {screenshotUrl && (
                    <div className="mt-4 p-3 bg-white rounded-xl border border-green-300 max-w-xs mx-auto">
                      <div className="text-xs font-bold text-green-700 mb-1 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>स्क्रीनशॉट सफलतापूर्वक चुना गया</span>
                      </div>
                      <img
                        src={screenshotUrl}
                        alt="Payment Screenshot Preview"
                        className="w-full h-44 object-contain rounded-lg border border-stone-200"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !screenshotUrl}
                className="w-full py-4 rounded-xl font-extrabold text-base sm:text-lg bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span>सत्यापन के लिए भेजा जा रहा है...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 text-amber-300" />
                    <span>सत्यापन के लिए भेजें (Verification Ke Liye Bhejein)</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: CONFIRMATION & "Admin verification ke baad WhatsApp par raseed milegi" */}
        {step === 3 && (
          <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-2xl border-2 border-emerald-400 text-center space-y-6 animate-in fade-in zoom-in-95">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center ring-8 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full inline-block border border-emerald-200">
                सफलतापूर्वक प्राप्त हुआ
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-stone-900">
                🙏 जय माँ जगदम्बा! धन्यवाद {name} जी
              </h2>
            </div>

            {/* MANDATORY MESSAGE FROM USER BRIEF */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 max-w-lg mx-auto text-center space-y-2">
              <div className="text-base sm:text-lg font-bold text-[#7a0000]">
                "Admin verification ke baad WhatsApp par raseed milegi"
              </div>
              <p className="text-xs text-stone-600">
                आपके द्वारा जमा की गई राशि ₹{finalAmount} का स्क्रीनशॉट मंदिर ट्रस्ट को प्राप्त हो गया है। एडमिन द्वारा सत्यापन होते ही आपके व्हाट्सएप नंबर ({mobile}) पर आधिकारिक डिजिटल रसीद प्रेषित कर दी जाएगी।
              </p>
            </div>

            {/* Details Summary */}
            {createdDonation && (
              <div className="max-w-md mx-auto p-4 rounded-xl bg-stone-50 border border-stone-200 text-left text-xs sm:text-sm space-y-2">
                <div className="flex justify-between py-1 border-b border-stone-200">
                  <span className="text-stone-500">रेफरेंस ID:</span>
                  <span className="font-mono font-bold text-stone-800">{createdDonation.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-200">
                  <span className="text-stone-500">दान राशि:</span>
                  <span className="font-bold text-[#7a0000]">₹{createdDonation.amount}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-200">
                  <span className="text-stone-500">स्थिति (Status):</span>
                  <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    सत्यापन प्रतीक्षारत (PENDING)
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-500">तारीख:</span>
                  <span className="font-mono text-stone-800">{createdDonation.date}</span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={onNavigateHome}
                className="px-6 py-3 rounded-xl bg-[#7a0000] hover:bg-[#990000] text-[#FFD700] font-bold text-sm shadow cursor-pointer transition"
              >
                मुख्य पृष्ठ पर जाएं (Go Home)
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setName('');
                  setMobile('');
                  setScreenshotUrl('');
                  setCreatedDonation(null);
                }}
                className="px-6 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-sm cursor-pointer transition"
              >
                अन्य दान करें (New Donation)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
