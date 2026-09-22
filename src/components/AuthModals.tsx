import React, { useState } from 'react';
import { templeStore } from '../services/store';
import { Staff } from '../types';
import { Shield, Users, Eye, EyeOff, Lock, User, X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
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
            className="w-full py-3 rounded-xl bg-[#7a0000] hover:bg-[#990000] text-[#FFD700] font-bold text-sm shadow-md cursor-pointer transition flex items-center justify-center gap-1.5"
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
  const [staffId, setStaffId] = useState('ramesh01');
  const [password, setPassword] = useState('mandir123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const staff = templeStore.getStaffById(staffId.trim());

    if (!staff) {
      setError(`स्टाफ ID "${staffId}" नहीं मिली! कृपया एडमिन द्वारा दी गई ID दर्ज करें।`);
      return;
    }

    if (!staff.active) {
      setError('यह स्टाफ खाता निष्क्रिय है। कृपया मंदिर व्यवस्थापक से संपर्क करें।');
      return;
    }

    if (staff.password !== password) {
      setError('अमान्य स्टाफ पासवर्ड! (डिफ़ॉल्ट पासवर्ड: mandir123)');
      return;
    }

    setError('');
    onSuccess(staff);
    onClose();
  };

  const setPresetUser = (id: string) => {
    setStaffId(id);
    setPassword('mandir123');
    setError('');
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
            <Users className="w-8 h-8 text-blue-200" />
          </div>
          <h3 className="text-xl font-bold font-heading text-white">
            स्टाफ / पुजारी लॉगिन
          </h3>
          <p className="text-xs text-blue-200 mt-0.5">
            माँ जगदंबा स्थान - सेवा एवं चंदा संग्रह पोर्टल
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

          {/* Quick Preset Buttons for fast demo testing */}
          <div className="text-[11px] text-stone-500">
            <div className="font-semibold text-stone-700 mb-1">त्वरित डेमो टेस्ट हेतु चुनें:</div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setPresetUser('ramesh01')}
                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded border border-blue-200 cursor-pointer font-mono"
              >
                ramesh01 (पुजारी)
              </button>
              <button
                type="button"
                onClick={() => setPresetUser('manoj02')}
                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded border border-blue-200 cursor-pointer font-mono"
              >
                manoj02 (कैश)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              स्टाफ User ID <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-stone-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                placeholder="उदा: ramesh01"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-blue-600 outline-hidden font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              स्टाफ Password <span className="text-red-600">*</span>
            </label>
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
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md cursor-pointer transition flex items-center justify-center gap-1.5"
          >
            <Users className="w-4 h-4 text-blue-200" />
            <span>स्टाफ पोर्टल में लॉगिन करें</span>
          </button>
        </form>
      </div>
    </div>
  );
};
