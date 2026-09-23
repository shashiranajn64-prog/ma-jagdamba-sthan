import React from 'react';
import { TempleConfig } from '../types';
import { MandirSeal, KalashIcon, OmIcon } from './TempleIcons';
import { MapPin, Phone, Mail, Globe, HeartHandshake, Shield, Users, Clock, ExternalLink } from 'lucide-react';

// TODO: Change to seva@maajagdambasthan.org after buying domain
const TRUST_EMAIL = 'maajagdambasthan.mathurapur@gmail.com';
const TRUST_PHONE = '+91 9709168876';
const TRUST_ADDRESS = 'मथुरापुर, मुजफ्फरपुर, बिहार - 843119';
const WEBSITE_URL = 'https://ma-jagdamba-sthan.ai.studio';

interface FooterProps {
  config: TempleConfig;
  onNavigate: (view: 'home' | 'gallery' | 'donation' | 'admin' | 'staff' | 'navratri') => void;
  onOpenAdminLogin: () => void;
  onOpenStaffLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  config,
  onNavigate,
  onOpenAdminLogin,
  onOpenStaffLogin,
}) => {
  return (
    <footer className="no-print bg-[#4a0000] text-amber-50 border-t-4 border-[#FFD700] relative overflow-hidden">
      {/* Decorative top pattern ribbon */}
      <div className="h-1.5 bg-gradient-to-r from-[#ff9933] via-[#FFD700] to-[#ff9933]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Temple Intro & Mohar */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MandirSeal size={48} className="text-[#FFD700] shrink-0" />
              <div>
                <h3 className="font-heading font-extrabold text-xl text-[#FFD700] leading-tight">
                  माँ जगदंबा स्थान
                </h3>
                <p className="text-xs text-amber-200">मथुरापुर, मुजफ्फरपुर (बिहार)</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              माँ जगदम्बा स्थान, मथुरापुर एक परम जागृत एवं ऐतिहासिक शक्तिपीठ है। यहाँ भगवती जगदम्बा की असीम कृपा से भक्तों के सभी मनोरथ पूर्ण होते हैं।
            </p>

            <div className="p-3 bg-black/25 rounded-xl border border-amber-500/20 text-xs space-y-1">
              <div className="text-[#FFD700] font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#ff9933]" />
                <span>नित्य आरती समय:</span>
              </div>
              <div className="text-[11px] text-amber-100 flex justify-between">
                <span>प्रातः मंगला आरती:</span>
                <span className="font-mono font-bold text-white">{config.aartiMorning}</span>
              </div>
              <div className="text-[11px] text-amber-100 flex justify-between">
                <span>संध्या महाआरती:</span>
                <span className="font-mono font-bold text-white">{config.aartiEvening}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#FFD700] border-b border-amber-500/30 pb-2">
              महत्वपूर्ण लिंक्स
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#FFD700] transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>•</span>
                  <span>मुख्य पृष्ठ (Home)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('gallery')}
                  className="hover:text-[#FFD700] transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>•</span>
                  <span>दर्शन दीर्घा (Photo Gallery)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('navratri')}
                  className="hover:text-[#FFD700] transition cursor-pointer flex items-center gap-1.5 text-[#FFD700] font-semibold"
                >
                  <span>•</span>
                  <span>नवरात्रि 9 रूप कथा (बोलकर सुनें)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('donation')}
                  className="hover:text-[#FFD700] transition cursor-pointer flex items-center gap-1.5 text-amber-300 font-bold"
                >
                  <span>•</span>
                  <span>ऑनलाइन दान करें (Online Donation)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenStaffLogin}
                  className="hover:text-blue-300 transition cursor-pointer flex items-center gap-1.5 text-blue-200"
                >
                  <span>•</span>
                  <span>स्टाफ / पुजारी लॉगिन (Staff Portal)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdminLogin}
                  className="hover:text-[#FFD700] transition cursor-pointer flex items-center gap-1.5 text-amber-300"
                >
                  <span>•</span>
                  <span>सुपर एडमिन लॉगिन (Admin Control)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Bank Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#FFD700] border-b border-amber-500/30 pb-2">
              सम्पर्क एवं पता
            </h4>
            <div className="space-y-2.5 text-xs text-stone-200">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#ff9933] shrink-0 mt-0.5" />
                <span>{TRUST_ADDRESS}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#ff9933] shrink-0" />
                <a href={`tel:${TRUST_PHONE.replace(/\s+/g, '')}`} className="hover:text-[#FFD700] font-mono">
                  {TRUST_PHONE}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#ff9933] shrink-0" />
                <a href={`mailto:${TRUST_EMAIL}`} className="hover:text-[#FFD700] break-all font-mono text-[11px]">
                  {TRUST_EMAIL}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-[#ff9933] shrink-0" />
                <a
                  href={WEBSITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#FFD700] break-all font-mono text-[11px] text-amber-300"
                >
                  {WEBSITE_URL}
                </a>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://maps.google.com/?q=Mathurapur+Muzaffarpur+Bihar"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#FFD700] text-xs font-bold transition border border-amber-500/30"
              >
                <MapPin className="w-3.5 h-3.5 text-[#ff9933]" />
                <span>गूगल मैप्स पर रास्ता देखें</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
          </div>

          {/* Col 4: Official Trust Information & Portal Access */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#FFD700] border-b border-amber-500/30 pb-2">
              प्रबंधन एवं अधिकृत पोर्टल
            </h4>
            <p className="text-xs text-stone-300">
              मंदिर प्रबंधन, दैनिक पूजा एवं चंदा संग्रह का संचालन अधिकृत पुजारियों एवं न्यास समिति द्वारा किया जाता है।
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={onOpenStaffLogin}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition"
              >
                <Users className="w-4 h-4" />
                <span>स्टाफ लॉगिन (Staff Login)</span>
              </button>

              <button
                onClick={onOpenAdminLogin}
                className="w-full py-2.5 px-3 rounded-xl bg-[#7a0000] hover:bg-[#990000] text-[#FFD700] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-[#FFD700]/50 shadow-sm transition"
              >
                <Shield className="w-4 h-4 text-[#FFD700]" />
                <span>एडमिन लॉगिन (Admin Login)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 pt-6 border-t border-amber-500/20 text-center text-xs text-stone-400 space-y-1">
          <p>
            © 2026 माँ जगदंबा स्थान न्यास समिति, मथुरापुर (मुजफ्फरपुर), बिहार। सर्वाधिकार सुरक्षित।
          </p>
          <p className="text-[11px] text-stone-500">
            होस्टेड ऑन: <span className="font-mono text-amber-300">https://ma-jagdamba-sthan.ai.studio</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
