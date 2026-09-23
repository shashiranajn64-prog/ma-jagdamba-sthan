import React, { useState, useEffect } from 'react';
import { Staff, Donation, Notice } from '../types';
import { templeStore, WEBSITE_URL } from '../services/store';
import {
  Users,
  Wallet,
  Calendar,
  Printer,
  Share2,
  IdCard,
  KeyRound,
  FilePlus,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  ArrowLeft,
  Send,
  Sparkles,
  Camera,
} from 'lucide-react';
import { StaffIdCard } from './StaffIdCard';
import { OfficialReceipt } from './OfficialReceipt';
import { GalleryManager } from './GalleryManager';
import { processImageFile } from '../utils/imageUtils';

interface StaffPanelProps {
  currentStaff: Staff;
  onLogout: () => void;
  onViewReceipt: (donation: Donation) => void;
}

export const StaffPanel: React.FC<StaffPanelProps> = ({
  currentStaff,
  onLogout,
  onViewReceipt,
}) => {
  const [activeTab, setActiveTab] = useState<'collection' | 'receipts' | 'addNotice' | 'gallery' | 'settings'>('collection');
  const [, setTick] = useState(0);
  const [showIdCard, setShowIdCard] = useState(false);
  const [staffData, setStaffData] = useState<Staff>(
    () => templeStore.getStaffById(currentStaff.id) || currentStaff
  );
  const profileFileInputRef = React.useRef<HTMLInputElement>(null);
  const [photoSuccessMsg, setPhotoSuccessMsg] = useState('');

  // Subscribe to live store updates across tabs & actions
  useEffect(() => {
    const syncStaff = () => {
      const fresh = templeStore.getStaffById(currentStaff.id);
      if (fresh) {
        setStaffData(fresh);
      }
      setTick((t) => t + 1);
    };
    const unsub = templeStore.subscribe(syncStaff);
    window.addEventListener('mjs_store_change', syncStaff);
    return () => {
      unsub();
      window.removeEventListener('mjs_store_change', syncStaff);
    };
  }, [currentStaff.id]);

  // Handle direct photo upload from device/camera without URL
  const handleProfilePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64Data = await processImageFile(file, 400, 0.85);
      templeStore.updateStaff(staffData.id, { photoUrl: base64Data });

      const updated = { ...staffData, photoUrl: base64Data };
      setStaffData(updated);
      currentStaff.photoUrl = base64Data;

      setPhotoSuccessMsg('पहचान पत्र एवं प्रोफाइल फोटो सफलतापूर्वक अपडेट हो गई!');
      setTimeout(() => setPhotoSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'फोटो प्रोसेस करने में समस्या आई।');
    } finally {
      if (profileFileInputRef.current) {
        profileFileInputRef.current.value = '';
      }
    }
  };

  // New Cash Chanda Form State
  const [bhaktName, setBhaktName] = useState('');
  const [bhaktMobile, setBhaktMobile] = useState('');
  const [bhaktAmount, setBhaktAmount] = useState<number | ''>(501);
  const [bhaktSankalp, setBhaktSankalp] = useState('मंदिर निर्माण एवं सामान्य सेवा');
  const [bhaktCity, setBhaktCity] = useState('');
  const [formSuccess, setFormSuccess] = useState<Donation | null>(null);
  const [formError, setFormError] = useState('');

  // Change Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add Notice State
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeDetails, setNoticeDetails] = useState('');
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);

  // Receipts search
  const [receiptSearch, setReceiptSearch] = useState('');

  // Stats
  const stats = templeStore.getStaffStats(currentStaff.id);
  const myReceipts = templeStore.getStaffReceipts(currentStaff.id);

  // Filtered receipts
  const filteredReceipts = myReceipts.filter(
    (r) =>
      r.name.toLowerCase().includes(receiptSearch.toLowerCase()) ||
      r.receiptNo?.toLowerCase().includes(receiptSearch.toLowerCase()) ||
      r.mobile.includes(receiptSearch)
  );

  // Handle New Cash Chanda
  const handleCreateCashDonation = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(null);

    if (!bhaktName.trim()) {
      setFormError('कृपया भक्त का नाम दर्ज करें।');
      return;
    }
    const cleanMobile = bhaktMobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setFormError('कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।');
      return;
    }
    const numAmount = Number(bhaktAmount);
    if (!numAmount || numAmount <= 0) {
      setFormError('कृपया वैध दान राशि दर्ज करें।');
      return;
    }

    try {
      const { donation } = templeStore.addCashDonation({
        name: bhaktName,
        mobile: cleanMobile,
        amount: numAmount,
        staffId: currentStaff.id,
        staffName: currentStaff.name,
        sankalp: bhaktSankalp,
        city: bhaktCity,
      });

      setFormSuccess(donation);
      setBhaktName('');
      setBhaktMobile('');
      setBhaktAmount(501);
      setBhaktCity('');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error creating receipt');
    }
  };

  // Handle Password Change
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    const freshStaff = templeStore.getStaffById(currentStaff.id);
    const activeCurrentPass = freshStaff?.password || currentStaff.password;

    if (oldPassword !== activeCurrentPass) {
      setPasswordMsg({ type: 'error', text: 'वर्तमान पासवर्ड गलत है!' });
      return;
    }
    if (newPassword.length < 4) {
      setPasswordMsg({ type: 'error', text: 'नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।' });
      return;
    }
    if (newPassword !== confirmNewPass) {
      setPasswordMsg({ type: 'error', text: 'नया पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते!' });
      return;
    }
    if (newPassword === activeCurrentPass) {
      setPasswordMsg({ type: 'error', text: 'नया पासवर्ड वर्तमान पासवर्ड से अलग होना चाहिए।' });
      return;
    }

    templeStore.updateStaff(currentStaff.id, { password: newPassword });
    currentStaff.password = newPassword;
    setPasswordMsg({ type: 'success', text: 'पासवर्ड सफलतापूर्वक बदल दिया गया है!' });
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPass('');
  };

  // Handle Staff Notice Submission
  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeDetails.trim()) return;

    const today = new Date().toISOString().split('T')[0];
    templeStore.addNotice({
      title: noticeTitle,
      details: noticeDetails,
      date: today,
      addedBy: currentStaff.name,
      addedByRole: 'Staff',
      status: 'PENDING', // Sent to Admin for approval
    });

    setNoticeMsg('सूचना सफलतापूर्वक दर्ज हुई। एडमिन अनुमोदन के पश्चात यह होम पेज पर दिखेगी।');
    setNoticeTitle('');
    setNoticeDetails('');
    setTimeout(() => setNoticeMsg(null), 4000);
  };

  return (
    <div className="min-h-screen bg-stone-100/70 py-8 px-4 sm:px-6 lg:px-8">
      {/* Hidden file input for direct photo upload from camera/gallery */}
      <input
        ref={profileFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleProfilePhotoFileChange}
      />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Staff Header Card */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white rounded-3xl p-6 shadow-xl border-2 border-blue-400/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Interactive Photo Avatar (Click to upload directly without URL) */}
            <div
              onClick={() => profileFileInputRef.current?.click()}
              className="relative group cursor-pointer shrink-0"
              title="पहचान पत्र हेतु सीधे फोटो अपलोड करें (बिना URL)"
            >
              <img
                src={
                  staffData.photoUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                }
                alt={staffData.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#FFD700] shadow-md ring-2 ring-white/30"
              />
              {/* Hover overlay with camera icon */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-full flex flex-col items-center justify-center transition text-[#FFD700]">
                <Camera className="w-5 h-5" />
                <span className="text-[8px] font-bold text-white mt-0.5">बदलें</span>
              </div>
              {/* Badge Button */}
              <button
                type="button"
                className="absolute -bottom-1 -right-1 p-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full border border-white shadow-md cursor-pointer transition hover:scale-110"
                title="फोटो अपलोड करें"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-heading text-white">
                  {staffData.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ff9933] text-stone-950">
                  {staffData.role}
                </span>
              </div>
              <div className="text-xs text-blue-200 mt-1 flex flex-wrap gap-x-3">
                <span className="font-mono">ID: {staffData.id}</span>
                <span>•</span>
                <span>मो: +91 {staffData.mobile}</span>
                <span>•</span>
                <span>माँ जगदंबा स्थान, मथुरापुर</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Direct Photo Upload Button */}
            <button
              onClick={() => profileFileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs sm:text-sm font-bold border border-amber-300 flex items-center gap-1.5 cursor-pointer transition shadow hover:scale-102"
              title="मोबाइल गैलरी या कैमरा से सीधे फोटो अपलोड करें (बिना URL)"
            >
              <Camera className="w-4 h-4 text-stone-950" />
              <span>📷 फोटो बदलें (Upload Photo)</span>
            </button>

            <button
              onClick={() => setShowIdCard(true)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#FFD700] text-xs sm:text-sm font-bold border border-[#FFD700]/60 flex items-center gap-1.5 cursor-pointer transition shadow"
            >
              <IdCard className="w-4 h-4" />
              <span>ID Card डाउनलोड / देखें</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3.5 py-2 rounded-xl bg-red-600/80 hover:bg-red-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer transition shadow"
            >
              <LogOut className="w-4 h-4" />
              <span>लॉगआउट</span>
            </button>
          </div>
        </div>

        {/* Photo Upload Success Alert */}
        {photoSuccessMsg && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{photoSuccessMsg}</span>
          </div>
        )}

        {/* Dashboard 2 Stats Boxes for Staff */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Aaj Ka Collection */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center justify-between">
              <span>आज का नकद संग्रह (Today)</span>
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#7a0000] font-mono">
              ₹{stats.todayAmount.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-stone-500 mt-1">
              आज काटी गई रसीदें: <span className="font-bold text-stone-800">{stats.todayCount}</span>
            </div>
          </div>

          {/* Kul Collection */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center justify-between">
              <span>कुल नकद संग्रह (Lifetime)</span>
              <Wallet className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">
              ₹{stats.totalAmount.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-stone-500 mt-1">
              कुल रसीदें: <span className="font-bold text-stone-800">{stats.totalCount}</span>
            </div>
          </div>

          {/* Direct Quick Action: New Receipt */}
          <div
            onClick={() => setActiveTab('collection')}
            className="bg-gradient-to-tr from-[#7a0000] to-[#990000] text-white rounded-2xl p-5 shadow-md cursor-pointer hover:shadow-lg transition flex flex-col justify-between"
          >
            <div className="text-xs font-bold text-amber-200 uppercase tracking-wider">
              त्वरित कार्य
            </div>
            <div className="text-lg font-bold font-heading text-[#FFD700]">
              + नया नकद चंदा काटें
            </div>
            <div className="text-xs text-amber-100">
              भक्त को तुरंत रसीद व WhatsApp भेजें
            </div>
          </div>

          {/* ID Card Status */}
          <div
            onClick={() => setShowIdCard(true)}
            className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 cursor-pointer hover:border-blue-400 transition flex flex-col justify-between"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
              अधिकृत पहचान पत्र
            </div>
            <div className="text-base font-bold text-blue-700 flex items-center gap-1.5">
              <IdCard className="w-4 h-4" />
              <span>QR युक्त ID कार्ड</span>
            </div>
            <div className="text-xs text-emerald-600 font-semibold">
              ✓ मंदिर द्वारा प्रमाणित
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-white px-4 rounded-2xl shadow-xs overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('collection')}
            className={`py-3.5 px-4 font-bold text-xs sm:text-sm border-b-2 whitespace-nowrap cursor-pointer transition flex items-center gap-2 ${
              activeTab === 'collection'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>नकद चंदा काटें (Issue Cash Chanda)</span>
          </button>

          <button
            onClick={() => setActiveTab('receipts')}
            className={`py-3.5 px-4 font-bold text-xs sm:text-sm border-b-2 whitespace-nowrap cursor-pointer transition flex items-center gap-2 ${
              activeTab === 'receipts'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>मेरी काटी गई रसीदें ({myReceipts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('addNotice')}
            className={`py-3.5 px-4 font-bold text-xs sm:text-sm border-b-2 whitespace-nowrap cursor-pointer transition flex items-center gap-2 ${
              activeTab === 'addNotice'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <FilePlus className="w-4 h-4" />
            <span>सूचना भेजें (Notice)</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`py-3.5 px-4 font-bold text-xs sm:text-sm border-b-2 whitespace-nowrap cursor-pointer transition flex items-center gap-2 ${
              activeTab === 'gallery'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>फोटो गैलरी (Photo Gallery)</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3.5 px-4 font-bold text-xs sm:text-sm border-b-2 whitespace-nowrap cursor-pointer transition flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>पासवर्ड बदलें (Change Password)</span>
          </button>
        </div>

        {/* TAB 1: ISSUE CASH CHANDA FORM */}
        {activeTab === 'collection' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-stone-200">
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-stone-900">
                  माँ जगदम्बा स्थान - नकद चंदा पावती प्रपत्र
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  सेवक: <span className="font-bold text-stone-800">{currentStaff.name}</span> (ID: {currentStaff.id}) द्वारा अधिकृत संग्रह
                </p>
              </div>

              {formError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Success Card with Action to Print & WhatsApp */}
              {formSuccess && (
                <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>रसीद सफलतापूर्वक कट गई! रसीद संख्या: {formSuccess.receiptNo}</span>
                  </div>
                  <div className="text-xs text-stone-700">
                    दानदाता: <span className="font-bold">{formSuccess.name}</span> | राशि: <span className="font-bold text-[#7a0000]">₹{formSuccess.amount}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => onViewReceipt(formSuccess)}
                      className="px-4 py-2 rounded-xl bg-[#7a0000] hover:bg-[#990000] text-[#FFD700] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Eye className="w-4 h-4" />
                      <span>रसीद देखें एवं प्रिंट करें</span>
                    </button>
                    <a
                      href={`https://wa.me/91${formSuccess.mobile}?text=${encodeURIComponent(
                        `🙏 जय माँ जगदंबा 🙏\nप्रिय ${formSuccess.name} जी, आपका ₹${formSuccess.amount} नकद दान प्राप्त हुआ।\nरसीद: ${formSuccess.receiptNo}\nदिनांक: ${formSuccess.date}\nसेवक: ${currentStaff.name} - माँ जगदंबा स्थान ट्रस्ट\nरसीद: ${formSuccess.receiptLink}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>व्हाट्सएप पर रसीद भेजें</span>
                    </a>
                  </div>
                </div>
              )}

              <form onSubmit={handleCreateCashDonation} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    भक्त / दानदाता का नाम <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा: सीता राम गुप्ता"
                    value={bhaktName}
                    onChange={(e) => setBhaktName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm sm:text-base font-medium focus:ring-2 focus:ring-blue-600 outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                      व्हाट्सएप मोबाइल नंबर <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10 अंकों का मोबाइल नंबर"
                      value={bhaktMobile}
                      onChange={(e) => setBhaktMobile(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm sm:text-base font-mono focus:ring-2 focus:ring-blue-600 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                      दान राशि (₹) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="उदा: 501"
                      value={bhaktAmount}
                      onChange={(e) => setBhaktAmount(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm sm:text-base font-bold text-[#7a0000] focus:ring-2 focus:ring-blue-600 outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                      संकल्प / सेवा का नाम
                    </label>
                    <select
                      value={bhaktSankalp}
                      onChange={(e) => setBhaktSankalp(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl border border-stone-300 text-sm font-medium bg-white outline-hidden focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="मंदिर निर्माण एवं सामान्य सेवा">मंदिर निर्माण एवं सामान्य सेवा</option>
                      <option value="माँ जगदम्बा श्रृंगार व चोला">माँ जगदम्बा श्रृंगार व चोला</option>
                      <option value="अखंड ज्योति एवं घी सेवा">अखंड ज्योति एवं घी सेवा</option>
                      <option value="नित्य महाप्रसाद एवं भंडारा">नित्य महाप्रसाद एवं भंडारा</option>
                      <option value="गौ-माता सेवा एवं चारा">गौ-माता सेवा एवं चारा</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                      शहर / गांव (City / Town)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा: मुजफ्फरपुर"
                      value={bhaktCity}
                      onChange={(e) => setBhaktCity(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base shadow-lg cursor-pointer transition flex items-center justify-center gap-2"
                >
                  <Printer className="w-5 h-5 text-blue-200" />
                  <span>नकद रसीद काटें एवं जारी करें (₹{bhaktAmount || 0})</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: MY RECEIPTS LIST */}
        {activeTab === 'receipts' && (
          <div className="bg-white rounded-3xl p-6 shadow-md border border-stone-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold font-heading text-stone-900">
                  मेरे द्वारा काटी गई नकद रसीदें
                </h3>
                <p className="text-xs text-stone-500">
                  कुल रसीदें: {myReceipts.length} | कुल संग्रह: ₹{stats.totalAmount.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="रसीद संख्या या नाम खोजें..."
                  value={receiptSearch}
                  onChange={(e) => setReceiptSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-blue-600 outline-hidden"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-stone-100 text-stone-600 font-bold uppercase text-[11px] border-b border-stone-200">
                    <th className="py-3 px-4">दिनांक</th>
                    <th className="py-3 px-4">रसीद सं.</th>
                    <th className="py-3 px-4">भक्त का नाम</th>
                    <th className="py-3 px-4">मोबाइल</th>
                    <th className="py-3 px-4">राशि</th>
                    <th className="py-3 px-4 text-right">कार्य (Action)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {filteredReceipts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-500 text-xs">
                        कोई रसीद नहीं मिली।
                      </td>
                    </tr>
                  ) : (
                    filteredReceipts.map((r) => (
                      <tr key={r.id} className="hover:bg-amber-50/50 transition">
                        <td className="py-3 px-4 font-mono text-stone-600">{r.date}</td>
                        <td className="py-3 px-4 font-mono font-bold text-[#7a0000]">
                          {r.receiptNo || 'N/A'}
                        </td>
                        <td className="py-3 px-4 font-medium text-stone-900">{r.name}</td>
                        <td className="py-3 px-4 font-mono text-stone-700">{r.mobile}</td>
                        <td className="py-3 px-4 font-bold text-emerald-700 font-mono">
                          ₹{r.amount}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onViewReceipt(r)}
                            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1 shadow-xs"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>प्रिंट रसीद</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SUBMIT NOTICE FOR ADMIN APPROVAL */}
        {activeTab === 'addNotice' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-stone-200 max-w-xl mx-auto space-y-5">
            <div>
              <h3 className="text-xl font-bold font-heading text-stone-900">
                मंदिर सूचना प्रेषित करें
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                स्टाफ द्वारा प्रेषित सूचना एडमिन के पास अनुमोदन (Approval) हेतु जाएगी। अनुमोदन के बाद यह मुख्य पृष्ठ पर प्रदर्शित होगी।
              </p>
            </div>

            {noticeMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{noticeMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  सूचना का शीर्षक <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा: कल सायं विशेष दीपदान महोत्सव"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-blue-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  विस्तृत विवरण <span className="text-red-600">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="सूचना का पूरा विवरण लिखें..."
                  value={noticeDetails}
                  onChange={(e) => setNoticeDetails(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-blue-600 outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow cursor-pointer transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>एडमिन अनुमोदन हेतु भेजें</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: PHOTO GALLERY MANAGER (STAFF) */}
        {activeTab === 'gallery' && (
          <GalleryManager
            role="staff"
            staffName={currentStaff.name}
            onRefresh={() => setTick((t) => t + 1)}
          />
        )}

        {/* TAB 5: CHANGE OWN PASSWORD */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-stone-200 max-w-md mx-auto space-y-5">
            <div>
              <h3 className="text-xl font-bold font-heading text-stone-900">
                अपना पासवर्ड बदलें (Change Password)
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                स्टाफ ID: <span className="font-mono font-bold text-stone-800">{currentStaff.id}</span>
              </p>
            </div>

            {passwordMsg && (
              <div
                className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-center gap-2 ${
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-red-50 border-red-300 text-red-800'
                }`}
              >
                {passwordMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                )}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  वर्तमान पासवर्ड (Old Password) <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showOldPass ? 'text' : 'password'}
                    required
                    placeholder="वर्तमान पासवर्ड दर्ज करें"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 pr-10 py-2.5 rounded-xl border border-stone-300 text-sm outline-hidden focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  नया पासवर्ड (New Password) <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    placeholder="कम से कम 4 अक्षर का नया पासवर्ड"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 pr-10 py-2.5 rounded-xl border border-stone-300 text-sm outline-hidden focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  नए पासवर्ड की पुष्टि करें (Confirm New Password) <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="नया पासवर्ड दोबारा दर्ज करें"
                  value={confirmNewPass}
                  onChange={(e) => setConfirmNewPass(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm outline-hidden focus:ring-2 focus:ring-blue-600 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow cursor-pointer transition flex items-center justify-center gap-2 active:scale-98"
              >
                <KeyRound className="w-4 h-4" />
                <span>पासवर्ड अपडेट करें</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ID Card Modal */}
      {showIdCard && (
        <StaffIdCard
          staff={staffData}
          onClose={() => setShowIdCard(false)}
          onUpdateStaff={(updated) => {
            setStaffData(updated);
            currentStaff.photoUrl = updated.photoUrl;
            setTick((t) => t + 1);
          }}
        />
      )}
    </div>
  );
};
