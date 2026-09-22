import React, { useState } from 'react';
import { Donation, Staff, Notice, CalendarItem, TempleConfig } from '../types';
import { templeStore } from '../services/store';
import {
  exportDonationsToExcel,
  syncDonationToGoogleSheet,
  syncAllDonationsToGoogleSheet,
  GOOGLE_APPS_SCRIPT_TEMPLATE,
} from '../services/googleSheetSync';
import {
  Shield,
  Users,
  Wallet,
  Globe,
  Bell,
  QrCode,
  Calendar,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Edit,
  Eye,
  Share2,
  Printer,
  Plus,
  Lock,
  EyeOff,
  Search,
  ExternalLink,
  RotateCcw,
  Sparkles,
  LogOut,
  ArrowLeft,
  Image as ImageIcon,
  Download,
  FileSpreadsheet,
  Table,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { MandirSeal } from './TempleIcons';

interface AdminPanelProps {
  onLogout: () => void;
  onViewReceipt: (donation: Donation) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, onViewReceipt }) => {
  const [activeMenu, setActiveMenu] = useState<
    'dashboard' | 'online' | 'staff' | 'cash' | 'qr' | 'notices' | 'content' | 'sheet'
  >('dashboard');

  // Re-fetch trigger state
  const [, setTick] = useState(0);
  const rerender = () => setTick((t) => t + 1);

  // Core Data
  const donations = templeStore.getDonations();
  const staffList = templeStore.getStaffList();
  const notices = templeStore.getNotices();
  const calendar = templeStore.getCalendar();
  const config = templeStore.getConfig();
  const stats = templeStore.getDashboardStats();

  // Google Sheet & Excel Sync State
  const [googleSheetInput, setGoogleSheetInput] = useState(
    config.googleSheetUrl || 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit'
  );
  const [googleSheetWebhookInput, setGoogleSheetWebhookInput] = useState(config.googleSheetWebhookUrl || '');
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [syncToastMessage, setSyncToastMessage] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  // Handlers for Google Sheet & Excel
  const handleOpenGoogleSheet = () => {
    const currentConfig = templeStore.getConfig();
    const url = currentConfig.googleSheetUrl?.trim() || googleSheetInput.trim();
    if (url && url.startsWith('http')) {
      window.open(url, '_blank');
    } else {
      setActiveMenu('sheet');
      setSyncToastMessage('⚠️ कृपया पहले Google Sheet का लिंक सेट करें।');
      setTimeout(() => setSyncToastMessage(null), 4000);
    }
  };

  const handleDownloadExcel = (list?: Donation[], label = 'समस्त') => {
    const dataToExport = list || donations;
    if (dataToExport.length === 0) {
      alert('डाउनलोड के लिए कोई दान रिकॉर्ड उपलब्ध नहीं है।');
      return;
    }
    try {
      exportDonationsToExcel(dataToExport);
      setSyncToastMessage(`✅ ${label} ${dataToExport.length} दान का Excel (.xlsx) सफलतापूर्वक डाउनलोड हो गया!`);
      setTimeout(() => setSyncToastMessage(null), 4000);
    } catch (e) {
      alert('Excel डाउनलोड करने में त्रुटि आई। कृपया पुनः प्रयास करें।');
    }
  };

  const handleConnectSheet = () => {
    if (!googleSheetInput.trim().startsWith('http')) {
      alert('कृपया वैध Google Sheet URL दर्ज करें (जैसे: https://docs.google.com/spreadsheets/d/...)');
      return;
    }
    templeStore.updateConfig({
      googleSheetUrl: googleSheetInput.trim(),
      googleSheetWebhookUrl: googleSheetWebhookInput.trim(),
    });
    rerender();
    setSyncToastMessage('✅ Google Sheet सफलतापूर्वक कनेक्ट हो गई! लाइव सिंक सक्रिय है।');
    setTimeout(() => setSyncToastMessage(null), 4000);
  };

  const handleSyncAllToSheet = async () => {
    if (donations.length === 0) {
      alert('सिंक के लिए कोई दान रिकॉर्ड नहीं है।');
      return;
    }
    setIsSyncingSheet(true);
    try {
      const res = await syncAllDonationsToGoogleSheet(donations);
      setSyncToastMessage(res.message);
    } catch {
      setSyncToastMessage('सिंक में त्रुटि आई। कृपया Webhook URL जांचें।');
    } finally {
      setIsSyncingSheet(false);
      setTimeout(() => setSyncToastMessage(null), 4000);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  // Search & Filter
  const [donationFilter, setDonationFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & Popups
  const [screenshotModalUrl, setScreenshotModalUrl] = useState<string | null>(null);

  // Edit Donation Popup State
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);

  // Delete Password Confirmation Modal State
  const [deleteTargetDonation, setDeleteTargetDonation] = useState<Donation | null>(null);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Staff Modal States
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [staffDetailView, setStaffDetailView] = useState<Staff | null>(null);
  const [showStaffPasswordId, setShowStaffPasswordId] = useState<Record<string, boolean>>({});

  // Add Staff Form State
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffMobile, setNewStaffMobile] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'Pujari' | 'Cash' | 'Volunteer'>('Pujari');
  const [newStaffId, setNewStaffId] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('mandir123');
  const [newStaffPhoto, setNewStaffPhoto] = useState('');
  const [showNewStaffPass, setShowNewStaffPass] = useState(false);
  const [staffFormError, setStaffFormError] = useState('');
  const [staffFormSuccess, setStaffFormSuccess] = useState('');

  // QR Settings State
  const [qrUpiId, setQrUpiId] = useState(config.upiId);
  const [qrImageUrl, setQrImageUrl] = useState(config.qrImageUrl);
  const [qrSuccessMsg, setQrSuccessMsg] = useState('');

  // Add Notice Form State
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeDetails, setNoticeDetails] = useState('');
  const [noticeDate, setNoticeDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  // Content Settings State
  const [contentAbout, setContentAbout] = useState(config.aboutText);
  const [contentHistory, setContentHistory] = useState(config.historyText);
  const [contentAartiMorning, setContentAartiMorning] = useState(config.aartiMorning);
  const [contentAartiEvening, setContentAartiEvening] = useState(config.aartiEvening);
  const [contentTimings, setContentTimings] = useState(config.darshanTimings);
  const [contentSuccess, setContentSuccess] = useState('');

  // Online Donations Filtered
  const onlineDonations = donations
    .filter((d) => d.type === 'ONLINE')
    .filter((d) => (donationFilter === 'ALL' ? true : d.status === donationFilter))
    .filter(
      (d) =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.mobile.includes(searchTerm) ||
        d.receiptNo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Cash Donations List
  const cashDonations = donations
    .filter((d) => d.type === 'CASH')
    .filter(
      (d) =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.mobile.includes(searchTerm) ||
        d.receiptNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.collectedBy?.staffName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // --- ACTIONS ---

  // Approve & Send WhatsApp
  const handleApproveDonation = (id: string) => {
    try {
      const { donation, whatsappUrl } = templeStore.approveDonation(id);
      window.open(whatsappUrl, '_blank');
      rerender();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error approving');
    }
  };

  // Reject Donation
  const handleRejectDonation = (id: string) => {
    const reason = prompt('दान अस्वीकार करने का कारण दर्ज करें (वैकल्पिक):', 'अस्पष्ट स्क्रीनशॉट');
    if (reason !== null) {
      templeStore.rejectDonation(id, reason);
      rerender();
    }
  };

  // Resend WhatsApp
  const handleResendWhatsApp = (d: Donation) => {
    const cleanMobile = d.mobile.replace(/\D/g, '').slice(-10);
    const receiptNo = d.receiptNo || 'MJS-2026-XXXX';
    const receiptLink = d.receiptLink || `${config.website}/receipt/${receiptNo}`;
    const text =
      `🙏 जय माँ जगदंबा 🙏\n` +
      `प्रिय ${d.name} जी, आपका ₹${d.amount} दान प्राप्त हुआ।\n` +
      `रसीद: ${receiptNo}\n` +
      `दिनांक: ${d.date}\n` +
      `- माँ जगदंबा स्थान ट्रस्ट\n` +
      `रसीद: ${receiptLink}`;

    const url = `https://wa.me/91${cleanMobile}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Save Edit Donation
  const handleSaveEditDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDonation) return;

    templeStore.updateDonation(editingDonation.id, {
      name: editingDonation.name,
      mobile: editingDonation.mobile,
      amount: Number(editingDonation.amount),
      date: editingDonation.date,
      status: editingDonation.status,
      receiptNo: editingDonation.receiptNo,
    });

    setEditingDonation(null);
    rerender();
  };

  // Confirm Delete with Admin Password
  const handleConfirmDeleteDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteTargetDonation) return;
    setDeleteError('');

    try {
      templeStore.deleteDonation(deleteTargetDonation.id, adminPasswordInput);
      setDeleteTargetDonation(null);
      setAdminPasswordInput('');
      rerender();
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'गलत पासवर्ड');
    }
  };

  // Staff Form Submit
  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffFormError('');
    setStaffFormSuccess('');

    try {
      templeStore.addStaff({
        id: newStaffId,
        name: newStaffName,
        mobile: newStaffMobile,
        role: newStaffRole,
        password: newStaffPassword,
        photoUrl: newStaffPhoto,
      });

      setStaffFormSuccess(`स्टाफ "${newStaffName}" (ID: ${newStaffId}) सफलतापूर्वक जोड़ा गया!`);
      setNewStaffName('');
      setNewStaffMobile('');
      setNewStaffId('');
      setNewStaffPassword('mandir123');
      setNewStaffPhoto('');
      rerender();
      setTimeout(() => setStaffFormSuccess(''), 4000);
    } catch (err: unknown) {
      setStaffFormError(err instanceof Error ? err.message : 'Error adding staff');
    }
  };

  // Staff Edit Save
  const handleSaveEditStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    templeStore.updateStaff(editingStaff.id, {
      name: editingStaff.name,
      mobile: editingStaff.mobile,
      role: editingStaff.role,
      password: editingStaff.password,
      photoUrl: editingStaff.photoUrl,
      active: editingStaff.active,
    });

    setEditingStaff(null);
    rerender();
  };

  // Save QR Settings
  const handleSaveQrSettings = (e: React.FormEvent) => {
    e.preventDefault();
    templeStore.updateConfig({
      upiId: qrUpiId.trim(),
      qrImageUrl: qrImageUrl.trim(),
    });
    setQrSuccessMsg('QR कोड एवं UPI ID सेटिंग्स सफलतापूर्वक अपडेट की गईं!');
    setTimeout(() => setQrSuccessMsg(''), 4000);
    rerender();
  };

  // Notice Add Submit
  const handleAddNoticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    templeStore.addNotice({
      title: noticeTitle,
      details: noticeDetails,
      date: noticeDate,
      addedBy: 'Admin (व्यवस्थापक)',
      addedByRole: 'Admin',
      status: 'APPROVED',
    });

    setNoticeTitle('');
    setNoticeDetails('');
    rerender();
  };

  // Save Content Settings
  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault();
    templeStore.updateConfig({
      aboutText: contentAbout,
      historyText: contentHistory,
      aartiMorning: contentAartiMorning,
      aartiEvening: contentAartiEvening,
      darshanTimings: contentTimings,
    });
    setContentSuccess('मंदिर इतिहास एवं आरती समय विवरण सहेज लिया गया!');
    setTimeout(() => setContentSuccess(''), 4000);
    rerender();
  };

  return (
    <div className="min-h-screen bg-stone-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-[#7a0000] via-[#8c0000] to-[#590000] text-white rounded-3xl p-6 shadow-xl border-2 border-[#FFD700] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-black/20 rounded-2xl border border-[#FFD700] text-[#FFD700]">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-heading text-white">
                  सुपर एडमिन नियंत्रण कक्ष (Admin Full Access)
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFD700] text-stone-950">
                  सर्व-अधिकार प्राप्त
                </span>
              </div>
              <p className="text-xs text-amber-200 mt-0.5">
                माँ जगदंबा स्थान, मथुरापुर, मुजफ्फरपुर (बिहार) • सम्पूर्ण डेटा संपादन व नियंत्रण
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 hover:text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer border border-amber-400/40 transition shadow-sm"
              title="मुख्य पृष्ठ पर वापस जाएं (ऑटो लॉगआउट)"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← वापस (Logout)</span>
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-xl bg-black/40 hover:bg-black/60 text-amber-200 hover:text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer border border-amber-500/40 transition shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>एडमिन लॉगआउट</span>
            </button>
          </div>
        </div>

        {/* DASHBOARD 4 BOXES FROM USER BRIEF:
            Total Online Approved ₹ | Total Cash All Staff ₹ | Pending Count | Total Staff Count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Box 1: Total Online Approved ₹ */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-emerald-500 border-y border-r border-stone-200">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center justify-between">
              <span>Total Online Approved</span>
              <Globe className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">
              ₹{stats.totalOnlineApproved.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-stone-400 mt-1">वेबसाइट से स्वीकृत दान</div>
          </div>

          {/* Box 2: Total Cash All Staff ₹ */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-[#7a0000] border-y border-r border-stone-200">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center justify-between">
              <span>Total Cash All Staff</span>
              <Wallet className="w-4 h-4 text-[#7a0000]" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#7a0000] font-mono">
              ₹{stats.totalCashAllStaff.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-stone-400 mt-1">सभी पुजारियों/स्टाफ का नकद चंदा</div>
          </div>

          {/* Box 3: Pending Count */}
          <div
            onClick={() => {
              setActiveMenu('online');
              setDonationFilter('PENDING');
            }}
            className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-amber-500 border-y border-r border-stone-200 cursor-pointer hover:bg-amber-50/50 transition"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center justify-between">
              <span>Pending Count</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono">
              {stats.pendingCount}
            </div>
            <div className="text-[11px] text-amber-700 font-bold mt-1">
              सत्यापन प्रतीक्षारत (क्लिक करें)
            </div>
          </div>

          {/* Box 4: Total Staff Count */}
          <div
            onClick={() => setActiveMenu('staff')}
            className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-blue-500 border-y border-r border-stone-200 cursor-pointer hover:bg-blue-50/50 transition"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center justify-between">
              <span>Total Staff Count</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 font-mono">
              {stats.totalStaffCount}
            </div>
            <div className="text-[11px] text-stone-400 mt-1">सक्रिय सेवक व पुजारी</div>
          </div>
        </div>

        {/* QUICK SYNC & EXCEL BAR */}
        <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold">Google Sheet & Drive Sync:</span>
            <span className="text-stone-500 hidden sm:inline">
              हर नया दान स्वतः Google Sheet में जुड़ता है
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleOpenGoogleSheet}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5 transition cursor-pointer hover:scale-102 shadow-xs"
            >
              <Table className="w-3.5 h-3.5" />
              <span>📊 Google Sheet में देखें (Live)</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownloadExcel(donations, 'समस्त')}
              className="px-3.5 py-1.5 rounded-xl bg-[#7a0000] hover:bg-[#8c0000] text-[#FFD700] font-bold flex items-center gap-1.5 transition cursor-pointer hover:scale-102 shadow-xs border border-amber-400/40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>⬇️ Excel Download करो</span>
            </button>
          </div>
        </div>

        {/* ADMIN SUB-MENUS NAVBAR */}
        <div className="bg-white rounded-2xl p-2 shadow-xs border border-stone-200 flex flex-wrap gap-1.5 overflow-x-auto text-xs sm:text-sm font-bold">
          <button
            onClick={() => setActiveMenu('online')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeMenu === 'online'
                ? 'bg-[#7a0000] text-[#FFD700] shadow'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>1. Online Donation ({donations.filter((d) => d.type === 'ONLINE').length})</span>
          </button>

          <button
            onClick={() => setActiveMenu('staff')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeMenu === 'staff'
                ? 'bg-[#7a0000] text-[#FFD700] shadow'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>2. Staff Management</span>
          </button>

          <button
            onClick={() => setActiveMenu('cash')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeMenu === 'cash'
                ? 'bg-[#7a0000] text-[#FFD700] shadow'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>3. All Cash Chanda List ({cashDonations.length})</span>
          </button>

          <button
            onClick={() => setActiveMenu('qr')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeMenu === 'qr'
                ? 'bg-[#7a0000] text-[#FFD700] shadow'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>4. QR Settings</span>
          </button>

          <button
            onClick={() => setActiveMenu('notices')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeMenu === 'notices'
                ? 'bg-[#7a0000] text-[#FFD700] shadow'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>5. Notice Management</span>
          </button>

          <button
            onClick={() => setActiveMenu('content')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeMenu === 'content'
                ? 'bg-[#7a0000] text-[#FFD700] shadow'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>6. Mandir Info & Calendar</span>
          </button>

          <button
            onClick={() => setActiveMenu('sheet')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeMenu === 'sheet'
                ? 'bg-[#7a0000] text-[#FFD700] shadow'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>7. Google Sheet Sync</span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* MENU 1: ONLINE DONATION TABLE & ACTIONS */}
        {/* ------------------------------------------------------------- */}
        {activeMenu === 'online' && (
          <div className="bg-white rounded-3xl p-6 shadow-md border border-stone-200 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-heading text-stone-900">
                  ऑनलाइन दान सूची (Online Donations)
                </h2>
                <p className="text-xs text-stone-500">
                  भक्तों द्वारा QR स्कैन कर अपलोड किए गए स्क्रीनशॉट का सत्यापन, संपादन, रसीद निर्माण व ऑटो WhatsApp
                </p>
              </div>

              {/* Status Filter buttons */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setDonationFilter(st)}
                    className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition ${
                      donationFilter === st
                        ? 'bg-[#7a0000] text-[#FFD700]'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {st === 'ALL'
                      ? 'सभी'
                      : st === 'PENDING'
                      ? 'लंबित (Pending)'
                      : st === 'APPROVED'
                      ? 'स्वीकृत (Approved)'
                      : 'अस्वीकृत'}
                  </button>
                ))}
              </div>
            </div>

            {/* GOOGLE SHEET & EXCEL DOWNLOAD 2 BUTTONS BAR */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border border-emerald-300/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                  📊
                </div>
                <div>
                  <div className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <span>Google Sheet Sync & Excel Export</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ● Live Sync Ready
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">
                    हर नया दान स्वतः Google Sheet (Drive) में जुड़ जाता है। लाइव डेटा देखें या संपूर्ण Excel डाउनलोड करें।
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {/* Button 1: [📊 Google Sheet में देखें (Live)] */}
                <button
                  type="button"
                  onClick={handleOpenGoogleSheet}
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition cursor-pointer hover:scale-102"
                >
                  <Table className="w-4 h-4 text-emerald-200" />
                  <span>📊 Google Sheet में देखें (Live)</span>
                </button>

                {/* Button 2: [⬇️ Excel Download करो] */}
                <button
                  type="button"
                  onClick={() => handleDownloadExcel(donations.filter((d) => d.type === 'ONLINE'), 'ऑनलाइन')}
                  className="px-4 py-2.5 rounded-xl bg-[#7a0000] hover:bg-[#8c0000] text-[#FFD700] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition cursor-pointer hover:scale-102 border border-[#FFD700]/40"
                >
                  <Download className="w-4 h-4 text-[#FFD700]" />
                  <span>⬇️ Excel Download करो</span>
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                placeholder="नाम, मोबाइल या रसीद संख्या से खोजें..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#7a0000] outline-hidden"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-stone-100 text-stone-600 font-bold uppercase text-[11px] border-b border-stone-200">
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Naam</th>
                    <th className="py-3 px-3">Mobile</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Screenshot</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {onlineDonations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-stone-500 text-xs">
                        कोई रिकॉर्ड नहीं मिला।
                      </td>
                    </tr>
                  ) : (
                    onlineDonations.map((d) => (
                      <tr key={d.id} className="hover:bg-amber-50/40 transition">
                        <td className="py-3 px-3 font-mono text-stone-600 whitespace-nowrap">
                          {d.date}
                        </td>
                        <td className="py-3 px-3 font-medium text-stone-900">
                          <div>{d.name}</div>
                          {d.sankalp && (
                            <div className="text-[10px] text-stone-500 line-clamp-1">
                              {d.sankalp}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-stone-700 whitespace-nowrap">
                          {d.mobile}
                        </td>
                        <td className="py-3 px-3 font-bold text-[#7a0000] font-mono whitespace-nowrap">
                          ₹{d.amount}
                        </td>
                        <td className="py-3 px-3">
                          {d.screenshotUrl ? (
                            <button
                              type="button"
                              onClick={() => setScreenshotModalUrl(d.screenshotUrl || null)}
                              className="px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold border border-stone-300 flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                          ) : (
                            <span className="text-stone-400 text-xs">N/A</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                              d.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : d.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* APPROVE & SEND WHATSAPP */}
                            {d.status === 'PENDING' && (
                              <button
                                onClick={() => handleApproveDonation(d.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                                title="स्वीकृत करें एवं WhatsApp भेजें"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>APPROVE & SEND WHATSAPP</span>
                              </button>
                            )}

                            {/* REJECT */}
                            {d.status === 'PENDING' && (
                              <button
                                onClick={() => handleRejectDonation(d.id)}
                                className="px-2 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold cursor-pointer"
                              >
                                REJECT
                              </button>
                            )}

                            {/* RESEND WHATSAPP */}
                            {d.status === 'APPROVED' && (
                              <button
                                onClick={() => handleResendWhatsApp(d)}
                                className="px-2 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                title="रसीद संदेश पुनः भेजें"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                                <span>Resend WhatsApp</span>
                              </button>
                            )}

                            {/* VIEW / PRINT RECEIPT */}
                            {d.status === 'APPROVED' && (
                              <button
                                onClick={() => onViewReceipt(d)}
                                className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer"
                                title="रसीद देखें"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* EDIT */}
                            <button
                              onClick={() => setEditingDonation(d)}
                              className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold cursor-pointer"
                              title="विवरण संपादित करें"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* DELETE WITH PASSWORD */}
                            <button
                              onClick={() => {
                                setDeleteTargetDonation(d);
                                setAdminPasswordInput('');
                                setDeleteError('');
                              }}
                              className="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold cursor-pointer"
                              title="हटाएं (पासवर्ड आवश्यक)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MENU 2: STAFF MANAGEMENT - CUSTOM ID PASSWORD */}
        {/* ------------------------------------------------------------- */}
        {activeMenu === 'staff' && (
          <div className="space-y-6">
            {/* Add Staff Form */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-stone-200">
              <h2 className="text-xl font-bold font-heading text-stone-900 mb-1">
                + नया स्टाफ / पुजारी जोड़ें (Custom ID & Password)
              </h2>
              <p className="text-xs text-stone-500 mb-5">
                एडमिन स्वयं स्टाफ की User ID एवं Password तय करेगा। स्टाफ इस ID/पासवर्ड से लॉगिन कर नकद चंदा रसीद काट सकता है।
              </p>

              {staffFormError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                  {staffFormError}
                </div>
              )}
              {staffFormSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold">
                  {staffFormSuccess}
                </div>
              )}

              <form onSubmit={handleAddStaffSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    स्टाफ का नाम <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा: पं. महेश पाठक"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#7a0000] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    मोबाइल नंबर <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10 अंकों का मोबाइल"
                    value={newStaffMobile}
                    onChange={(e) => setNewStaffMobile(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono focus:ring-2 focus:ring-[#7a0000] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    पद / Role <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:ring-2 focus:ring-[#7a0000] outline-hidden"
                  >
                    <option value="Pujari">Pujari (पुजारी)</option>
                    <option value="Cash">Cash (कैशियर / चंदा संग्रहकर्ता)</option>
                    <option value="Volunteer">Volunteer (स्वयंसेवक)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Staff User ID <span className="text-red-600">*</span> (Admin khud likhega)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा: ramesh01"
                    value={newStaffId}
                    onChange={(e) => setNewStaffId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono font-bold focus:ring-2 focus:ring-[#7a0000] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Staff Password <span className="text-red-600">*</span> (Admin khud likhega)
                  </label>
                  <div className="relative">
                    <input
                      type={showNewStaffPass ? 'text' : 'password'}
                      required
                      placeholder="उदा: mandir123"
                      value={newStaffPassword}
                      onChange={(e) => setNewStaffPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-8 rounded-xl border border-stone-300 text-xs font-mono focus:ring-2 focus:ring-[#7a0000] outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewStaffPass(!showNewStaffPass)}
                      className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-700"
                    >
                      {showNewStaffPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Photo URL (वैकल्पिक)
                  </label>
                  <input
                    type="url"
                    placeholder="https://... photo url"
                    value={newStaffPhoto}
                    onChange={(e) => setNewStaffPhoto(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#7a0000] outline-hidden"
                  />
                </div>

                <div className="sm:col-span-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#7a0000] hover:bg-[#990000] text-[#FFD700] text-xs font-bold shadow-md cursor-pointer transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>स्टाफ जोड़ें (Staff Jodein)</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Staff List Table */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-stone-200 space-y-4">
              <h3 className="text-lg font-bold font-heading text-stone-900">
                मंदिर स्टाफ सूची (Staff List & Collection Summary)
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-stone-100 text-stone-600 font-bold uppercase text-[11px] border-b border-stone-200">
                      <th className="py-3 px-3">Photo</th>
                      <th className="py-3 px-3">Naam</th>
                      <th className="py-3 px-3">Staff ID</th>
                      <th className="py-3 px-3">Password</th>
                      <th className="py-3 px-3">Mobile</th>
                      <th className="py-3 px-3">Aaj Ka Collection ₹</th>
                      <th className="py-3 px-3">Kul Collection ₹</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {staffList.map((s) => {
                      const staffStats = templeStore.getStaffStats(s.id);
                      const isPassVisible = showStaffPasswordId[s.id];

                      return (
                        <tr key={s.id} className="hover:bg-amber-50/40 transition">
                          <td className="py-3 px-3">
                            <img
                              src={s.photoUrl}
                              alt={s.name}
                              className="w-10 h-10 rounded-full object-cover border border-[#FFD700]"
                            />
                          </td>
                          <td className="py-3 px-3 font-medium text-stone-900">
                            <div>{s.name}</div>
                            <span className="text-[10px] text-stone-500 font-normal">
                              ({s.role})
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-blue-700">
                            {s.id}
                          </td>
                          <td className="py-3 px-3 font-mono text-stone-800">
                            <div className="flex items-center gap-1.5">
                              <span>{isPassVisible ? s.password : '••••••••'}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setShowStaffPasswordId((prev) => ({
                                    ...prev,
                                    [s.id]: !prev[s.id],
                                  }))
                                }
                                className="text-stone-400 hover:text-stone-700 p-0.5"
                                title="पासवर्ड देखें/छिपाएं"
                              >
                                {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono text-stone-700 whitespace-nowrap">
                            {s.mobile}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-[#7a0000]">
                            ₹{staffStats.todayAmount}{' '}
                            <span className="text-[10px] text-stone-500 font-normal">
                              ({staffStats.todayCount} रसीदें)
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                            ₹{staffStats.totalAmount}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Details button: view all receipts collected by staff */}
                              <button
                                onClick={() => setStaffDetailView(s)}
                                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold cursor-pointer"
                                title="स्टाफ की सभी रसीदें देखें"
                              >
                                Details
                              </button>
                              {/* EDIT */}
                              <button
                                onClick={() => setEditingStaff(s)}
                                className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold cursor-pointer"
                              >
                                EDIT
                              </button>
                              {/* DELETE */}
                              <button
                                onClick={() => {
                                  if (confirm(`क्या आप स्टाफ "${s.name}" को हटाना चाहते हैं?`)) {
                                    templeStore.deleteStaff(s.id);
                                    rerender();
                                  }
                                }}
                                className="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold cursor-pointer"
                              >
                                DELETE
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Staff Details Modal: Shows all receipts collected by that staff */}
            {staffDetailView && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
                <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border-2 border-blue-500 overflow-hidden">
                  <div className="p-5 bg-gradient-to-r from-blue-800 to-indigo-900 text-white flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold font-heading">
                        {staffDetailView.name} (ID: {staffDetailView.id}) की रसीदें
                      </h3>
                      <p className="text-xs text-blue-200">
                        एडमिन किसी भी स्टाफ की किसी भी रसीद को EDIT या DELETE कर सकता है।
                      </p>
                    </div>
                    <button
                      onClick={() => setStaffDetailView(null)}
                      className="text-white hover:text-stone-300 font-bold p-1 cursor-pointer"
                    >
                      ✕ बंद करें
                    </button>
                  </div>

                  <div className="p-5 overflow-y-auto flex-1 space-y-3">
                    {templeStore.getStaffReceipts(staffDetailView.id).length === 0 ? (
                      <div className="text-center py-8 text-stone-500 text-xs">
                        इस स्टाफ द्वारा अभी तक कोई रसीद नहीं काटी गई है।
                      </div>
                    ) : (
                      templeStore.getStaffReceipts(staffDetailView.id).map((r) => (
                        <div
                          key={r.id}
                          className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 flex flex-wrap items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <span className="font-mono font-bold text-[#7a0000] mr-2">
                              {r.receiptNo}
                            </span>
                            <span className="font-bold text-stone-900">{r.name}</span>
                            <span className="text-stone-400 mx-2">•</span>
                            <span className="font-mono text-stone-600">{r.mobile}</span>
                            <span className="text-stone-400 mx-2">•</span>
                            <span className="font-mono text-stone-500">{r.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-[#7a0000] text-sm">
                              ₹{r.amount}
                            </span>
                            <button
                              onClick={() => onViewReceipt(r)}
                              className="px-2 py-1 rounded bg-stone-800 text-white font-bold"
                            >
                              Print
                            </button>
                            <button
                              onClick={() => setEditingDonation(r)}
                              className="px-2 py-1 rounded bg-blue-100 text-blue-800 font-bold"
                            >
                              EDIT
                            </button>
                            <button
                              onClick={() => {
                                setDeleteTargetDonation(r);
                                setAdminPasswordInput('');
                                setDeleteError('');
                              }}
                              className="px-2 py-1 rounded bg-red-100 text-red-800 font-bold"
                            >
                              DELETE
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MENU 3: ALL CASH CHANDA LIST */}
        {/* ------------------------------------------------------------- */}
        {activeMenu === 'cash' && (
          <div className="bg-white rounded-3xl p-6 shadow-md border border-stone-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-heading text-stone-900">
                  सभी नकद चंदा रसीदें (All Cash Chanda List)
                </h2>
                <p className="text-xs text-stone-500">
                  मंदिर परिसर में पुजारियों एवं स्टाफ द्वारा काटी गई कुल नकद रसीदें
                </p>
              </div>

              <div className="relative max-w-sm w-full">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="भक्त का नाम, रसीद सं. या स्टाफ का नाम खोजें..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#7a0000] outline-hidden"
                />
              </div>
            </div>

            {/* GOOGLE SHEET & EXCEL DOWNLOAD 2 BUTTONS BAR */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border border-emerald-300/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                  📊
                </div>
                <div>
                  <div className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <span>Google Sheet Sync & Excel Export (नकद रसीदें)</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ● Live Sync Ready
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">
                    पुजारियों एवं स्टाफ द्वारा काटी गई सभी नकद रसीदें Google Sheet में दर्ज हैं।
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {/* Button 1: [📊 Google Sheet में देखें (Live)] */}
                <button
                  type="button"
                  onClick={handleOpenGoogleSheet}
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition cursor-pointer hover:scale-102"
                >
                  <Table className="w-4 h-4 text-emerald-200" />
                  <span>📊 Google Sheet में देखें (Live)</span>
                </button>

                {/* Button 2: [⬇️ Excel Download करो] */}
                <button
                  type="button"
                  onClick={() => handleDownloadExcel(donations.filter((d) => d.type === 'CASH'), 'नकद')}
                  className="px-4 py-2.5 rounded-xl bg-[#7a0000] hover:bg-[#8c0000] text-[#FFD700] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition cursor-pointer hover:scale-102 border border-[#FFD700]/40"
                >
                  <Download className="w-4 h-4 text-[#FFD700]" />
                  <span>⬇️ Excel Download करो</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-stone-100 text-stone-600 font-bold uppercase text-[11px] border-b border-stone-200">
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Receipt No</th>
                    <th className="py-3 px-3">Bhakt Naam</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Raseed Kisne Di (Staff Name)</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {cashDonations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-500 text-xs">
                        कोई नकद चंदा रिकॉर्ड नहीं मिला।
                      </td>
                    </tr>
                  ) : (
                    cashDonations.map((d) => (
                      <tr key={d.id} className="hover:bg-amber-50/40 transition">
                        <td className="py-3 px-3 font-mono text-stone-600 whitespace-nowrap">
                          {d.date}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[#7a0000]">
                          {d.receiptNo || 'N/A'}
                        </td>
                        <td className="py-3 px-3 font-medium text-stone-900">
                          {d.name}
                        </td>
                        <td className="py-3 px-3 font-bold text-emerald-700 font-mono">
                          ₹{d.amount}
                        </td>
                        <td className="py-3 px-3 font-medium text-stone-800">
                          <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200 font-semibold">
                            {d.collectedBy?.staffName || 'Admin'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onViewReceipt(d)}
                              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold cursor-pointer"
                            >
                              Print
                            </button>
                            <button
                              onClick={() => setEditingDonation(d)}
                              className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold cursor-pointer"
                            >
                              EDIT
                            </button>
                            <button
                              onClick={() => {
                                setDeleteTargetDonation(d);
                                setAdminPasswordInput('');
                                setDeleteError('');
                              }}
                              className="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold cursor-pointer"
                            >
                              DELETE
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MENU 4: QR SETTINGS */}
        {/* ------------------------------------------------------------- */}
        {activeMenu === 'qr' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-stone-200 max-w-xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold font-heading text-stone-900">
                मंदिर UPI QR एवं भुगतान सेटिंग्स
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                यहाँ से UPI ID या QR कोड की इमेज लिंक बदलें। दान पृष्ठ पर तुरंत नया QR कोड दिखेगा।
              </p>
            </div>

            {qrSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{qrSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveQrSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  मंदिर आधिकारिक UPI ID <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा: 9709168876@upi या maajagdamba@okaxis"
                  value={qrUpiId}
                  onChange={(e) => setQrUpiId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-mono focus:ring-2 focus:ring-[#7a0000] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  QR इमेज URL
                </label>
                <input
                  type="url"
                  placeholder="https://... QR image url"
                  value={qrImageUrl}
                  onChange={(e) => setQrImageUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#7a0000] outline-hidden font-mono"
                />
              </div>

              {/* QR Preview */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center">
                <div className="text-xs font-bold text-[#7a0000] mb-2">QR कोड पूर्वावलोकन:</div>
                <img
                  src={
                    qrImageUrl ||
                    `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${qrUpiId}&pn=Maa%20Jagdamba%20Sthan%20Trust`
                  }
                  alt="QR Preview"
                  className="w-44 h-44 object-contain mx-auto rounded-xl border-2 border-[#FFD700] bg-white p-2 shadow-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#7a0000] hover:bg-[#990000] text-[#FFD700] font-bold text-sm shadow cursor-pointer transition"
              >
                QR एवं UPI सेटिंग्स सहेजें (Save Settings)
              </button>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MENU 5: NOTICE MANAGEMENT */}
        {/* ------------------------------------------------------------- */}
        {activeMenu === 'notices' && (
          <div className="space-y-6">
            {/* Add Notice */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-stone-200">
              <h2 className="text-xl font-bold font-heading text-stone-900 mb-4">
                + नई मंदिर सूचना प्रकाशित करें
              </h2>

              <form onSubmit={handleAddNoticeSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      सूचना का शीर्षक <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा: शारदीय नवरात्र विशेष शतचंडी यज्ञ आमंत्रण"
                      value={noticeTitle}
                      onChange={(e) => setNoticeTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#7a0000] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      दिनांक <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={noticeDate}
                      onChange={(e) => setNoticeDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#7a0000] outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    विस्तृत विवरण <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="सूचना का पूर्ण विवरण..."
                    value={noticeDetails}
                    onChange={(e) => setNoticeDetails(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#7a0000] outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#7a0000] hover:bg-[#990000] text-[#FFD700] text-xs font-bold shadow cursor-pointer transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>सूचना जोड़ें (Add Notice)</span>
                </button>
              </form>
            </div>

            {/* Notices Table */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-stone-200 space-y-4">
              <h3 className="text-lg font-bold font-heading text-stone-900">
                समस्त सूचनाएं (Notice List)
              </h3>
              <p className="text-xs text-stone-500">
                लंबित सूचनाएं पीले बैकग्राउंड में दिखेंगी। स्टाफ द्वारा भेजी गई सूचना पर स्टाफ का नाम प्रदर्शित होगा।
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-stone-100 text-stone-600 font-bold uppercase text-[11px] border-b border-stone-200">
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Title</th>
                      <th className="py-3 px-3">Added By</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {notices.map((n) => (
                      <tr
                        key={n.id}
                        className={`transition ${
                          n.status === 'PENDING' ? 'bg-amber-100/60 font-semibold' : 'hover:bg-amber-50/30'
                        }`}
                      >
                        <td className="py-3 px-3 font-mono text-stone-600 whitespace-nowrap">
                          {n.date}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-stone-900">{n.title}</div>
                          <div className="text-[11px] text-stone-600 line-clamp-1">{n.details}</div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {n.addedByRole === 'Staff' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                              Staff: {n.addedBy}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-800">
                              Admin
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              n.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-200 text-amber-900'
                            }`}
                          >
                            {n.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {n.status === 'PENDING' && (
                              <button
                                onClick={() => {
                                  templeStore.approveNotice(n.id);
                                  rerender();
                                }}
                                className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-xs"
                              >
                                APPROVE
                              </button>
                            )}
                            <button
                              onClick={() => setEditingNotice(n)}
                              className="px-2 py-1 rounded bg-blue-50 text-blue-700 font-bold text-xs"
                            >
                              EDIT
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('क्या आप यह सूचना हटाना चाहते हैं?')) {
                                  templeStore.deleteNotice(n.id);
                                  rerender();
                                }
                              }}
                              className="px-2 py-1 rounded bg-red-50 text-red-700 font-bold text-xs"
                            >
                              DELETE
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MENU 6: MANDIR INFO & CALENDAR EDIT */}
        {/* ------------------------------------------------------------- */}
        {activeMenu === 'content' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-stone-200 space-y-5">
              <div>
                <h2 className="text-xl font-bold font-heading text-stone-900">
                  मंदिर परिचय एवं दर्शन समय संपादन
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  मुख्य पृष्ठ पर प्रदर्शित होने वाला 'About Mandir' एवं आरती समय यहाँ से संपादित करें।
                </p>
              </div>

              {contentSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold">
                  {contentSuccess}
                </div>
              )}

              <form onSubmit={handleSaveContent} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    मंदिर परिचय (About Mandir)
                  </label>
                  <textarea
                    rows={3}
                    value={contentAbout}
                    onChange={(e) => setContentAbout(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#7a0000] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    इतिहास एवं महिमा (History)
                  </label>
                  <textarea
                    rows={3}
                    value={contentHistory}
                    onChange={(e) => setContentHistory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#7a0000] outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      प्रातः आरती समय
                    </label>
                    <input
                      type="text"
                      value={contentAartiMorning}
                      onChange={(e) => setContentAartiMorning(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      संध्या आरती समय
                    </label>
                    <input
                      type="text"
                      value={contentAartiEvening}
                      onChange={(e) => setContentAartiEvening(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      कपाट खुलने का समय
                    </label>
                    <input
                      type="text"
                      value={contentTimings}
                      onChange={(e) => setContentTimings(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#7a0000] hover:bg-[#990000] text-[#FFD700] text-xs font-bold shadow cursor-pointer transition"
                >
                  विवरण सहेजें (Save Changes)
                </button>
              </form>
            </div>

            {/* Calendar & Upcoming Festivals */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-stone-200 space-y-4">
              <h3 className="text-lg font-bold font-heading text-stone-900">
                आगामी पर्व एवं त्योहार सूची (Calendar Tyohar List)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {calendar.map((c) => (
                  <div key={c.id} className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300 relative">
                    <button
                      onClick={() => {
                        templeStore.deleteCalendarItem(c.id);
                        rerender();
                      }}
                      className="absolute top-3 right-3 text-stone-400 hover:text-red-600 cursor-pointer p-1"
                      title="पर्व हटाएं"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="text-xs font-mono font-bold text-[#7a0000] mb-0.5">{c.date}</div>
                    <h4 className="text-sm font-bold text-stone-900">{c.title}</h4>
                    <p className="text-[11px] text-stone-600 mt-1">{c.description}</p>
                    {c.tithi && (
                      <span className="mt-2 inline-block text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-medium">
                        {c.tithi}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MENU 7: GOOGLE SHEET & EXCEL SYNC */}
        {/* ------------------------------------------------------------- */}
        {activeMenu === 'sheet' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-stone-200 space-y-6">
            {/* Header & Quick Action Buttons */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    📊 Google Sheet & Excel
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                    Google Drive Cloud Backup
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-stone-900 mt-2">
                  Google Sheet Auto-Sync & Excel Export
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                  हर नया दान (Online व Cash) तुरंत Google Sheet में दर्ज होता है | लाइव शीट खोलें अथवा सम्पूर्ण डेटा Excel में डाउनलोड करें
                </p>
              </div>

              {/* Top 2 Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Button 1: [📊 Google Sheet में देखें (Live)] */}
                <button
                  type="button"
                  onClick={handleOpenGoogleSheet}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition cursor-pointer hover:scale-102"
                >
                  <Table className="w-4 h-4 text-emerald-200" />
                  <span>📊 Google Sheet में देखें (Live)</span>
                </button>

                {/* Button 2: [⬇️ Excel Download करो] */}
                <button
                  type="button"
                  onClick={() => handleDownloadExcel(donations, 'समस्त')}
                  className="px-5 py-2.5 rounded-xl bg-[#7a0000] hover:bg-[#8c0000] text-[#FFD700] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition cursor-pointer hover:scale-102 border border-[#FFD700]/50"
                >
                  <Download className="w-4 h-4 text-[#FFD700]" />
                  <span>⬇️ Excel Download करो</span>
                </button>
              </div>
            </div>

            {/* Notification Banner */}
            {syncToastMessage && (
              <div className="p-4 rounded-2xl bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  <span>{syncToastMessage}</span>
                </div>
                <button
                  onClick={() => setSyncToastMessage(null)}
                  className="text-emerald-700 hover:text-emerald-950 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Setup Form Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1: Google Sheet Link Box */}
              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 font-heading">
                      Google Sheet Link Box (Admin Settings)
                    </h3>
                    <p className="text-xs text-stone-500">
                      एडमिन अपने Google Drive की Google Sheet का लिंक यहाँ पेस्ट करेगा
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700">
                    Google Sheet URL (Spreadsheet Link):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={googleSheetInput}
                      onChange={(e) => setGoogleSheetInput(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-600 outline-hidden font-mono bg-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleConnectSheet}
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer hover:scale-102"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Connect Google Sheet</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenGoogleSheet}
                    className="px-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-emerald-600" />
                    <span>शीट खोलकर देखें</span>
                  </button>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block animate-pulse"></span>
                    <span>वर्तमान स्थिति: कनेक्टेड (Active Link)</span>
                  </div>
                  <div className="font-mono text-emerald-800 truncate">
                    {config.googleSheetUrl || googleSheetInput || 'कोई लिंक सेट नहीं है'}
                  </div>
                </div>
              </div>

              {/* Card 2: Webhook Endpoint & Sync All */}
              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 font-heading">
                      Auto-Sync Webhook (Apps Script / SheetDB)
                    </h3>
                    <p className="text-xs text-stone-500">
                      हर नया दान स्वतः Google Sheet में row जोड़ने के लिए Webhook URL
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700">
                    Google Apps Script Web App URL या SheetDB Endpoint:
                  </label>
                  <input
                    type="url"
                    value={googleSheetWebhookInput}
                    onChange={(e) => setGoogleSheetWebhookInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-blue-600 outline-hidden font-mono bg-white"
                  />
                  <p className="text-[11px] text-stone-500">
                    💡 यदि Webhook URL नहीं है, तो नीचे दिए गए 30-सेकंड Apps Script कोड का उपयोग करें (मुफ़्त)।
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleConnectSheet}
                    className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer hover:scale-102"
                  >
                    <span>सेटिंग्स सहेजें (Save Webhook)</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSyncingSheet}
                    onClick={handleSyncAllToSheet}
                    className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-amber-300 font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer hover:scale-102 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheet ? 'animate-spin' : ''}`} />
                    <span>
                      {isSyncingSheet ? 'सिंक हो रहा है...' : `🔄 सभी ${donations.length} दान सिंक करें`}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3: Exact 10 Columns Schema Mapping (A to J) */}
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 font-heading">
                    Google Sheet कॉलम संरचना (Columns A to J)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Google Sheet में प्रत्येक दान निम्नलिखित 10 कॉलमों में बिल्कुल सही क्रम में दर्ज होता है:
                  </p>
                </div>
                <span className="text-xs font-bold text-stone-600 bg-white px-2.5 py-1 rounded-lg border border-stone-200">
                  कुल 10 कॉलम
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-amber-100/70 text-stone-800 font-bold border-b border-amber-200">
                      <th className="py-2.5 px-3">Column</th>
                      <th className="py-2.5 px-3">फ़ील्ड नाम</th>
                      <th className="py-2.5 px-3">विवरण</th>
                      <th className="py-2.5 px-3">नमूना मान (Sample Value)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 font-sans">
                    <tr className="hover:bg-white">
                      <td className="py-2 px-3 font-mono font-bold text-[#7a0000]">A</td>
                      <td className="py-2 px-3 font-bold text-stone-900">Receipt No</td>
                      <td className="py-2 px-3 text-stone-600">अनूठी रसीद संख्या</td>
                      <td className="py-2 px-3 font-mono text-stone-800">MJS-2026-1001</td>
                    </tr>
                    <tr className="hover:bg-white">
                      <td className="py-2 px-3 font-mono font-bold text-[#7a0000]">B</td>
                      <td className="py-2 px-3 font-bold text-stone-900">Date</td>
                      <td className="py-2 px-3 text-stone-600">दान प्राप्ति का दिनांक</td>
                      <td className="py-2 px-3 font-mono text-stone-800">2026-09-22</td>
                    </tr>
                    <tr className="hover:bg-white">
                      <td className="py-2 px-3 font-mono font-bold text-[#7a0000]">C</td>
                      <td className="py-2 px-3 font-bold text-stone-900">Name</td>
                      <td className="py-2 px-3 text-stone-600">दानदाता भक्त का नाम</td>
                      <td className="py-2 px-3 text-stone-800">राजीव कुमार रंजन</td>
                    </tr>
                    <tr className="hover:bg-white">
                      <td className="py-2 px-3 font-mono font-bold text-[#7a0000]">D</td>
                      <td className="py-2 px-3 font-bold text-stone-900">Mobile</td>
                      <td className="py-2 px-3 text-stone-600">भक्त का 10 अंकों का मोबाइल</td>
                      <td className="py-2 px-3 font-mono text-stone-800">9709168876</td>
                    </tr>
                    <tr className="hover:bg-white">
                      <td className="py-2 px-3 font-mono font-bold text-[#7a0000]">E</td>
                      <td className="py-2 px-3 font-bold text-stone-900">Gotra</td>
                      <td className="py-2 px-3 text-stone-600">भक्त का पावन गोत्र</td>
                      <td className="py-2 px-3 text-stone-800">शांडिल्य / कश्यप</td>
                    </tr>
                    <tr className="hover:bg-white">
                      <td className="py-2 px-3 font-mono font-bold text-[#7a0000]">F</td>
                      <td className="py-2 px-3 font-bold text-stone-900">Amount</td>
                      <td className="py-2 px-3 text-stone-600">दान राशि (₹)</td>
                      <td className="py-2 px-3 font-mono font-bold text-emerald-700">₹2,100</td>
                    </tr>
                    <tr className="hover:bg-white">
                      <td className="py-2 px-3 font-mono font-bold text-[#7a0000]">G</td>
                      <td className="py-2 px-3 font-bold text-stone-900">Payment Mode</td>
                      <td className="py-2 px-3 text-stone-600">भुगतान माध्यम (UPI / Cash)</td>
                      <td className="py-2 px-3 font-semibold text-blue-700">UPI / Cash</td>
                    </tr>
                    <tr className="hover:bg-white">
                      <td className="py-2 px-3 font-mono font-bold text-[#7a0000]">H</td>
                      <td className="py-2 px-3 font-bold text-stone-900">Staff ID (Kaun laya)</td>
                      <td className="py-2 px-3 text-stone-600">चंदा संग्रह करने वाले सेवक/पुजारी की ID</td>
                      <td className="py-2 px-3 text-stone-800">पं. रमेश शर्मा (ramesh01)</td>
                    </tr>
                    <tr className="hover:bg-white">
                      <td className="py-2 px-3 font-mono font-bold text-[#7a0000]">I</td>
                      <td className="py-2 px-3 font-bold text-stone-900">Status</td>
                      <td className="py-2 px-3 text-stone-600">सत्यापन स्थिति (APPROVED / PENDING)</td>
                      <td className="py-2 px-3 font-bold text-emerald-600">APPROVED</td>
                    </tr>
                    <tr className="hover:bg-white">
                      <td className="py-2 px-3 font-mono font-bold text-[#7a0000]">J</td>
                      <td className="py-2 px-3 font-bold text-stone-900">Screenshot Link</td>
                      <td className="py-2 px-3 text-stone-600">ऑनलाइन पेमेंट स्क्रीनशॉट / रसीद लिंक</td>
                      <td className="py-2 px-3 font-mono text-stone-500 truncate max-w-xs">
                        https://maa-jagdamba-sthan-mathurapur.web.app/receipt/MJS-2026-1001
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Card 4: Free Apps Script Copy Block & 30-sec Setup Guide */}
            <div className="bg-stone-900 text-stone-200 rounded-2xl p-5 border border-stone-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-amber-400 font-heading">
                    ⚡ मुफ़्त Google Apps Script कोड (Google Sheet से ऑटो सिंक के लिए)
                  </h3>
                  <p className="text-xs text-stone-400">
                    बिना किसी सर्वर या खर्च के अपनी Google Sheet में यह कोड पेस्ट करें
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer self-start sm:self-auto shrink-0"
                >
                  {copiedScript ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedScript ? 'कोड कॉपी हो गया!' : '1-क्लिक कोड कॉपी करें'}</span>
                </button>
              </div>

              {/* Instructions Steps */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700 space-y-1">
                  <div className="text-amber-400 font-bold">चरण 1:</div>
                  <div className="text-stone-300">
                    अपनी <a href="https://docs.google.com/spreadsheets" target="_blank" rel="noreferrer" className="underline text-amber-300">Google Sheet</a> खोलें।
                  </div>
                </div>
                <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700 space-y-1">
                  <div className="text-amber-400 font-bold">चरण 2:</div>
                  <div className="text-stone-300">
                    मेन्यू में <strong>Extensions &gt; Apps Script</strong> पर क्लिक करें।
                  </div>
                </div>
                <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700 space-y-1">
                  <div className="text-amber-400 font-bold">चरण 3:</div>
                  <div className="text-stone-300">
                    यह कोड पेस्ट करें और <strong>Deploy &gt; New deployment</strong> चुनें।
                  </div>
                </div>
                <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700 space-y-1">
                  <div className="text-amber-400 font-bold">चरण 4:</div>
                  <div className="text-stone-300">
                    Who has access में <strong>Anyone</strong> चुनें और URL यहाँ पेस्ट करें!
                  </div>
                </div>
              </div>

              {/* Code snippet viewer */}
              <div className="relative">
                <pre className="p-3.5 bg-black/60 rounded-xl text-[11px] font-mono text-amber-200 overflow-x-auto max-h-48 border border-stone-800">
                  {GOOGLE_APPS_SCRIPT_TEMPLATE}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* POPUP: EDIT DONATION DETAILS */}
        {/* ------------------------------------------------------------- */}
        {editingDonation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-[#7a0000] animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
                <h3 className="text-lg font-bold font-heading text-[#7a0000]">
                  दान रिकॉर्ड संपादित करें (Edit Donation)
                </h3>
                <button
                  onClick={() => setEditingDonation(null)}
                  className="text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEditDonation} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">दानदाता का नाम</label>
                  <input
                    type="text"
                    required
                    value={editingDonation.name}
                    onChange={(e) =>
                      setEditingDonation({ ...editingDonation, name: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#7a0000] outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">मोबाइल नंबर</label>
                    <input
                      type="text"
                      required
                      value={editingDonation.mobile}
                      onChange={(e) =>
                        setEditingDonation({ ...editingDonation, mobile: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">राशि (₹)</label>
                    <input
                      type="number"
                      required
                      value={editingDonation.amount}
                      onChange={(e) =>
                        setEditingDonation({ ...editingDonation, amount: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono font-bold outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">तारीख</label>
                    <input
                      type="date"
                      required
                      value={editingDonation.date}
                      onChange={(e) =>
                        setEditingDonation({ ...editingDonation, date: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">स्थिति (Status)</label>
                    <select
                      value={editingDonation.status}
                      onChange={(e) =>
                        setEditingDonation({
                          ...editingDonation,
                          status: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white outline-hidden"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    रसीद संख्या (Receipt No)
                  </label>
                  <input
                    type="text"
                    value={editingDonation.receiptNo || ''}
                    onChange={(e) =>
                      setEditingDonation({ ...editingDonation, receiptNo: e.target.value })
                    }
                    placeholder="MJS-2026-XXXX"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono font-bold outline-hidden"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingDonation(null)}
                    className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold cursor-pointer"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#7a0000] text-[#FFD700] text-xs font-bold cursor-pointer shadow"
                  >
                    सहेजें (Save Update)
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* POPUP: DELETE CONFIRMATION WITH ADMIN PASSWORD */}
        {/* ------------------------------------------------------------- */}
        {deleteTargetDonation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-red-600 animate-in fade-in">
              <div className="text-center space-y-2 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-stone-900 font-heading">
                  दान रिकॉर्ड हटाने की पुष्टि (Confirm Delete)
                </h3>
                <p className="text-xs text-stone-600">
                  हटाने के लिए एडमिन पासवर्ड दर्ज करें। यह रिकॉर्ड स्थायी रूप से हटा दिया जाएगा।
                </p>
              </div>

              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-stone-800 space-y-1 mb-4">
                <div>
                  <span className="font-bold">दानदाता:</span> {deleteTargetDonation.name}
                </div>
                <div>
                  <span className="font-bold">राशि:</span> ₹{deleteTargetDonation.amount} |{' '}
                  <span className="font-bold">रसीद:</span>{' '}
                  {deleteTargetDonation.receiptNo || 'N/A'}
                </div>
              </div>

              {deleteError && (
                <div className="mb-3 p-2.5 rounded-lg bg-red-100 text-red-700 text-xs font-bold">
                  {deleteError}
                </div>
              )}

              <form onSubmit={handleConfirmDeleteDonation} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    एडमिन पासवर्ड दर्ज करें <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="एडमिन पासवर्ड दर्ज करें"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs outline-hidden focus:ring-2 focus:ring-red-600 font-mono"
                    autoFocus
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDeleteTargetDonation(null)}
                    className="flex-1 py-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold cursor-pointer"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer shadow"
                  >
                    पूर्णतः हटाएं (Confirm Delete)
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* POPUP: EDIT STAFF */}
        {/* ------------------------------------------------------------- */}
        {editingStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-blue-600 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
                <h3 className="text-lg font-bold font-heading text-stone-900">
                  स्टाफ विवरण संपादित करें ({editingStaff.id})
                </h3>
                <button
                  onClick={() => setEditingStaff(null)}
                  className="text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEditStaff} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">नाम</label>
                  <input
                    type="text"
                    required
                    value={editingStaff.name}
                    onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">मोबाइल</label>
                    <input
                      type="text"
                      required
                      value={editingStaff.mobile}
                      onChange={(e) => setEditingStaff({ ...editingStaff, mobile: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Role</label>
                    <select
                      value={editingStaff.role}
                      onChange={(e) =>
                        setEditingStaff({ ...editingStaff, role: e.target.value as any })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                    >
                      <option value="Pujari">Pujari</option>
                      <option value="Cash">Cash</option>
                      <option value="Volunteer">Volunteer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Password (बदलें)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStaff.password}
                    onChange={(e) =>
                      setEditingStaff({ ...editingStaff, password: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Photo URL</label>
                  <input
                    type="url"
                    value={editingStaff.photoUrl}
                    onChange={(e) =>
                      setEditingStaff({ ...editingStaff, photoUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingStaff(null)}
                    className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow"
                  >
                    सहेजें (Save)
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* POPUP: EDIT NOTICE */}
        {/* ------------------------------------------------------------- */}
        {editingNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-stone-400 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
                <h3 className="text-lg font-bold font-heading text-stone-900">
                  सूचना संपादित करें
                </h3>
                <button
                  onClick={() => setEditingNotice(null)}
                  className="text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">शीर्षक</label>
                  <input
                    type="text"
                    value={editingNotice.title}
                    onChange={(e) =>
                      setEditingNotice({ ...editingNotice, title: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">विवरण</label>
                  <textarea
                    rows={4}
                    value={editingNotice.details}
                    onChange={(e) =>
                      setEditingNotice({ ...editingNotice, details: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditingNotice(null)}
                    className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold"
                  >
                    रद्द करें
                  </button>
                  <button
                    onClick={() => {
                      templeStore.updateNotice(editingNotice.id, {
                        title: editingNotice.title,
                        details: editingNotice.details,
                      });
                      setEditingNotice(null);
                      rerender();
                    }}
                    className="px-5 py-2 rounded-xl bg-[#7a0000] text-white text-xs font-bold"
                  >
                    सहेजें
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* POPUP: SCREENSHOT ZOOM MODAL */}
        {/* ------------------------------------------------------------- */}
        {screenshotModalUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs"
            onClick={() => setScreenshotModalUrl(null)}
          >
            <div
              className="bg-stone-900 rounded-3xl p-4 max-w-xl w-full border-2 border-[#FFD700] shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 text-white border-b border-stone-800 mb-3">
                <span className="text-xs font-bold text-[#FFD700]">
                  भुगतान स्क्रीनशॉट (Payment Screenshot Verification)
                </span>
                <button
                  onClick={() => setScreenshotModalUrl(null)}
                  className="text-white hover:text-amber-300 text-sm font-bold cursor-pointer"
                >
                  ✕ बंद करें
                </button>
              </div>
              <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-black rounded-xl p-2">
                <img
                  src={screenshotModalUrl}
                  alt="Full Screenshot"
                  className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
