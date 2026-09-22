import React, { useState } from 'react';
import { Menu, X, Shield, Users, HeartHandshake, Home, Image, Flame, Sparkles, Volume2 } from 'lucide-react';
import { KalashIcon } from './TempleIcons';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  isAdminLoggedIn: boolean;
  isStaffLoggedIn: boolean;
  onLogoutAdmin: () => void;
  onLogoutStaff: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  isAdminLoggedIn,
  isStaffLoggedIn,
  onLogoutAdmin,
  onLogoutStaff,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab: string) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#7a0000] text-amber-50 shadow-xl border-b-2 border-[#FFD700]">
      {/* Top Auspicious Micro-bar */}
      <div className="bg-[#5a0000] text-amber-200/90 text-xs py-1 px-4 flex justify-between items-center border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <span className="text-[#FFD700] font-bold">ॐ श्री जगदम्बिकायै नमः</span>
          <span className="hidden sm:inline text-amber-400/60">•</span>
          <span className="hidden sm:inline text-amber-100/80">पावन शक्तिपीठ, मथुरापुर धाम</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-amber-300">
            <Flame className="w-3.5 h-3.5 text-[#ff9933] animate-pulse" />
            <span>अखंड ज्योति जाग्रत</span>
          </span>
          <span className="hidden md:inline text-amber-100/70 font-mono">+91 9709168876</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Left: Mandir Name & Sacred Emblem */}
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 text-left group transition cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#ff9933] to-[#FFD700] p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full rounded-full bg-[#7a0000] flex items-center justify-center text-[#FFD700] group-hover:scale-105 transition-transform">
                <KalashIcon className="w-6 h-6 text-[#FFD700]" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-heading tracking-wide text-amber-100 group-hover:text-[#FFD700] transition-colors leading-tight">
                माँ जगदंबा स्थान, मथुरापुर
              </div>
              <div className="text-[11px] sm:text-xs text-amber-300/90 tracking-wider uppercase font-medium">
                मुजफ्फरपुर, बिहार • सिद्ध शक्तिपीठ
              </div>
            </div>
          </button>

          {/* Desktop Right Menu: Home | Gallery | Donation | Admin Login (Red) | Staff Login (Blue) */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3">
            <button
              onClick={() => handleNav('home')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'home'
                  ? 'bg-amber-500/20 text-[#FFD700] border border-[#FFD700]/40 shadow-inner'
                  : 'text-amber-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => handleNav('gallery')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'gallery'
                  ? 'bg-amber-500/20 text-[#FFD700] border border-[#FFD700]/40 shadow-inner'
                  : 'text-amber-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Image className="w-4 h-4" />
              <span>Gallery</span>
            </button>

            <button
              onClick={() => handleNav('navratri')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'navratri'
                  ? 'bg-amber-500/30 text-[#FFD700] border border-[#FFD700]/60 shadow-inner'
                  : 'text-amber-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Volume2 className="w-4 h-4 text-[#FFD700]" />
              <span>नवरात्रि कथा</span>
            </button>

            <button
              onClick={() => handleNav('donation')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition shadow-md cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'donation'
                  ? 'bg-gradient-to-r from-[#ff9933] to-[#e68523] text-stone-950 ring-2 ring-[#FFD700]'
                  : 'bg-gradient-to-r from-[#ff9933] to-[#f58e2a] hover:from-[#f58e2a] hover:to-[#ff9933] text-stone-950 hover:shadow-lg'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-stone-950" />
              <span>Donation (दान)</span>
            </button>

            <div className="h-6 w-px bg-amber-500/30 mx-1" />

            {/* Admin Login (Red Button) */}
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleNav('admin')}
                  className={`px-3.5 py-2 rounded-lg text-xs lg:text-sm font-bold transition cursor-pointer flex items-center gap-1.5 bg-red-700 hover:bg-red-800 text-white shadow-md border border-red-400 ${
                    currentTab === 'admin' ? 'ring-2 ring-[#FFD700]' : ''
                  }`}
                >
                  <Shield className="w-4 h-4 text-[#FFD700]" />
                  <span>Admin Panel</span>
                </button>
                <button
                  onClick={onLogoutAdmin}
                  className="px-2 py-2 rounded-lg text-xs bg-black/40 hover:bg-black/60 text-amber-200 transition cursor-pointer"
                  title="एडमिन लॉगआउट"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNav('admin-login')}
                className="px-3.5 py-2 rounded-lg text-xs lg:text-sm font-bold transition cursor-pointer flex items-center gap-1.5 bg-[#990000] hover:bg-red-700 text-white shadow-md border border-red-500/60 hover:border-red-400"
              >
                <Shield className="w-4 h-4 text-[#FFD700]" />
                <span>Admin Login</span>
              </button>
            )}

            {/* Staff Login (Blue Button) side by side */}
            {isStaffLoggedIn ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleNav('staff')}
                  className={`px-3.5 py-2 rounded-lg text-xs lg:text-sm font-bold transition cursor-pointer flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-md border border-blue-400 ${
                    currentTab === 'staff' ? 'ring-2 ring-blue-300' : ''
                  }`}
                >
                  <Users className="w-4 h-4 text-blue-200" />
                  <span>Staff Portal</span>
                </button>
                <button
                  onClick={onLogoutStaff}
                  className="px-2 py-2 rounded-lg text-xs bg-black/40 hover:bg-black/60 text-blue-200 transition cursor-pointer"
                  title="स्टाफ लॉगआउट"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNav('staff-login')}
                className="px-3.5 py-2 rounded-lg text-xs lg:text-sm font-bold transition cursor-pointer flex items-center gap-1.5 bg-[#1e40af] hover:bg-blue-600 text-white shadow-md border border-blue-400/70 hover:border-blue-300"
              >
                <Users className="w-4 h-4 text-blue-200" />
                <span>Staff Login</span>
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => handleNav('donation')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#ff9933] text-stone-950 flex items-center gap-1 shadow"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>दान</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-black/20 text-amber-200 hover:text-white hover:bg-black/40 transition cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#5a0000] border-t border-amber-500/30 px-4 pt-3 pb-5 space-y-2 shadow-2xl">
          <button
            onClick={() => handleNav('home')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2.5 ${
              currentTab === 'home' ? 'bg-[#7a0000] text-[#FFD700]' : 'text-amber-100 hover:bg-white/5'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home (मुख्य पृष्ठ)</span>
          </button>

          <button
            onClick={() => handleNav('gallery')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2.5 ${
              currentTab === 'gallery' ? 'bg-[#7a0000] text-[#FFD700]' : 'text-amber-100 hover:bg-white/5'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>Gallery (दर्शन चित्र)</span>
          </button>

          <button
            onClick={() => handleNav('navratri')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2.5 ${
              currentTab === 'navratri' ? 'bg-[#7a0000] text-[#FFD700] ring-1 ring-[#FFD700]' : 'text-amber-100 hover:bg-white/5'
            }`}
          >
            <Volume2 className="w-4 h-4 text-[#FFD700]" />
            <span>नवरात्रि 9 रूप कथा (बोलकर सुनें)</span>
          </button>

          <button
            onClick={() => handleNav('donation')}
            className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold bg-gradient-to-r from-[#ff9933] to-[#f58e2a] text-stone-950 flex items-center gap-2.5 shadow"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Donation (सहयोग / दान करें)</span>
          </button>

          <div className="pt-2 border-t border-amber-500/20 grid grid-cols-2 gap-2">
            {isAdminLoggedIn ? (
              <button
                onClick={() => handleNav('admin')}
                className="w-full text-center px-3 py-2 rounded-lg text-xs font-bold bg-red-700 text-white border border-red-400 flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-[#FFD700]" />
                <span>Admin Panel</span>
              </button>
            ) : (
              <button
                onClick={() => handleNav('admin-login')}
                className="w-full text-center px-3 py-2 rounded-lg text-xs font-bold bg-[#990000] text-white border border-red-500 flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-[#FFD700]" />
                <span>Admin Login</span>
              </button>
            )}

            {isStaffLoggedIn ? (
              <button
                onClick={() => handleNav('staff')}
                className="w-full text-center px-3 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white border border-blue-400 flex items-center justify-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-blue-200" />
                <span>Staff Portal</span>
              </button>
            ) : (
              <button
                onClick={() => handleNav('staff-login')}
                className="w-full text-center px-3 py-2 rounded-lg text-xs font-bold bg-[#1e40af] text-white border border-blue-400 flex items-center justify-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-blue-200" />
                <span>Staff Login</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
