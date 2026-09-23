import React, { useState } from 'react';
import { templeStore } from '../services/store';
import { Staff } from '../types';
import {
  Shield,
  Users,
  Eye,
  EyeOff,
  Lock,
  User,
  X,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  Phone,
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const config = templeStore.getConfig();
    const validId = (config.adminId || '9709168876').trim();
    const validPass = config.adminPassword || 'Shashi@2026';

    if (adminId.trim() === validId && password === validPass) {
      setError('');
      setAdminId('');
      setPassword('');
      onSuccess();
      onClose();
    } else {
      setError('अमान्य एडमिन ID या पासवर्ड! कृपया सही विवरण दर्ज करें।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border-4 border-[#7a0000] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#7a0000] to-[#990000] text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-[#FFD700] mx-auto flex items-center justify-center mb-2 shadow-inner">
            <Shield className="w-8 h-8 text-[#FFD700]" />
          </div>
          <h3 className="text-xl font-bold font-heading text-[#FFD700]">
            सुपर एडमिन लॉगिन
          </h3>
          <p className="text-xs text-amber-200 mt-0.5">
            माँ जगदंबा स्थान - पूर्ण नियंत्रण कक्ष
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              एडमिन ID <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-stone-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                placeholder="एडमिन ID दर्ज करें"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#7a0000] outline-hidden font-mono"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              एडमिन पासवर्ड <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-stone-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="सुरक्षित पासवर्ड दर्ज करें"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#7a0000] outline-hidden font-mono"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#7a0000] hover:bg-[#990000] text-[#FFD700] font-bold text-sm shadow-md cursor-pointer transition flex items-center justify-center gap-1.5 active:scale-98"
          >
            <Shield className="w-4 h-4 text-[#FFD700]" />
            <span>एडमिन पैनल में प्रवेश करें</span>
          </button>
        </form>
      </div>
    </div>
  );
};

interface StaffLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (staff: Staff) => void;
}

