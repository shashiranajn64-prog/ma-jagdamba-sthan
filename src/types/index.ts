export interface Donation {
  id: string;
  name: string;
  mobile: string;
  amount: number;
  date: string;
  timestamp: number;
  type: 'ONLINE' | 'CASH';
  screenshotUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  receiptNo?: string;
  receiptLink?: string;
  collectedBy?: {
    staffId: string;
    staffName: string;
  };
  sankalp?: string;
  gotra?: string;
  city?: string;
  rejectionReason?: string;
}

export interface Staff {
  id: string; // custom staff user ID e.g. "ramesh01"
  name: string;
  mobile: string;
  role: 'Pujari' | 'Cash' | 'Volunteer';
  password: string;
  photoUrl: string;
  joinDate: string;
  active: boolean;
}

export interface Notice {
  id: string;
  title: string;
  details: string;
  date: string;
  addedBy: string;
  addedByRole: 'Admin' | 'Staff';
  status: 'PENDING' | 'APPROVED';
}

export interface CalendarItem {
  id: string;
  title: string;
  date: string;
  description: string;
  tithi?: string;
  isMajor?: boolean;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  title: string;
  caption?: string;
}

export interface TempleConfig {
  upiId: string;
  qrImageUrl: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  adminId: string;
  adminPassword: string;
  aboutText: string;
  historyText: string;
  aartiMorning: string;
  aartiEvening: string;
  darshanTimings: string;
  galleryPhotos: GalleryPhoto[];
  googleSheetUrl?: string;
  googleSheetWebhookUrl?: string;
  googleSheetId?: string;
  googleSheetTitle?: string;
  googleSheetLastSyncedAt?: string;
  googleSheetConnectedAccount?: string;
  autoSyncToSheet?: boolean;
  // Home Page Customization
  heroBadge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroShloka?: string;
  heroImageUrl?: string;
  heroImageCaption?: string;
  heroImageSubCaption?: string;
  dailyQuote?: string;
}

export interface AdminLog {
  id: string;
  action: string;
  details: string;
  timestamp: number;
  adminUser: string;
}
