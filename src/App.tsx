import React, { useState, useEffect } from 'react';
import { templeStore } from './services/store';
import { TempleConfig, Donation, Staff, Notice, CalendarItem } from './types';
import { Header } from './components/Header';
import { Ticker } from './components/Ticker';
import { HeroBanner } from './components/HeroBanner';
import { HomeTwoColumns } from './components/HomeTwoColumns';
import { NoticeModal } from './components/NoticeModal';
import { GalleryPage } from './components/GalleryPage';
import { DonationPage } from './components/DonationPage';
import { AdminPanel } from './components/AdminPanel';
import { StaffPanel } from './components/StaffPanel';
import { OfficialReceipt } from './components/OfficialReceipt';
import { StaffVerifyView } from './components/StaffVerifyView';
import { NavratriDetailPage } from './components/NavratriDetailPage';
import { PhotoLightbox } from './components/PhotoLightbox';
import { AdminLoginModal, StaffLoginModal } from './components/AuthModals';
import { Footer } from './components/Footer';

export function App() {
  const [config, setConfig] = useState<TempleConfig>(templeStore.getConfig());
  const [donations, setDonations] = useState<Donation[]>(templeStore.getDonations());
  const [notices, setNotices] = useState<Notice[]>(templeStore.getNotices());
  const [calendar, setCalendar] = useState<CalendarItem[]>(templeStore.getCalendar());
  const [, setAppVersion] = useState(0);

  // Navigation State
  const [currentView, setCurrentView] = useState<
    'home' | 'gallery' | 'donation' | 'admin' | 'staff' | 'receipt' | 'verify-staff' | 'navratri'
  >('home');
  const [selectedNavratriDay, setSelectedNavratriDay] = useState<string>('day-1');

  // Selected item for standalone receipt / staff verification / photo modal
  const [selectedReceipt, setSelectedReceipt] = useState<Donation | null>(null);
  const [verifyStaffId, setVerifyStaffId] = useState<string>('');
  const [selectedHomePhoto, setSelectedHomePhoto] = useState<any>(null);

  // Modals
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isStaffLoginOpen, setIsStaffLoginOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);

  // Authentication State (Do not auto-persist sensitive admin session)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [currentStaffUser, setCurrentStaffUser] = useState<Staff | null>(null);

  // Keep state updated on changes instantly across all components & tabs
  useEffect(() => {
    const syncAll = () => {
      setConfig(templeStore.getConfig());
      setDonations(templeStore.getDonations());
      setNotices(templeStore.getNotices());
      setCalendar(templeStore.getCalendar());
      setAppVersion((v) => v + 1);
    };

    const unsub = templeStore.subscribe(syncAll);

    const handleCustomStoreEvent = () => syncAll();
    window.addEventListener('mjs_store_change', handleCustomStoreEvent);

    // Clear any residual auth on initial load for maximum security
    localStorage.removeItem('mjs_admin_auth');
    localStorage.removeItem('mjs_staff_user');

    return () => {
      unsub();
      window.removeEventListener('mjs_store_change', handleCustomStoreEvent);
    };
  }, []);

  // Handle Initial Route Mount (Receipt or Staff Verification)
  useEffect(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;

    const receiptMatch = path.match(/\/receipt\/([^\/]+)/) || hash.match(/#\/receipt\/([^\/]+)/);
    if (receiptMatch && receiptMatch[1]) {
      const idOrNo = decodeURIComponent(receiptMatch[1]);
      const found = templeStore.getDonationByReceiptNo(idOrNo) || templeStore.getDonations().find((d) => d.id === idOrNo);
      if (found) {
        setSelectedReceipt(found);
        setCurrentView('receipt');
        return;
      }
    }

    const staffMatch = path.match(/\/verify-staff\/([^\/]+)/) || hash.match(/#\/verify-staff\/([^\/]+)/);
    if (staffMatch && staffMatch[1]) {
      const sid = decodeURIComponent(staffMatch[1]);
      setVerifyStaffId(sid);
      setCurrentView('verify-staff');
      return;
    }

    // Check /navratri/{dayId} or #/navratri/{dayId} or #navratri/{dayId}
    const navratriMatch =
      path.match(/\/navratri\/(day-[1-9])/i) ||
      hash.match(/#\/?navratri\/(day-[1-9])/i);
    if (navratriMatch && navratriMatch[1]) {
      setSelectedNavratriDay(navratriMatch[1].toLowerCase());
      setCurrentView('navratri');
      return;
    }
    if (path.includes('/navratri') || hash.includes('navratri')) {
      setCurrentView('navratri');
      return;
    }
  }, []);

  // Handle Browser Back / Popstate: ONCE BACK, ADMIN OR STAFF AUTO LOGOUT
  useEffect(() => {
    const handlePopState = () => {
      // If admin was logged in or viewing admin panel, auto-logout immediately on back
      if (isAdminLoggedIn || currentView === 'admin') {
        setIsAdminLoggedIn(false);
        localStorage.removeItem('mjs_admin_auth');
        sessionStorage.removeItem('mjs_admin_auth');
        setCurrentView('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // If staff was logged in or viewing staff panel, auto-logout immediately on back
      if (currentStaffUser || currentView === 'staff') {
        setCurrentStaffUser(null);
        localStorage.removeItem('mjs_staff_user');
        sessionStorage.removeItem('mjs_staff_user');
        setCurrentView('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const path = window.location.pathname;
      const hash = window.location.hash;

      const receiptMatch = path.match(/\/receipt\/([^\/]+)/) || hash.match(/#\/receipt\/([^\/]+)/);
      if (receiptMatch && receiptMatch[1]) {
        const idOrNo = decodeURIComponent(receiptMatch[1]);
        const found = templeStore.getDonationByReceiptNo(idOrNo) || templeStore.getDonations().find((d) => d.id === idOrNo);
        if (found) {
          setSelectedReceipt(found);
          setCurrentView('receipt');
          return;
        }
      }

      const staffMatch = path.match(/\/verify-staff\/([^\/]+)/) || hash.match(/#\/verify-staff\/([^\/]+)/);
      if (staffMatch && staffMatch[1]) {
        const sid = decodeURIComponent(staffMatch[1]);
        setVerifyStaffId(sid);
        setCurrentView('verify-staff');
        return;
      }

      // Check /navratri/{dayId} or #/navratri/{dayId} or #navratri/{dayId}
      const navratriMatch =
        path.match(/\/navratri\/(day-[1-9])/i) ||
        hash.match(/#\/?navratri\/(day-[1-9])/i);
      if (navratriMatch && navratriMatch[1]) {
        setSelectedNavratriDay(navratriMatch[1].toLowerCase());
        setCurrentView('navratri');
        return;
      }
      if (path.includes('/navratri') || hash.includes('navratri')) {
        setCurrentView('navratri');
        return;
      }

      setCurrentView('home');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAdminLoggedIn, currentStaffUser, currentView]);

  // Handle View Receipt
  const handleViewReceipt = (donation: Donation) => {
    setSelectedReceipt(donation);
    setCurrentView('receipt');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Admin Login Success
  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      window.history.pushState({ panel: 'admin' }, '', '#admin');
    } catch {}
  };

  // Handle Admin Logout
  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('mjs_admin_auth');
    sessionStorage.removeItem('mjs_admin_auth');
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      if (window.location.hash === '#admin') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch {}
  };

  // Handle Staff Login Success
  const handleStaffLoginSuccess = (staff: Staff) => {
    setCurrentStaffUser(staff);
    setCurrentView('staff');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      window.history.pushState({ panel: 'staff' }, '', '#staff');
    } catch {}
  };

  // Handle Staff Logout
  const handleStaffLogout = () => {
    setCurrentStaffUser(null);
    localStorage.removeItem('mjs_staff_user');
    sessionStorage.removeItem('mjs_staff_user');
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      if (window.location.hash === '#staff') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch {}
  };

  // Generic navigate handler: AUTO LOGOUT ADMIN OR STAFF WHEN LEAVING THEIR PANEL
  const handleNavigation = (tab: string) => {
    // If admin is logged in and navigates to anything other than 'admin', auto-logout
    if (isAdminLoggedIn && tab !== 'admin') {
      setIsAdminLoggedIn(false);
      localStorage.removeItem('mjs_admin_auth');
      sessionStorage.removeItem('mjs_admin_auth');
      try {
        if (window.location.hash === '#admin') {
          window.history.replaceState(null, '', window.location.pathname);
        }
      } catch {}
    }

    // If staff is logged in and navigates to anything other than 'staff', auto-logout
    if (currentStaffUser && tab !== 'staff') {
      setCurrentStaffUser(null);
      localStorage.removeItem('mjs_staff_user');
      sessionStorage.removeItem('mjs_staff_user');
      try {
        if (window.location.hash === '#staff') {
          window.history.replaceState(null, '', window.location.pathname);
        }
      } catch {}
    }

    if (tab === 'admin-login') {
      setIsAdminLoginOpen(true);
      return;
    }
    if (tab === 'staff-login') {
      setIsStaffLoginOpen(true);
      return;
    }
    if (tab === 'admin') {
      if (!isAdminLoggedIn) {
        setIsAdminLoginOpen(true);
        return;
      }
      setCurrentView('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (tab === 'staff') {
      if (!currentStaffUser) {
        setIsStaffLoginOpen(true);
        return;
      }
      setCurrentView('staff');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (tab === 'navratri' || tab.startsWith('navratri')) {
      if (tab.includes('day-')) {
        const parts = tab.split('day-');
        if (parts[1]) {
          setSelectedNavratriDay(`day-${parts[1]}`);
        }
      }
      setCurrentView('navratri');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (tab === 'home' || tab === 'gallery' || tab === 'donation') {
      setCurrentView(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fffbf2] text-stone-900 font-sans selection:bg-amber-200 selection:text-[#7a0000]">
      {/* 1. HEADER (Left: Title | Right: Home | Gallery | Donation | Admin Login (Red) | Staff Login (Blue) side by side) */}
      <Header
        currentTab={currentView}
        onNavigate={handleNavigation}
        isAdminLoggedIn={isAdminLoggedIn}
        isStaffLoggedIn={!!currentStaffUser}
        onLogoutAdmin={handleAdminLogout}
        onLogoutStaff={handleStaffLogout}
      />

      {/* 2. TOP SCROLLING TICKER (Maroon ribbon with approved donors) */}
      <Ticker donations={donations} />

      {/* MAIN VIEW CONTENT ROUTING */}
      <main className="flex-1">
        {/* VIEW 1: HOME PAGE */}
        {currentView === 'home' && (
          <div className="space-y-4">
            {/* HERO BANNER */}
            <HeroBanner
              config={config}
              onNavigate={handleNavigation}
              onOpenDarshan={() => handleNavigation('gallery')}
            />

            {/* TWO COLUMNS:
                Left (70%): About Mandir, History, Aarti Time, Gallery Grid
                Right (30%): Live Notice Board, Upcoming Festivals & Events */}
            <HomeTwoColumns
              config={config}
              notices={notices}
              calendar={calendar}
              onNavigateToDonation={() => handleNavigation('donation')}
              onNavigateToGallery={() => handleNavigation('gallery')}
              onOpenNoticeModal={() => setIsNoticeModalOpen(true)}
              onOpenPhotoModal={(photo) => setSelectedHomePhoto(photo)}
              isAdminLoggedIn={isAdminLoggedIn}
              onNavigateToAdmin={() => handleNavigation('admin')}
              onNavigateToNavratri={() => handleNavigation('navratri')}
            />
          </div>
        )}

        {/* VIEW 2: GALLERY PAGE */}
        {currentView === 'gallery' && (
          <GalleryPage
            config={config}
            onNavigateToDonation={() => handleNavigation('donation')}
          />
        )}

        {/* VIEW 3: DONATION PAGE (100% Free, No UTR, Only Screenshot) */}
        {currentView === 'donation' && (
          <DonationPage
            config={config}
            onNavigateHome={() => handleNavigation('home')}
          />
        )}

        {/* VIEW 4: ADMIN PANEL */}
        {currentView === 'admin' && (
          <AdminPanel
            onLogout={handleAdminLogout}
            onViewReceipt={handleViewReceipt}
          />
        )}

        {/* VIEW 5: STAFF PANEL */}
        {currentView === 'staff' && currentStaffUser && (
          <StaffPanel
            currentStaff={currentStaffUser}
            onLogout={handleStaffLogout}
            onViewReceipt={handleViewReceipt}
          />
        )}

        {/* VIEW 6: OFFICIAL RECEIPT */}
        {currentView === 'receipt' && selectedReceipt && (
          <OfficialReceipt
            donation={selectedReceipt}
            isStandalone
            onBack={() => {
              if (isAdminLoggedIn) {
                setCurrentView('admin');
              } else if (currentStaffUser) {
                setCurrentView('staff');
              } else {
                setCurrentView('home');
              }
            }}
          />
        )}

        {/* VIEW 7: STAFF VERIFY VIEW (PUBLIC LINK FROM ID CARD QR) */}
        {currentView === 'verify-staff' && (
          <StaffVerifyView
            staffId={verifyStaffId}
            staff={templeStore.getStaffById(verifyStaffId)}
            onBack={() => setCurrentView('home')}
          />
        )}

        {/* VIEW 8: NAVRATRI DETAIL PAGE (9 ROOP KATHA + SUNNE KA BUTTON) */}
        {currentView === 'navratri' && (
          <NavratriDetailPage
            initialDayId={selectedNavratriDay}
            onBackHome={() => handleNavigation('home')}
            onSelectDayUrl={(dayId) => setSelectedNavratriDay(dayId)}
          />
        )}
      </main>

      {/* FOOTER */}
      <Footer
        config={config}
        onNavigate={(tab) => handleNavigation(tab)}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenStaffLogin={() => setIsStaffLoginOpen(true)}
      />

      {/* Lightbox for Home Gallery Click */}
      {selectedHomePhoto && (
        <PhotoLightbox
          photo={selectedHomePhoto}
          onClose={() => setSelectedHomePhoto(null)}
        />
      )}

      {/* MODALS */}
      {/* Notice Board Full List Modal */}
      <NoticeModal
        notices={notices}
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />

      {/* Staff Login Modal */}
      <StaffLoginModal
        isOpen={isStaffLoginOpen}
        onClose={() => setIsStaffLoginOpen(false)}
        onSuccess={handleStaffLoginSuccess}
      />
    </div>
  );
}

export default App;