export const StaffLoginModal: React.FC<StaffLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  // Mode: 'login' or 'changePassword'
  const [mode, setMode] = useState<'login' | 'changePassword'>('login');

  // Login form state (Empty by default - no IDs or passwords shown)
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Change password form state
  const [changeStaffId, setChangeStaffId] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [changeError, setChangeError] = useState('');

  if (!isOpen) return null;

  // Handle Staff Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanInput = staffId.trim();
    if (!cleanInput) {
      setError('कृपया स्टाफ ID या मोबाइल नंबर दर्ज करें।');
      return;
    }

    const staff = templeStore.getStaffById(cleanInput);

    if (!staff) {
      setError('अमान्य स्टाफ ID या पासवर्ड! कृपया सही विवरण दर्ज करें।');
      return;
    }

    if (!staff.active) {
      setError('यह स्टाफ खाता निष्क्रिय है। कृपया मंदिर व्यवस्थापक से संपर्क करें।');
      return;
    }

    if (staff.password !== password) {
      setError('अमान्य स्टाफ ID या पासवर्ड! कृपया सही विवरण दर्ज करें।');
      return;
    }

    setError('');
    setStaffId('');
    setPassword('');
    onSuccess(staff);
    onClose();
  };

  // Handle Staff Password Change
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError('');

    const cleanInput = changeStaffId.trim();
    if (!cleanInput) {
      setChangeError('कृपया अपनी स्टाफ ID या मोबाइल नंबर दर्ज करें।');
      return;
    }

    const staff = templeStore.getStaffById(cleanInput);
    if (!staff) {
      setChangeError('यह स्टाफ ID / मोबाइल नंबर रिकॉर्ड में नहीं मिला।');
      return;
    }

    if (staff.password !== currentPassword) {
      setChangeError('वर्तमान पासवर्ड गलत है! कृपया सही पासवर्ड दर्ज करें।');
      return;
    }

    if (newPassword.length < 4) {
      setChangeError('नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।');
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangeError('नया पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते!');
      return;
    }

    if (newPassword === currentPassword) {
      setChangeError('नया पासवर्ड वर्तमान पासवर्ड से भिन्न होना चाहिए।');
      return;
    }

    // Update in store
    templeStore.updateStaff(staff.id, { password: newPassword });

    // Success response & switch back to login
    setSuccessMsg(`पासवर्ड सफलतापूर्वक बदल दिया गया! कृपया नए पासवर्ड से लॉगिन करें।`);
    setStaffId(staff.id);
    setPassword('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setChangeError('');
    setMode('login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border-4 border-blue-600 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-700 to-blue-900 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-blue-300 mx-auto flex items-center justify-center mb-2 shadow-inner">
            {mode === 'login' ? (
              <Users className="w-8 h-8 text-blue-200" />
            ) : (
              <KeyRound className="w-8 h-8 text-amber-300" />
            )}
          </div>
          <h3 className="text-xl font-bold font-heading text-white">
            {mode === 'login' ? 'स्टाफ / पुजारी लॉगिन' : 'पासवर्ड बदलें'}
          </h3>
          <p className="text-xs text-blue-200 mt-0.5">
            {mode === 'login'
              ? 'माँ जगदंबा स्थान - सेवा एवं चंदा पोर्टल'
              : 'स्टाफ खाता सुरक्षा एवं पासवर्ड नवीनीकरण'}
          </p>
        </div>

        {/* Success Message Banner */}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* VIEW 1: STAFF LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                स्टाफ ID / मोबाइल <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-stone-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="स्टाफ ID या मोबाइल नंबर"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-blue-600 outline-hidden font-mono"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  पासवर्ड <span className="text-red-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('changePassword');
                    setError('');
                    setSuccessMsg('');
                    setChangeStaffId(staffId);
                  }}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 cursor-pointer flex items-center gap-1 hover:underline"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>पासवर्ड बदलें?</span>
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-stone-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="पासवर्ड दर्ज करें"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-blue-600 outline-hidden font-mono"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md cursor-pointer transition flex items-center justify-center gap-1.5 active:scale-98"
            >
              <Users className="w-4 h-4 text-blue-200" />
              <span>स्टाफ पोर्टल में लॉगिन करें</span>
            </button>

            {/* Change Password Prompt at bottom */}
            <div className="pt-2 text-center border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  setMode('changePassword');
                  setError('');
                  setSuccessMsg('');
                  setChangeStaffId(staffId);
                }}
                className="text-xs text-stone-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <span>अपना पासवर्ड बदलना चाहते हैं?</span>
                <span className="font-bold text-blue-700 underline">यहाँ क्लिक करें</span>
              </button>
            </div>
          </form>
        ) : (
          /* VIEW 2: CHANGE PASSWORD FORM */
          <form onSubmit={handleChangePassword} className="p-6 space-y-3.5">
            {changeError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{changeError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                स्टाफ ID / मोबाइल नंबर <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-stone-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="अपनी ID या मोबाइल नंबर दर्ज करें"
                  value={changeStaffId}
                  onChange={(e) => setChangeStaffId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-blue-600 outline-hidden font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                वर्तमान पासवर्ड (Old Password) <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-stone-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  required
                  placeholder="वर्तमान पासवर्ड"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-blue-600 outline-hidden font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                नया पासवर्ड (New Password) <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-stone-400">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  placeholder="नया पासवर्ड (कम से कम 4 अक्षर)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-blue-600 outline-hidden font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                नए पासवर्ड की पुष्टि करें <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-stone-400">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="नया पासवर्ड दोबारा दर्ज करें"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-blue-600 outline-hidden font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-sm shadow-md cursor-pointer transition flex items-center justify-center gap-1.5 mt-2 active:scale-98"
            >
              <KeyRound className="w-4 h-4" />
              <span>पासवर्ड अपडेट करें</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('login');
                setChangeError('');
              }}
              className="w-full py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer transition flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>वापस लॉगिन पर जाएँ (Back to Login)</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
